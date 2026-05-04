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
    .select('amount')
    .eq('user_id', auth.userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) return apiError(error.message);

  const totalExpense = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

  return apiResponse({
    start_date: startDate,
    end_date: endDate,
    total_expense: totalExpense,
    transaction_count: transactions?.length || 0,
  });
}
