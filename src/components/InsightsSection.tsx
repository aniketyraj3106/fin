import { useFinance } from "@/context/FinanceContext";
import { useMemo } from "react";
import { TrendingUp, PiggyBank, AlertTriangle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function InsightsSection() {
  const { transactions, totalIncome, totalExpenses, totalBalance } = useFinance();

  const insights = useMemo(() => {
    // Highest spending category
    const catMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount));
    const topCategory = [...catMap.entries()].sort((a, b) => b[1] - a[1])[0];

    // Monthly comparison
    const monthMap = new Map<string, { income: number; expense: number }>();
    transactions.forEach((t) => {
      const m = t.date.slice(0, 7);
      const cur = monthMap.get(m) || { income: 0, expense: 0 };
      if (t.type === "income") cur.income += t.amount;
      else cur.expense += t.amount;
      monthMap.set(m, cur);
    });
    const months = [...monthMap.entries()].sort((a, b) => b[0].localeCompare(a[0]));
    const latestMonth = months[0];

    return { topCategory, latestMonth, savings: totalBalance };
  }, [transactions, totalIncome, totalExpenses, totalBalance]);

  const cards = [
    {
      icon: AlertTriangle,
      label: "Top Spending",
      value: insights.topCategory ? insights.topCategory[0] : "N/A",
      sub: insights.topCategory ? fmt(insights.topCategory[1]) : "",
      color: "text-expense",
    },
    {
      icon: BarChart3,
      label: "Latest Month",
      value: insights.latestMonth
        ? new Date(insights.latestMonth[0] + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "N/A",
      sub: insights.latestMonth
        ? `Income: ${fmt(insights.latestMonth[1].income)} · Expenses: ${fmt(insights.latestMonth[1].expense)}`
        : "",
      color: "text-primary",
    },
    {
      icon: PiggyBank,
      label: "Total Savings",
      value: fmt(insights.savings),
      sub: insights.savings >= 0 ? "You're in the green!" : "Spending exceeds income",
      color: insights.savings >= 0 ? "text-income" : "text-expense",
    },
    {
      icon: TrendingUp,
      label: "Savings Rate",
      value: totalIncome > 0 ? `${Math.round((insights.savings / totalIncome) * 100)}%` : "N/A",
      sub: "Of total income saved",
      color: "text-savings",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-semibold">Insights</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-lg border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon className={`h-4 w-4 ${c.color}`} />
              <span className="text-sm text-muted-foreground">{c.label}</span>
            </div>
            <p className="text-lg font-heading font-semibold">{c.value}</p>
            {c.sub && <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
