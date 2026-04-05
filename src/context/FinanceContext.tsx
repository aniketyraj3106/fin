import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Role = "admin" | "viewer";
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
}

interface Filters {
  search: string;
  type: "all" | TransactionType;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
}

interface FinanceContextType {
  transactions: Transaction[];
  role: Role;
  filters: Filters;
  setRole: (role: Role) => void;
  setFilters: (filters: Partial<Filters>) => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  editTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  filteredTransactions: Transaction[];
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const CATEGORIES = ["Salary", "Freelance", "Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Education", "Investment"];

function generateMockData(): Transaction[] {
  const txns: Transaction[] = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 90));
    const isIncome = Math.random() > 0.6;
    txns.push({
      id: crypto.randomUUID(),
      date: d.toISOString().split("T")[0],
      description: isIncome
        ? ["Monthly salary", "Freelance project", "Investment return", "Side gig"][Math.floor(Math.random() * 4)]
        : ["Groceries", "Uber ride", "Netflix", "New shoes", "Electric bill", "Gym membership", "Online course", "Dinner out"][Math.floor(Math.random() * 8)],
      amount: isIncome
        ? Math.round((Math.random() * 4000 + 1000) * 100) / 100
        : Math.round((Math.random() * 300 + 10) * 100) / 100,
      category: isIncome
        ? CATEGORIES.slice(0, 2)[Math.floor(Math.random() * 2)]
        : CATEGORIES.slice(2)[Math.floor(Math.random() * 8)],
      type: isIncome ? "income" : "expense",
    });
  }
  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

const STORAGE_KEY = "finance-dashboard-data";

function loadData(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return generateMockData();
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(loadData);
  const [role, setRole] = useState<Role>("admin");
  const [filters, setFiltersState] = useState<Filters>({
    search: "",
    type: "all",
    sortBy: "date",
    sortOrder: "desc",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const setFilters = useCallback((partial: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const filteredTransactions = React.useMemo(() => {
    let result = [...transactions];
    if (filters.type !== "all") result = result.filter((t) => t.type === filters.type);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const mul = filters.sortOrder === "asc" ? 1 : -1;
      if (filters.sortBy === "date") return mul * a.date.localeCompare(b.date);
      return mul * (a.amount - b.amount);
    });
    return result;
  }, [transactions, filters]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        role,
        filters,
        setRole,
        setFilters,
        addTransaction,
        editTransaction,
        deleteTransaction,
        filteredTransactions,
        totalBalance,
        totalIncome,
        totalExpenses,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
