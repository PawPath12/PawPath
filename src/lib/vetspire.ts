// Server-only Vetspire GraphQL client.
//
// Used for clinics whose `bookingProvider === "VETSPIRE"`: availability and
// appointments live in the clinic's Vetspire location instead of our own tables.
// The API key is read from the VETSPIRE_API_KEY env var and NEVER sent to the
// browser — every function here must run on the server (server components /
// server actions only).
//
// Auth format is `Authorization: <key>` with NO "Bearer" prefix (per Vetspire
// docs and verified against the live API).
//
// NOTE: this module reads VETSPIRE_API_KEY from the environment and must only be
// imported from server code (server components / server actions). Do not import
// it into a client component.

const ENDPOINT = "https://api.vetspire.com/graphql";

// Brighton Beach is in Brooklyn; Vetspire returns/expects wall-clock times in the
// location's timezone. If PawPath ever onboards Vetspire clinics in other zones,
// promote this to a per-clinic column.
const DEFAULT_TIMEZONE = "America/New_York";

/** PawPath species (see constants.ts) → Vetspire species strings. */
const SPECIES_MAP: Record<string, string> = {
  Dog: "Canine",
  Cat: "Feline",
  Bird: "Avian",
  Rabbit: "Rabbit",
  Reptile: "Reptile",
  Other: "Other",
};

export function vetspireConfigured(): boolean {
  return Boolean(process.env.VETSPIRE_API_KEY);
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const key = process.env.VETSPIRE_API_KEY;
  if (!key) throw new Error("VETSPIRE_API_KEY is not set");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: key },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Vetspire API error: ${JSON.stringify(json.errors)}`);
  }
  if (!json.data) throw new Error("Vetspire API returned no data");
  return json.data;
}

// ---------------------------------------------------------------------------
// Timezone helper: convert a location wall-clock (date + "HH:mm") to a UTC ISO
// instant, accounting for the zone's current offset (handles EST/EDT).
// ---------------------------------------------------------------------------
function zonedWallClockToUtcISO(dateStr: string, timeStr: string, timeZone = DEFAULT_TIMEZONE): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const asIfUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Offset (in ms) that `timeZone` had at that instant.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = dtf.formatToParts(new Date(asIfUtc));
  const map: Record<string, number> = {};
  for (const p of parts) if (p.type !== "literal") map[p.type] = Number(p.value);
  const asZoned = Date.UTC(map.year, map.month - 1, map.day, map.hour === 24 ? 0 : map.hour, map.minute);
  const offset = asZoned - asIfUtc;
  return new Date(asIfUtc - offset).toISOString();
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type VetspireAppointmentType = {
  id: string;
  name: string;
  duration: number | null;
  canBookOnline: boolean | null;
  isDefault: boolean | null;
};

/** Online-bookable appointment types for a location (these are the "services"). */
export async function listOnlineAppointmentTypes(locationId: string): Promise<VetspireAppointmentType[]> {
  const data = await gql<{ locationAppointmentTypes: VetspireAppointmentType[] }>(
    `query($loc: ID!){
       locationAppointmentTypes(locationId: $loc) { id name duration canBookOnline isDefault }
     }`,
    { loc: locationId },
  );
  return (data.locationAppointmentTypes ?? []).filter((t) => t.canBookOnline);
}

export type VetspireSlot = {
  /** UTC ISO instant for the slot start. */
  startISO: string;
  /** Wall-clock "HH:mm" in the location timezone (for display). */
  time: string;
  providerId: string | null;
  scheduleId: string | null;
};

/** Open appointment slots for a given type + calendar date (YYYY-MM-DD). */
export async function availableTimes(
  locationId: string,
  appointmentTypeId: string,
  date: string,
): Promise<VetspireSlot[]> {
  const data = await gql<{
    availableTimes: { time: string; providerId: string | null; scheduleId: string | null }[];
  }>(
    `query($t: ID!, $d: Date!, $loc: ID!){
       availableTimes(appointmentTypeId: $t, date: $d, locationId: $loc, numberOfPets: 1) {
         time providerId scheduleId
       }
     }`,
    { t: appointmentTypeId, d: date, loc: locationId },
  );
  return (data.availableTimes ?? []).map((s) => ({
    time: s.time,
    providerId: s.providerId,
    scheduleId: s.scheduleId,
    startISO: zonedWallClockToUtcISO(date, s.time),
  }));
}

export type VetspireClientAppointment = {
  id: string;
  startISO: string;
  status: string;
  petName: string | null;
  locationId: string | null;
};

/**
 * Upcoming appointments for a person (matched by email) across the org's Vetspire
 * locations. Returns [] if they have no Vetspire client record. Used to surface
 * Vetspire-booked visits back on the PawPath "My Appointments" page.
 */
export async function listUpcomingClientAppointments(email: string): Promise<VetspireClientAppointment[]> {
  const found = await gql<{ clients: { id: string }[] }>(
    `query($f: ClientFilters){ clients(filters: $f, limit: 1){ id } }`,
    { f: { email } },
  );
  const clientId = found.clients?.[0]?.id;
  if (!clientId) return [];

  const data = await gql<{
    appointments: { id: string; start: string; status: string; patient: { name: string } | null; location: { id: string } | null }[];
  }>(
    `query($cid: ID!, $start: DateTime!){
       appointments(clientId: $cid, start: $start, limit: 50){
         id start status patient { name } location { id }
       }
     }`,
    { cid: clientId, start: new Date().toISOString() },
  );
  return (data.appointments ?? []).map((a) => ({
    id: a.id,
    startISO: a.start,
    status: a.status,
    petName: a.patient?.name ?? null,
    locationId: a.location?.id ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Writes (booking orchestration)
// ---------------------------------------------------------------------------

export type ClientContact = {
  phone?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  } | null;
};

function phoneNumbersInput(contact: ClientContact) {
  return contact.phone ? [{ value: contact.phone, preferred: true, reminders: true }] : undefined;
}

function addressesInput(contact: ClientContact) {
  const a = contact.address;
  if (!a || !(a.line1 || a.city || a.state || a.postalCode)) return undefined;
  return [
    {
      line1: a.line1 ?? undefined,
      line2: a.line2 ?? undefined,
      city: a.city ?? undefined,
      state: a.state ?? undefined,
      postalCode: a.postalCode ?? undefined,
      country: "US",
      isPrimary: true,
    },
  ];
}

/**
 * Find an existing Vetspire client by email, or create one — with phone + address
 * so the chart is complete. For an existing client, fills in phone/address only if
 * they're currently missing (avoids duplicating entries on repeat bookings).
 */
async function findOrCreateClient(input: {
  email: string;
  givenName: string;
  familyName: string;
  locationId: string;
  contact: ClientContact;
}): Promise<string> {
  const found = await gql<{
    clients: { id: string; phoneNumbers: { id: string }[]; addresses: { id: string }[] }[];
  }>(
    `query($f: ClientFilters){ clients(filters: $f, limit: 1){ id phoneNumbers { id } addresses { id } } }`,
    { f: { email: input.email } },
  );

  const existing = found.clients?.[0];
  if (existing) {
    // Backfill contact info only where the client has none yet.
    const patch: Record<string, unknown> = {};
    if ((existing.phoneNumbers?.length ?? 0) === 0) {
      const phones = phoneNumbersInput(input.contact);
      if (phones) patch.phoneNumbers = phones;
    }
    if ((existing.addresses?.length ?? 0) === 0) {
      const addrs = addressesInput(input.contact);
      if (addrs) patch.addresses = addrs;
    }
    if (Object.keys(patch).length > 0) {
      await gql(`mutation($id: ID!, $i: ClientInput!){ updateClient(id: $id, input: $i){ id } }`, {
        id: existing.id,
        i: patch,
      });
    }
    return existing.id;
  }

  const created = await gql<{ createClient: { id: string } }>(
    `mutation($i: ClientInput){ createClient(input: $i){ id } }`,
    {
      i: {
        givenName: input.givenName,
        familyName: input.familyName || input.givenName,
        email: input.email,
        primaryLocationId: input.locationId,
        phoneNumbers: phoneNumbersInput(input.contact),
        addresses: addressesInput(input.contact),
      },
    },
  );
  return created.createClient.id;
}

/** Find a patient (by name) under a client, or create one. */
async function findOrCreatePatient(
  clientId: string,
  input: { name: string; species: string; breed?: string | null },
): Promise<string> {
  const found = await gql<{ patients: { id: string; name: string }[] }>(
    `query($f: PatientFilters){ patients(filters: $f, limit: 50){ id name } }`,
    { f: { clientId } },
  );
  const match = found.patients?.find((p) => p.name.toLowerCase() === input.name.toLowerCase());
  if (match) return match.id;

  const created = await gql<{ createPatient: { id: string } }>(
    `mutation($c: ID!, $i: PatientInput){ createPatient(clientId: $c, input: $i){ id } }`,
    {
      c: clientId,
      i: {
        name: input.name,
        species: SPECIES_MAP[input.species] ?? "Other",
        breed: input.breed ?? undefined,
      },
    },
  );
  return created.createPatient.id;
}

/**
 * Full online-booking orchestration: ensure the client + pet exist in Vetspire,
 * then create the appointment. Returns the appointment id AND the patient id (the
 * latter so the caller can attach uploaded records to the chart).
 */
export async function bookAppointment(params: {
  locationId: string;
  appointmentTypeId: string;
  startISO: string;
  durationMin: number;
  providerId?: string | null;
  reason?: string;
  note?: string;
  client: { email: string; givenName: string; familyName: string; contact: ClientContact };
  pet: { name: string; species: string; breed?: string | null };
}): Promise<{ appointmentId: string; patientId: string }> {
  const clientId = await findOrCreateClient({ ...params.client, locationId: params.locationId });
  const patientId = await findOrCreatePatient(clientId, params.pet);

  const created = await gql<{ createAppointment: { id: string } }>(
    `mutation($i: AppointmentInput!){ createAppointment(input: $i){ id } }`,
    {
      i: {
        patientId,
        locationId: params.locationId,
        appointmentTypeId: params.appointmentTypeId,
        providerId: params.providerId ?? undefined,
        start: params.startISO,
        duration: params.durationMin,
        reason: params.reason ?? "Booked online via PawPath",
        note: params.note || undefined,
        status: "PENDING",
        bookedOnline: true,
        sendConfirmation: true,
      },
    },
  );
  return { appointmentId: created.createAppointment.id, patientId };
}

/**
 * Attach a file to a patient's Vetspire chart. Uses Absinthe's multipart upload
 * convention (the Upload variable references a form-field name). Best-effort:
 * returns {ok:false} on failure rather than throwing, so a bad upload never
 * blocks a completed booking.
 */
export async function uploadPatientDocument(
  patientId: string,
  file: { filename: string; mimeType: string; bytes: Uint8Array },
  opts?: { name?: string; locationId?: string; category?: string },
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.VETSPIRE_API_KEY;
  if (!key) return { ok: false, error: "VETSPIRE_API_KEY is not set" };

  const mutation = `mutation($doc: Upload!, $pid: ID!, $name: String!, $loc: ID, $cat: String){
    uploadPatientDocument(document: $doc, patientId: $pid, name: $name, locationId: $loc, category: $cat){ id }
  }`;

  const form = new FormData();
  form.append(
    "variables",
    JSON.stringify({
      doc: "file0", // Absinthe: the Upload variable's value is the form-field name
      pid: patientId,
      name: opts?.name ?? file.filename,
      loc: opts?.locationId ?? null,
      cat: opts?.category ?? "Medical Records",
    }),
  );
  form.append("query", mutation);
  // Blob copy keeps a clean ArrayBuffer backing regardless of the source view.
  form.append("file0", new Blob([file.bytes.slice()], { type: file.mimeType }), file.filename);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: key },
      body: form,
    });
    const json = (await res.json()) as { data?: { uploadPatientDocument?: { id: string } }; errors?: unknown };
    if (json.errors) return { ok: false, error: JSON.stringify(json.errors) };
    return { ok: true, id: json.data?.uploadPatientDocument?.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
