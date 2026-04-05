import { useFinance, Transaction } from "@/context/FinanceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Pencil, Trash2, Search, Download } from "lucide-react";
import { useState } from "react";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { motion, AnimatePresence } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export function TransactionTable() {
  const { filteredTransactions, filters, setFilters, role, deleteTransaction, editTransaction } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});

  const toggleSort = (by: "date" | "amount") => {
    if (filters.sortBy === by) {
      setFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" });
    } else {
      setFilters({ sortBy: by, sortOrder: "desc" });
    }
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id);
    setEditData({ description: t.description, amount: t.amount, category: t.category });
  };

  const saveEdit = () => {
    if (editingId) {
      editTransaction(editingId, editData);
      setEditingId(null);
    }
  };

  const exportCSV = () => {
    const header = "Date,Description,Category,Type,Amount\n";
    const rows = filteredTransactions
      .map((t) => `${t.date},"${t.description}","${t.category}",${t.type},${t.amount}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
          <Select value={filters.type} onValueChange={(v) => setFilters({ type: v as any })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {role === "admin" && <AddTransactionDialog />}
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">
                  <button onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-foreground text-muted-foreground">
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-right p-3 font-medium">
                  <button onClick={() => toggleSort("amount")} className="flex items-center gap-1 ml-auto hover:text-foreground text-muted-foreground">
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                {role === "admin" && <th className="p-3 w-20" />}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={role === "admin" ? 6 : 5} className="text-center py-12 text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="p-3">
                        {editingId === t.id ? (
                          <Input
                            value={editData.description ?? ""}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="h-7 text-sm"
                          />
                        ) : (
                          t.description
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-medium ${t.type === "income" ? "text-income" : "text-expense"}`}>
                          {t.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-medium ${t.type === "income" ? "text-income" : "text-expense"}`}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </td>
                      {role === "admin" && (
                        <td className="p-3">
                          <div className="flex gap-1">
                            {editingId === t.id ? (
                              <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 text-xs">
                                Save
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" onClick={() => startEdit(t)} className="h-7 w-7 p-0">
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => deleteTransaction(t.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
