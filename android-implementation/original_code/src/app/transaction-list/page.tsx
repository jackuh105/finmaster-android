"use client";
import * as React from "react";
import Link from "next/link";
import { Filter } from "lucide-react";
import SearchBar from "./SearchBar";
import FilterList from "./FilterList";
import TypeFilter from "./(filterToolbox)/TypeFilter";
import AmountFilter from "./(filterToolbox)/AmountFilter";
import ActionButtons from "./ActionButtons";
import MobileTransactionList from "./MobileTransactionList";
import MobileFilters from "./MobileFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TranscationList() {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  return (
    <div className="max-w-7xl w-full pt-4 text-text dark:text-darkText">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-4 px-2">
        <ActionButtons isMobile />
        
        <div className="flex flex-row gap-2">
           <SearchBar className="flex-grow" />
           <Button 
             variant="neutral" 
             size="icon" 
             onClick={() => setIsFilterOpen(!isFilterOpen)}
             className={isFilterOpen ? "bg-main" : ""}
           >
             <Filter className="w-5 h-5" />
           </Button>
        </div>

        {isFilterOpen && <MobileFilters />}

        <MobileTransactionList />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-3 justify-between gap-4">
        {/** toolbox */}
        <Card className="col-span-1 border-2 bg-secondaryBg dark:bg-secondaryBlack max-h-fit">
          <CardHeader className="border-b p-4 space-y-4">
            <AmountFilter />
            <TypeFilter />
          </CardHeader>
          <CardContent className="flex flex-col p-4 space-y-4">
             <ActionButtons />
          </CardContent>
        </Card>

        {/** transcation list */}
        <Card className="col-span-2 border-2 bg-secondaryBg dark:bg-secondaryBlack">
          <CardHeader>
            <SearchBar />
          </CardHeader>
          <CardContent>
            <FilterList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
