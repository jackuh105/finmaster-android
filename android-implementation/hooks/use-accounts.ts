import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useAccounts() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: Infinity,
  });

  const addAccountMutation = useMutation({
    mutationFn: async ({ name, is_preset }: { name: string; is_preset: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('accounts')
        .insert([{ name, is_preset, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('name', name);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const updateAccountMutation = useMutation({
    mutationFn: async ({ oldName, newName }: { oldName: string; newName: string }) => {
      const { error } = await supabase
        .from('accounts')
        .update({ name: newName })
        .eq('name', oldName);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });

  const togglePresetMutation = useMutation({
    mutationFn: async ({ name, is_preset }: { name: string; is_preset: boolean }) => {
      const { error } = await supabase
        .from('accounts')
        .update({ is_preset })
        .eq('name', name);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    }
  });

  return {
    accounts,
    isLoading,
    error,
    addAccount: addAccountMutation.mutateAsync,
    deleteAccount: deleteAccountMutation.mutateAsync,
    updateAccount: updateAccountMutation.mutateAsync,
    togglePreset: togglePresetMutation.mutateAsync,
  };
}
