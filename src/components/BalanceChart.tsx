import { useFinance } from "@/context/FinanceContext";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BalanceChart() {
  const { transactions } = useFinance();

  const data = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, number>();
    let balance = 0;
    for (const t of sorted) {
      balance += t.type === "income" ? t.amount : -t.amount;
      map.set(t.date, balance);
    }
    return Array.from(map, ([date, balance]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: Math.round(balance * 100) / 100,
    }));
  }, [transactions]);

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="font-heading font-semibold mb-4">Balance Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(230, 65%, 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(230, 65%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: 13,
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(230, 65%, 55%)"
              strokeWidth={2}
              fill="url(#balGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
