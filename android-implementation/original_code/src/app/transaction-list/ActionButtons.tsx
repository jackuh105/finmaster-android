import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ExportDialog from "./ExportDialog";
import ImportDialog from "./ImportDialog";

interface ActionButtonsProps {
  className?: string;
  isMobile?: boolean;
}

export default function ActionButtons({ className, isMobile = false }: ActionButtonsProps) {
  if (isMobile) {
    return (
      <div className={cn("flex flex-row gap-2 pb-2", className)}>
        <Link href="/transaction-list/add" className="flex-1 min-w-[140px]">
          <Button className="w-full" variant={"default"}>Add Transaction</Button>
        </Link>
        <ImportDialog
          trigger={
            <Button className="flex-1 min-w-[70px]" variant={"neutral"}>
              Import
            </Button>
          }
        />
        <ExportDialog
          trigger={
            <Button className="flex-1 min-w-[70px]" variant={"neutral"}>
              Export
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <Link href="/transaction-list/add" className="w-full">
        <Button className="w-full" variant={"default"}>New Transaction</Button>
      </Link>
      <div className="flex flex-row gap-4">
        <ImportDialog
          trigger={
            <Button className="w-full" variant={"neutral"}>
              Import
            </Button>
          }
        />
        <ExportDialog
          trigger={
            <Button className="w-full" variant={"neutral"}>
              Export
            </Button>
          }
        />
      </div>
    </div>
  );
}
