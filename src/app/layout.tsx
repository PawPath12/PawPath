import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

// Body / UI — clean, friendly sans.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app",
  display: "swap",
});

// Headings / brand — elegant serif for a refined, luxury feel.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PawPath — Find & book trusted veterinarians",
  description:
    "PawPath connects pet owners with veterinarians and clinics. Search, compare, and book appointments online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-slate-800">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-slate-400">
            <span className="tracking-wide">
              <span className="font-display font-semibold text-ink">Paw Path</span>
              <span className="mx-2 text-slate-300">·</span>
              Never feel lost when it matters most.
            </span>
            <span className="tracking-wide">Trusted by pet parents nationwide.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
