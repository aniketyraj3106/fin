import { TransactionTable } from "@/components/TransactionTable";

export default function Transactions() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-heading font-bold">Transactions</h2>
      <TransactionTable />
    </div>
  );
}
