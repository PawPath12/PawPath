import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const PASSWORD = "password123";

// Weekday 09:00–17:00 availability for every staff vet.
const WEEKDAY_WINDOWS = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "09:00",
  endTime: "17:00",
}));

function daysFromNow(days: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

type ClinicSeed = {
  slugOwnerEmail: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  description: string;
  vets: { name: string; specialties: string; bio: string }[];
  services: { name: string; description: string; priceCents: number; durationMin: number }[];
  reviews: { rating: number; comment: string; author: string }[];
};

const CLINICS: ClinicSeed[] = [
  {
    slugOwnerEmail: "happy@demo.com",
    name: "Happy Paws Veterinary",
    city: "New York, NY",
    address: "112 W 34th St, New York, NY",
    phone: "(212) 555-0100",
    description:
      "A full-service companion animal hospital in Midtown Manhattan. Gentle, fear-free care for dogs, cats, and small pets.",
    vets: [
      { name: "Dr. Sarah Chen", specialties: "General Practice, Dentistry", bio: "12 years caring for city pets with a focus on preventive medicine." },
      { name: "Dr. Marcus Reed", specialties: "Surgery, Orthopedics", bio: "Board-certified surgeon and proud dog dad of two rescues." },
    ],
    services: [
      { name: "Wellness Exam", description: "Comprehensive nose-to-tail checkup.", priceCents: 6500, durationMin: 30 },
      { name: "Vaccination", description: "Core and lifestyle vaccines.", priceCents: 3500, durationMin: 20 },
      { name: "Dental Cleaning", description: "Full dental scaling and polish under anesthesia.", priceCents: 32000, durationMin: 90 },
      { name: "Spay / Neuter", description: "Routine sterilization surgery.", priceCents: 28000, durationMin: 60 },
    ],
    reviews: [
      { rating: 5, comment: "Dr. Chen was so gentle with my anxious cat. Highly recommend!", author: "alice@demo.com" },
      { rating: 5, comment: "Quick, clean, and caring. Booking online was a breeze.", author: "bob@demo.com" },
      { rating: 4, comment: "Great care, waiting room was a little busy.", author: "carol@demo.com" },
    ],
  },
  {
    slugOwnerEmail: "specialists@demo.com",
    name: "Metropolitan Veterinary Specialists",
    city: "New York, NY",
    address: "410 E 62nd St, New York, NY",
    phone: "(212) 555-0233",
    description:
      "A referral center bringing board-certified specialists — cardiology, oncology, neurology, and ophthalmology — together under one roof for advanced diagnostics and treatment.",
    vets: [
      { name: "Dr. Amina Yusuf, DACVIM", specialties: "Cardiology", bio: "Board-certified cardiologist specializing in echocardiography and heart disease." },
      { name: "Dr. Ravi Kapoor, DACVIM", specialties: "Oncology", bio: "Compassionate cancer care and chemotherapy for pets and their families." },
      { name: "Dr. Grace Liu, DACVIM", specialties: "Neurology", bio: "Neurology and neurosurgery, from seizures to spinal injuries." },
      { name: "Dr. Sofia Rossi, DACVO", specialties: "Ophthalmology", bio: "Advanced eye care and microsurgery for all species." },
    ],
    services: [
      { name: "Cardiology Consult", description: "Specialist evaluation with echocardiogram.", priceCents: 28000, durationMin: 60 },
      { name: "Oncology Consult", description: "Cancer staging and treatment planning.", priceCents: 30000, durationMin: 60 },
      { name: "Neurology Consult", description: "Advanced neurological assessment.", priceCents: 30000, durationMin: 60 },
      { name: "MRI Scan", description: "High-resolution imaging under anesthesia.", priceCents: 220000, durationMin: 90 },
      { name: "Ophthalmology Exam", description: "Comprehensive specialist eye exam.", priceCents: 24000, durationMin: 45 },
    ],
    reviews: [
      { rating: 5, comment: "Dr. Yusuf caught my dog's heart condition early. Lifesavers.", author: "bob@demo.com" },
      { rating: 5, comment: "The oncology team treated us with such compassion.", author: "carol@demo.com" },
      { rating: 5, comment: "Cutting-edge care you can't find anywhere else.", author: "alice@demo.com" },
    ],
  },
  {
    slugOwnerEmail: "brooklyn@demo.com",
    name: "Brooklyn Bridge Animal Hospital",
    city: "Brooklyn, NY",
    address: "88 Atlantic Ave, Brooklyn, NY",
    phone: "(718) 555-0142",
    description:
      "Trusted Brooklyn Heights hospital offering everything from routine wellness to advanced diagnostics, dermatology, and emergency care.",
    vets: [
      { name: "Dr. Priya Nair", specialties: "Internal Medicine", bio: "Passionate about chronic disease management and senior pets." },
      { name: "Dr. Tom Alvarez", specialties: "Emergency & Critical Care", bio: "Calm hands in a crisis, 15 years of ER experience." },
      { name: "Dr. Lena Park", specialties: "Dermatology", bio: "Helping itchy pets find relief since 2015." },
    ],
    services: [
      { name: "Wellness Exam", description: "Annual physical and health screening.", priceCents: 6000, durationMin: 30 },
      { name: "Emergency Visit", description: "Urgent same-day assessment.", priceCents: 15000, durationMin: 45 },
      { name: "Dermatology Consult", description: "Allergy and skin specialist visit.", priceCents: 13000, durationMin: 45 },
      { name: "Bloodwork Panel", description: "Complete blood count and chemistry.", priceCents: 12000, durationMin: 30 },
    ],
    reviews: [
      { rating: 5, comment: "Saved my dog during an after-hours emergency. Forever grateful.", author: "bob@demo.com" },
      { rating: 4, comment: "Professional staff and fair prices.", author: "alice@demo.com" },
      { rating: 5, comment: "Dr. Park cleared up my pup's skin issues fast.", author: "carol@demo.com" },
      { rating: 4, comment: "Solid care, parking can be tricky.", author: "dave@demo.com" },
    ],
  },
  {
    slugOwnerEmail: "la@demo.com",
    name: "Sunset Pet Care",
    city: "Los Angeles, CA",
    address: "7100 Sunset Blvd, Los Angeles, CA",
    phone: "(323) 555-0170",
    description:
      "A bright, modern West Coast practice focused on preventive care, behavior, and unhurried appointments.",
    vets: [
      { name: "Dr. Omar Haddad", specialties: "General Practice", bio: "Friendly generalist and marathon runner." },
      { name: "Dr. Nina Alvarez", specialties: "Behavior", bio: "Helping pets and people thrive together." },
    ],
    services: [
      { name: "Wellness Exam", description: "Thorough physical with time for questions.", priceCents: 7000, durationMin: 40 },
      { name: "Behavior Consult", description: "Plan for anxiety and training challenges.", priceCents: 9000, durationMin: 60 },
      { name: "Vaccination", description: "Core and travel vaccines.", priceCents: 3800, durationMin: 20 },
      { name: "Grooming", description: "Bath, nails, and tidy trim.", priceCents: 5000, durationMin: 60 },
    ],
    reviews: [
      { rating: 5, comment: "The behavior consult changed our lives!", author: "carol@demo.com" },
      { rating: 4, comment: "Loved the online booking and reminders.", author: "dave@demo.com" },
    ],
  },
  {
    slugOwnerEmail: "chicago@demo.com",
    name: "Lakeview Companion Animal",
    city: "Chicago, IL",
    address: "3200 N Clark St, Chicago, IL",
    phone: "(312) 555-0188",
    description:
      "A neighborhood clinic blending preventive medicine and nutrition in a calm, spa-like environment.",
    vets: [
      { name: "Dr. Ethan Brooks", specialties: "Preventive Care", bio: "Wellness plans that keep pets healthy for life." },
      { name: "Dr. Hannah Cohen", specialties: "Nutrition, Dermatology", bio: "Believes great health starts in the food bowl." },
    ],
    services: [
      { name: "Wellness Exam", description: "Relaxed, comprehensive exam.", priceCents: 6200, durationMin: 30 },
      { name: "Nutrition Consult", description: "Tailored diet and weight plan.", priceCents: 5500, durationMin: 30 },
      { name: "Vaccination", description: "Core vaccines.", priceCents: 3400, durationMin: 20 },
      { name: "Senior Care Package", description: "Screening bundle for pets 7+.", priceCents: 18000, durationMin: 60 },
    ],
    reviews: [
      { rating: 5, comment: "Never felt rushed. They truly listen.", author: "alice@demo.com" },
      { rating: 5, comment: "Kind, thoughtful, and thorough.", author: "dave@demo.com" },
    ],
  },
  {
    slugOwnerEmail: "miami@demo.com",
    name: "Bayshore Pet Wellness",
    city: "Miami, FL",
    address: "2100 Biscayne Blvd, Miami, FL",
    phone: "(305) 555-0155",
    description:
      "Wellness-focused practice with a strong dentistry and surgery team and a calm, welcoming space.",
    vets: [
      { name: "Dr. Lucas Silva", specialties: "Dentistry, Surgery", bio: "Bright smiles and steady hands for furry patients." },
      { name: "Dr. Maria Gomez", specialties: "Feline Medicine", bio: "A cat whisperer devoted to low-stress feline care." },
    ],
    services: [
      { name: "Wellness Exam", description: "Comprehensive exam for cats and dogs.", priceCents: 7500, durationMin: 40 },
      { name: "Dental Cleaning", description: "Gentle dental scaling and polish.", priceCents: 34000, durationMin: 90 },
      { name: "Vaccination", description: "Core and lifestyle vaccines.", priceCents: 4000, durationMin: 20 },
      { name: "Spay / Neuter", description: "Safe routine surgery.", priceCents: 30000, durationMin: 60 },
    ],
    reviews: [
      { rating: 5, comment: "Feels more like a spa than a vet. My dog loves it.", author: "alice@demo.com" },
      { rating: 4, comment: "Premium care, premium price — worth it.", author: "bob@demo.com" },
    ],
  },
];

const CLIENTS = [
  {
    email: "alice@demo.com",
    name: "Alice Nguyen",
    pets: [
      { name: "Baxter", species: "Dog", breed: "Golden Retriever", ageYears: 4, notes: "Loves belly rubs, mild hip stiffness." },
      { name: "Whiskers", species: "Cat", breed: "Domestic Shorthair", ageYears: 7, notes: "Indoor cat, gets anxious at the vet." },
    ],
  },
  {
    email: "bob@demo.com",
    name: "Bob Smith",
    pets: [{ name: "Rex", species: "Dog", breed: "German Shepherd", ageYears: 3, notes: "High energy, up to date on vaccines." }],
  },
  {
    email: "carol@demo.com",
    name: "Carol Lee",
    pets: [{ name: "Peanut", species: "Rabbit", breed: "Holland Lop", ageYears: 2, notes: "Needs gentle handling." }],
  },
  {
    email: "dave@demo.com",
    name: "Dave Patel",
    pets: [{ name: "Kiwi", species: "Bird", breed: "Budgerigar", ageYears: 1, notes: "Very chatty in the mornings." }],
  },
];

async function reset() {
  // Delete in FK-safe order.
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.service.deleteMany();
  await prisma.vet.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log("Resetting database…");
  await reset();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // --- Clients ---
  const clientByEmail = new Map<string, { id: string }>();
  for (const c of CLIENTS) {
    const user = await prisma.user.create({
      data: { email: c.email, name: c.name, role: "CLIENT", passwordHash },
    });
    clientByEmail.set(c.email, user);
    for (const p of c.pets) {
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - p.ageYears);
      await prisma.pet.create({
        data: {
          ownerId: user.id,
          name: p.name,
          species: p.species,
          breed: p.breed,
          birthdate,
          notes: p.notes,
        },
      });
    }
  }

  // --- Clinics (each owned by a VET user) ---
  const clinicByName = new Map<string, { id: string; firstVetId: string; firstServiceId: string }>();
  for (const c of CLINICS) {
    const owner = await prisma.user.create({
      data: {
        email: c.slugOwnerEmail,
        name: c.vets[0].name,
        role: "VET",
        passwordHash,
      },
    });
    const clinic = await prisma.clinic.create({
      data: {
        name: c.name,
        city: c.city,
        address: c.address,
        phone: c.phone,
        description: c.description,
        ownerUserId: owner.id,
      },
    });

    // Staff vets + weekday availability.
    let firstVetId = "";
    for (let i = 0; i < c.vets.length; i++) {
      const v = c.vets[i];
      const vet = await prisma.vet.create({
        data: {
          clinicId: clinic.id,
          name: v.name,
          specialties: v.specialties,
          bio: v.bio,
          // Link the first vet to the owner login so the dashboard has a "me".
          userId: i === 0 ? owner.id : null,
        },
      });
      if (i === 0) firstVetId = vet.id;
      for (const w of WEEKDAY_WINDOWS) {
        await prisma.availability.create({
          data: { clinicId: clinic.id, vetId: vet.id, ...w },
        });
      }
    }

    // Services.
    let firstServiceId = "";
    for (let i = 0; i < c.services.length; i++) {
      const s = await prisma.service.create({
        data: { clinicId: clinic.id, ...c.services[i] },
      });
      if (i === 0) firstServiceId = s.id;
    }

    // Reviews + rating rollup.
    let sum = 0;
    for (const r of c.reviews) {
      const author = clientByEmail.get(r.author);
      if (!author) continue;
      await prisma.review.create({
        data: {
          clinicId: clinic.id,
          authorId: author.id,
          rating: r.rating,
          comment: r.comment,
        },
      });
      sum += r.rating;
    }
    if (c.reviews.length) {
      await prisma.clinic.update({
        where: { id: clinic.id },
        data: {
          reviewCount: c.reviews.length,
          avgRating: Math.round((sum / c.reviews.length) * 10) / 10,
        },
      });
    }

    clinicByName.set(c.name, { id: clinic.id, firstVetId, firstServiceId });
  }

  // --- Sample appointments for Alice at Happy Paws ---
  const alice = clientByEmail.get("alice@demo.com")!;
  const baxter = await prisma.pet.findFirst({ where: { ownerId: alice.id, name: "Baxter" } });
  const happy = clinicByName.get("Happy Paws Veterinary")!;

  if (baxter) {
    // Past, completed → reviewable.
    await prisma.appointment.create({
      data: {
        clientId: alice.id,
        petId: baxter.id,
        clinicId: happy.id,
        vetId: happy.firstVetId,
        serviceId: happy.firstServiceId,
        startAt: daysFromNow(-10, 10),
        endAt: daysFromNow(-10, 10, 30),
        status: "COMPLETED",
        notes: "Annual checkup, all healthy.",
      },
    });
    // Upcoming, confirmed.
    await prisma.appointment.create({
      data: {
        clientId: alice.id,
        petId: baxter.id,
        clinicId: happy.id,
        vetId: happy.firstVetId,
        serviceId: happy.firstServiceId,
        startAt: daysFromNow(3, 11),
        endAt: daysFromNow(3, 11, 30),
        status: "CONFIRMED",
        notes: "Follow-up on hip stiffness.",
      },
    });
  }

  // --- A sample conversation (Alice ↔ Happy Paws) ---
  const convo = await prisma.conversation.create({
    data: { clinicId: happy.id, clientId: alice.id },
  });
  await prisma.message.create({
    data: {
      conversationId: convo.id,
      senderId: alice.id,
      senderRole: "CLIENT",
      body: "Hi! Does Baxter need to fast before his dental cleaning?",
    },
  });
  const happyOwner = await prisma.clinic.findUnique({
    where: { id: happy.id },
    select: { ownerUserId: true },
  });
  if (happyOwner) {
    await prisma.message.create({
      data: {
        conversationId: convo.id,
        senderId: happyOwner.ownerUserId,
        senderRole: "VET",
        body: "Hi Alice! Yes — no food after 10pm the night before. Water is fine. 🐾",
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  ${CLINICS.length} clinics, ${CLIENTS.length} clients seeded.`);
  console.log("  Demo logins (password: password123):");
  console.log("    Pet owner → alice@demo.com");
  console.log("    Vet/clinic → happy@demo.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
