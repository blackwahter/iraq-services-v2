import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

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
      <body className={`${cairo.variable} font-cairo min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 antialiased flex`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
