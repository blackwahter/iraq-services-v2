import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "بوابة العراق المالية | Iraq Finance Portal",
  description: "نظام المراقبة والتحليل المالي المتطور للدينار العراقي والمعادن والنفط لحظة بلحظة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-cairo min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased flex flex-col md:flex-row select-none overscroll-none`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          {/* Desktop Sidebar (hidden on mobile) */}
          <Sidebar />
          
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header />
            {/* Added padding-bottom to avoid content hiding behind mobile bottom nav */}
            <main className="flex-1 overflow-auto p-4 pb-24 md:pb-6 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
          
          {/* Mobile Bottom Navigation (hidden on desktop) */}
          <MobileBottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
