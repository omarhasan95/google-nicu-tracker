import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "NICU Tracker - Supporting Parents on their NICU Journey",
  description: "A calm, simple, and secure way to track your baby's NICU progress, feedings, weight changes, milestones, and care team questions.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fafbfb] text-[#2a3b3c] selection:bg-[#c6d9d9] selection:text-[#273b3c] font-sans">
        <AuthProvider>
          <Header />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

