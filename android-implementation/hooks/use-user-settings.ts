import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useUserSettings() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user_settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no settings exist yet, return null for budget
      if (error && error.code === 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        return { budget: null };
      }

      if (error) throw error;
      return data;
    },
  });

  // Mutation to update budget
  const updateBudgetMutation = useMutation({
    mutationFn: async (newBudget: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, budget: newBudget, updated_at: new Date().toISOString() });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
    },
  });

  return {
    budget: settings?.budget ?? null,
    isLoading,
    error,
    updateBudget: updateBudgetMutation.mutateAsync,
  };
}
