"use client";

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from "@/hooks/use-transactions";

const digitOption = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

export default function ShortTransactionList({ className }: { className?: string }) {
  const { transactions } = useTransactions({ limit: 5 });

  return (
    <Card className={cn(
      "bg-white dark:bg-secondaryBlack text-text dark:text-darkText",
      className
    )}>
      <CardHeader className='border-b-2 border-dotted px-4 py-3 flex flex-row justify-between items-center space-y-0'>
        <CardTitle className='pl-3 text-xl'>Recent Transaction</CardTitle>
        <Link href="/transaction-list">
          <Button >More</Button>
        </Link>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='divide-y-2'>
          {transactions.map((transaction, index) => (
            <div key={transaction.id || index} className='px-4 py-4 flex flex-row items-center justify-between md:px-8'>
              <div className='flex flex-row gap-2 items-center'>
                <p className='px-2 py-1 border-2 border-black bg-bg dark:bg-darkBg'>{transaction.date}</p>
                <p className='font-bold'>
                  <span className="md:hidden">{transaction.name.slice(0, 8)}{transaction.name.length > 8 ? '...' : ''}</span>
                  <span className="hidden md:inline">{transaction.name}</span>
                </p>
              </div>
              <p className='text-alert font-bold'>-{Number(transaction.amount).toLocaleString("en", digitOption)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}