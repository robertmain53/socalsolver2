import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], display: 'swap' });
/*
export const metadata: Metadata = {
  title: {
    default: "SoCalSolver - Calcolatori Online Professionali",
    template: "%s | SoCalSolver",
  },
  description: "Calcolatori online per fisco, finanza, salute e molto altro.",
};
*/

export default function ItalianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <Header lang="it" />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer lang="it" />
      {/* Toast Container placeholder - usa react-hot-toast se installato */}
    </div>
  );
}
