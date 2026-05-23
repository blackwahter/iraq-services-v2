import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian flex w-full relative overflow-hidden">
      {/* Background Interactive Particles placeholder */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gold-glowing/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <Sidebar />

      <main className="flex-1 lg:pr-64 z-10 flex flex-col min-h-screen pb-10">
        <Topbar />
        
        <div className="px-4 lg:px-10 flex-1 w-full max-w-[1600px] mx-auto mt-6">
          {children}
        </div>
      </main>
    </div>
  );
}
