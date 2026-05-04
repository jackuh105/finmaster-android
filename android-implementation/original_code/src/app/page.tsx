import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import ShortTransactionList from "./shortTransactionList";
import BudgetWidget from "@/components/BudgetWidget";
import { SpendingOverviewChart } from "./SpendingOverviewChart";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-7xl w-full">
      <main className="flex flex-col md:grid md:grid-cols-6 p-4 gap-4">
        {/* Budget */}
        <BudgetWidget className="col-span-4" />
        {/* Quick Actions */}
        <Card variant={"default"} className="bg-secondaryBg dark:bg-secondaryBlack col-span-2 p-4 pb-0 md:pb-4">
          <CardTitle className="text-text dark:text-darkText pl-1">Quick Actions</CardTitle>
          <CardContent className="flex flex-col gap-2 justify-around h-full">
            <Link href="/transaction-list/add">
              <Button variant={"default"} className="mt-2 w-full">Add new item</Button>
            </Link>
          </CardContent>
        </Card>
        {/** Transaction List */}
        <ShortTransactionList className="md:col-span-3 bg-secondaryBg dark:bg-secondaryBlack" />
        {/* */}
        <SpendingOverviewChart className="md:col-span-3" />
      </main>
    </div>
  );
}
