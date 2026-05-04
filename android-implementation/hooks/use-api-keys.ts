import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type ApiKeyPrivileges = {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type ApiKey = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  privileges: ApiKeyPrivileges;
  created_at: string;
  last_used_at: string | null;
};

export function useApiKeys() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading, error } = useQuery({
    queryKey: ['api_keys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ApiKey[];
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async ({ name, privileges }: { name: string; privileges: ApiKeyPrivileges }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate a random key
      const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const apiKey = `fm_${randomPart}`;
      
      // Hash the key using SHA-256
      const msgUint8 = new TextEncoder().encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name,
          key_hash: keyHash,
          key_prefix: apiKey.substring(0, 7), // fm_xxxx
          privileges,
        })
        .select()
        .single();

      if (error) throw error;
      
      return { ...data, rawKey: apiKey };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });

  const deleteApiKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });

  const updateApiKeyPrivilegesMutation = useMutation({
    mutationFn: async ({ id, privileges }: { id: string; privileges: ApiKeyPrivileges }) => {
      const { error } = await supabase
        .from('api_keys')
        .update({ privileges })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api_keys'] });
    },
  });

  return {
    apiKeys: apiKeys || [],
    isLoading,
    error,
    createApiKey: createApiKeyMutation.mutateAsync,
    deleteApiKey: deleteApiKeyMutation.mutateAsync,
    updateApiKeyPrivileges: updateApiKeyPrivilegesMutation.mutateAsync,
  };
}
