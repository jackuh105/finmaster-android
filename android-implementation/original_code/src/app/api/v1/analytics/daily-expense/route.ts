import { NextRequest } from "next/server";
import { authenticateApiKey, hasPrivilege } from "@/lib/api-auth";
import { apiResponse, apiUnauthorized, apiForbidden, apiError } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "read")) return apiForbidden();

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return apiError("Missing required query parameters: startDate, endDate (YYYY-MM-DD)");
  }

  const adminSupabase = createAdminClient();
  
  const { data: transactions, error } = await adminSupabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', auth.userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) return apiError(error.message);

  const dailyExpense: Record<string, number> = {};
  (transactions || []).forEach((t: any) => {
    dailyExpense[t.date] = (dailyExpense[t.date] || 0) + Number(t.amount);
  });

  // Optional: Fill in missing dates in the range if needed, but here we'll just return dates with transactions
  return apiResponse({
    start_date: startDate,
    end_date: endDate,
    daily_expenses: Object.entries(dailyExpense).map(([date, amount]) => ({ date, amount })),
  });
}
