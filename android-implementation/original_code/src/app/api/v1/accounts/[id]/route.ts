import { NextRequest } from "next/server";
import { authenticateApiKey, hasPrivilege } from "@/lib/api-auth";
import { apiResponse, apiUnauthorized, apiForbidden, apiError } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "update")) return apiForbidden();

  const { id } = await params;

  try {
    const body = await req.json();
    const { name } = body;

    if (!name) return apiError("Missing required field: name");

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('accounts')
      .update({ name })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) return apiError(error.message);

    return apiResponse({ account: data });
  } catch (err) {
    return apiError("Invalid request body");
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "delete")) return apiForbidden();

  const { id } = await params;

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId);

  if (error) return apiError(error.message);

  return apiResponse({ message: "Account deleted successfully" });
}
