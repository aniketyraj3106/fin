import { useFinance } from "@/context/FinanceContext";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const cards = [
  { key: "balance", label: "Total Balance", icon: Wallet, colorClass: "text-savings" },
  { key: "income", label: "Total Income", icon: TrendingUp, colorClass: "text-income" },
  { key: "expenses", label: "Total Expenses", icon: TrendingDown, colorClass: "text-expense" },
] as const;

export function SummaryCards() {
  const { totalBalance, totalIncome, totalExpenses } = useFinance();
  const values = { balance: totalBalance, income: totalIncome, expenses: totalExpenses };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-lg border bg-card p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <c.icon className={`h-5 w-5 ${c.colorClass}`} />
          </div>
          <p className="text-2xl font-heading font-semibold">{fmt(values[c.key])}</p>
        </motion.div>
      ))}
    </div>
  );
}
