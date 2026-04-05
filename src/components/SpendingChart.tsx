import { useFinance } from "@/context/FinanceContext";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "hsl(230, 65%, 55%)",
  "hsl(160, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(190, 70%, 45%)",
  "hsl(0, 72%, 55%)",
  "hsl(50, 80%, 50%)",
  "hsl(320, 60%, 50%)",
];

export function SpendingChart() {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => map.set(t.category, (map.get(t.category) || 0) + t.amount));
    return Array.from(map, ([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort(
      (a, b) => b.value - a.value
    );
  }, [transactions]);

  if (data.length === 0)
    return (
      <div className="rounded-lg border bg-card p-5 shadow-sm flex items-center justify-center h-80">
        <p className="text-muted-foreground">No expense data</p>
      </div>
    );

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="font-heading font-semibold mb-4">Spending by Category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: 13,
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
