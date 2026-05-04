import { NextRequest } from "next/server";
import { authenticateApiKey, hasPrivilege } from "@/lib/api-auth";
import { apiResponse, apiUnauthorized, apiForbidden, apiError } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "read")) return apiForbidden();

  const adminSupabase = createAdminClient();
  
  // Get budget limit
  const { data: settingsData } = await adminSupabase
    .from('user_settings')
    .select('budget')
    .eq('user_id', auth.userId)
    .single();

  const budgetLimit = settingsData?.budget ?? 0;

  // Get current month usage
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data: transactions, error } = await adminSupabase
    .from('transactions')
    .select('amount')
    .eq('user_id', auth.userId)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  if (error) return apiError(error.message);

  const totalUsage = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

  return apiResponse({
    budget_limit: budgetLimit,
    total_usage: totalUsage,
    remaining: Math.max(0, budgetLimit - totalUsage),
    month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
  });
}
