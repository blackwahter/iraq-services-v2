import type { Metadata } from "next";
import { CommandPalette } from "@/components/UI/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: "بوابة العراق المالية | Iraq Financial Portal",
  description: "Ultra-premium financial dashboard for Iraq markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="antialiased text-foreground bg-background selection:bg-emerald-500/30">
        <CommandPalette />
        {children}
      </body>
    </html>
  );
}
