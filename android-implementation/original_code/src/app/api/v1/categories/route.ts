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
    .from('categories')
    .select('*')
    .eq('user_id', auth.userId)
    .order('name', { ascending: true });

  if (error) return apiError(error.message);

  return apiResponse({ categories: data });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "create")) return apiForbidden();

  try {
    const body = await req.json();
    const { name } = body;

    if (!name) return apiError("Missing required field: name");

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('categories')
      .insert({ user_id: auth.userId, name, is_preset: false })
      .select()
      .single();

    if (error) return apiError(error.message);

    return apiResponse({ category: data }, 201);
  } catch (err) {
    return apiError("Invalid request body");
  }
}
