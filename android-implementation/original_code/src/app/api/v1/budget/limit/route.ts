import { NextRequest } from "next/server";
import { authenticateApiKey, hasPrivilege } from "@/lib/api-auth";
import { apiResponse, apiUnauthorized, apiForbidden, apiError } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "read")) return apiForbidden();

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('user_settings')
    .select('budget')
    .eq('user_id', auth.userId)
    .single();

  if (error && error.code !== 'PGRST116') return apiError(error.message);

  return apiResponse({ budget_limit: data?.budget ?? 0 });
}

export async function PATCH(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "update")) return apiForbidden();

  try {
    const body = await req.json();
    const { budget_limit } = body;

    if (budget_limit === undefined) return apiError("Missing required field: budget_limit");

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('user_settings')
      .upsert({ user_id: auth.userId, budget: budget_limit, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) return apiError(error.message);

    return apiResponse({ budget_limit: data.budget });
  } catch (err) {
    return apiError("Invalid request body");
  }
}
