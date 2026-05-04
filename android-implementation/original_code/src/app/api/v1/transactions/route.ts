import { NextRequest } from "next/server";
import { authenticateApiKey, hasPrivilege } from "@/lib/api-auth";
import { apiResponse, apiUnauthorized, apiForbidden, apiError } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "read")) return apiForbidden();

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = parseInt(searchParams.get("offset") || "0");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const minAmount = searchParams.get("minAmount");
  const maxAmount = searchParams.get("maxAmount");
  const typeFilter = searchParams.get("types")?.split(","); // Category names
  const searchQuery = searchParams.get("q");

  const adminSupabase = createAdminClient();
  
  let selectQuery = `
    *,
    categories:category_id (name),
    accounts:account_id (name)
  `;

  if (typeFilter && typeFilter.length > 0) {
    selectQuery = `
      *,
      categories:category_id!inner (name),
      accounts:account_id (name)
    `;
  }

  let query = adminSupabase
    .from('transactions')
    .select(selectQuery, { count: 'exact' })
    .eq('user_id', auth.userId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  if (minAmount) query = query.gte('amount', minAmount);
  if (maxAmount) query = query.lte('amount', maxAmount);
  if (typeFilter && typeFilter.length > 0) query = query.in('categories.name', typeFilter);
  if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);

  const { data, error, count } = await query;

  if (error) return apiError(error.message);

  return apiResponse({
    transactions: data.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
      category: t.categories?.name ?? 'Uncategorized',
      account: t.accounts?.name ?? 'Unknown',
      created_at: t.created_at,
    })),
    pagination: {
      total: count,
      limit,
      offset,
    }
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (!auth) return apiUnauthorized();
  if (!hasPrivilege(auth.privileges, "create")) return apiForbidden();

  try {
    const body = await req.json();
    const { name, amount, date, description, category_id, account_id } = body;

    if (!name || amount === undefined || !date) {
      return apiError("Missing required fields: name, amount, date");
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('transactions')
      .insert({
        user_id: auth.userId,
        name,
        amount,
        date,
        description,
        category_id,
        account_id
      })
      .select()
      .single();

    if (error) return apiError(error.message);

    return apiResponse({ transaction: data }, 201);
  } catch (err) {
    return apiError("Invalid request body");
  }
}
