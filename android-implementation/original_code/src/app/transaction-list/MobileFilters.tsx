"use client";

import AmountFilter from "./(filterToolbox)/AmountFilter";
import TypeFilter from "./(filterToolbox)/TypeFilter";
import { Card, CardContent } from "@/components/ui/card";

export default function MobileFilters() {
  return (
    <Card className="bg-secondaryBg dark:bg-secondaryBlack border-2">
      <CardContent className="flex flex-col p-4 space-y-6">
        <AmountFilter />
        <TypeFilter />
      </CardContent>
    </Card>
  );
}
