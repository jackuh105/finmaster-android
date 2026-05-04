import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

export type MonthlyCategoryStat = {
  category_name: string;
  total_amount: number;
};

export function useMonthlyStats(date: Date = new Date()) {
  const supabase = createClient();
  
  const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['monthly-stats', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_monthly_category_stats', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) throw error;

      return data as MonthlyCategoryStat[];
    },
  });
}
