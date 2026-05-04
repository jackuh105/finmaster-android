import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";

export type ApiKeyPrivileges = {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer "
  if (!apiKey.startsWith("fm_")) {
    return null;
  }

  // Hash the incoming key to compare with stored hash
  const msgUint8 = new TextEncoder().encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  try {
    const adminSupabase = createAdminClient();
    
    // Use service role client to lookup the key and update last_used_at
    const { data: keyData, error } = await adminSupabase
      .from('api_keys')
      .select('user_id, privileges')
      .eq('key_hash', keyHash)
      .single();

    if (error || !keyData) {
      return null;
    }

    // Update last_used_at
    await adminSupabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', keyHash);

    return {
      userId: keyData.user_id,
      privileges: keyData.privileges as ApiKeyPrivileges,
    };
  } catch (err) {
    console.error("Authentication failed:", err);
    return null;
  }
}

export function hasPrivilege(privileges: ApiKeyPrivileges, action: keyof ApiKeyPrivileges) {
  return privileges[action] === true;
}
