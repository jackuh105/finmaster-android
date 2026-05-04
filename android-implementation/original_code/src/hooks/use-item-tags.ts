import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useItemTags() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: itemTags = [], isLoading, error } = useQuery({
    queryKey: ['item_tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('item_tags')
        .select('name')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data.map(item => item.name) || [];
    },
    staleTime: Infinity,
  });

  const addItemTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('item_tags')
        .insert([{ name: tag, user_id: user.id }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item_tags'] });
    },
  });

  const deleteItemTagMutation = useMutation({
    mutationFn: async (tag: string) => {
      const { error } = await supabase
        .from('item_tags')
        .delete()
        .eq('name', tag);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item_tags'] });
    },
  });

  const updateItemTagMutation = useMutation({
    mutationFn: async ({ oldTag, newTag }: { oldTag: string; newTag: string }) => {
      const { error } = await supabase
        .from('item_tags')
        .update({ name: newTag })
        .eq('name', oldTag);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item_tags'] });
    }
  });

  return {
    itemTags,
    isLoading,
    error,
    addItemTag: addItemTagMutation.mutateAsync,
    deleteItemTag: deleteItemTagMutation.mutateAsync,
    updateItemTag: updateItemTagMutation.mutateAsync,
  };
}
