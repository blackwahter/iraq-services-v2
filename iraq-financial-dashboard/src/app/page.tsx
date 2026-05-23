import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { SalaryRadar } from "@/components/Widgets/SalaryRadar";
import { CurrencyTerminal } from "@/components/Widgets/CurrencyTerminal";
import { CommoditiesPanel } from "@/components/Widgets/CommoditiesPanel";
import { FinancialConverter } from "@/components/Widgets/FinancialConverter";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* Top Full Width or 2/3: Currency Terminal */}
        <div className="xl:col-span-2 row-span-2">
          <CurrencyTerminal />
        </div>

        {/* Top Right (1/3): Converter */}
        <div className="xl:col-span-1 row-span-2">
          <FinancialConverter />
        </div>

        {/* Bottom Left (2/3): Salary Radar */}
        <div className="xl:col-span-2 row-span-2">
          <SalaryRadar />
        </div>

        {/* Bottom Right (1/3): Commodities Panel */}
        <div className="xl:col-span-1 row-span-2">
          <CommoditiesPanel />
        </div>

      </div>
    </DashboardLayout>
  );
}
