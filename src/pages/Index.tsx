import { SummaryCards } from "@/components/SummaryCards";
import { BalanceChart } from "@/components/BalanceChart";
import { SpendingChart } from "@/components/SpendingChart";

export default function Index() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-heading font-bold">Overview</h2>
      <SummaryCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceChart />
        <SpendingChart />
      </div>
    </div>
  );
}
