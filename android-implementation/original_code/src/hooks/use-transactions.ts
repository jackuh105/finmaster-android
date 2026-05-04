import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Transaction } from "@/types/Transaction";

interface UseTransactionsOptions {
  limit?: number;
  range?: [number, number];
  amountFilter?: [number, number];
  typeFilter?: string[];
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export function useTransactions(options?: UseTransactionsOptions) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['transactions', options],
    queryFn: async () => {
      let selectQuery = `
          *,
          categories:category_id (name),
          accounts:account_id (name)
        `;

      if (options?.typeFilter && options.typeFilter.length > 0) {
        selectQuery = `
          *,
          categories:category_id!inner (name),
          accounts:account_id (name)
        `;
      }

      let query = supabase
        .from('transactions')
        .select(selectQuery, { count: 'exact' })
        .order('date', { ascending: false });

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.range) {
        query = query.range(options.range[0], options.range[1]);
      }

      if (options?.amountFilter) {
        query = query.gte('amount', options.amountFilter[0]).lte('amount', options.amountFilter[1]);
      }

      if (options?.typeFilter && options.typeFilter.length > 0) {
        query = query.in('categories.name', options.typeFilter);
      }

      if (options?.searchQuery) {
        const q = options.searchQuery;
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }

      if (options?.startDate) {
        query = query.gte('date', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: data.map((t: any) => ({
          id: t.id,
          name: t.name,
          desc: t.description,
          amount: Number(t.amount),
          date: t.date,
          type: t.categories?.name ?? 'Uncategorized',
          account: t.accounts?.name ?? 'Unknown',
          // We preserve original IDs for updates if needed, but the UI type uses mapped names
          category_id: t.category_id,
          account_id: t.account_id
        })) as Transaction[],
        count: count ?? 0
      };
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: {
      name: string;
      amount: number;
      date: string;
      description?: string;
      category_id?: string;
      account_id?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          name: newTransaction.name,
          amount: newTransaction.amount,
          date: newTransaction.date,
          description: newTransaction.description,
          category_id: newTransaction.category_id,
          account_id: newTransaction.account_id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalidate stats/charts if they exist and are derived from this
    },
  });

  const addTransactionsMutation = useMutation({
    mutationFn: async (transactions: Array<{
      name: string;
      amount: number;
      date: string;
      description?: string;
      category_id?: string;
      account_id?: string
    }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('transactions')
        .insert(transactions.map(t => ({
          user_id: user.id,
          name: t.name,
          amount: t.amount,
          date: t.date,
          description: t.description,
          category_id: t.category_id,
          account_id: t.account_id
        })));

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Transaction> & { category_id?: string; account_id?: string } }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          name: updates.name,
          amount: updates.amount,
          date: updates.date,
          description: updates.desc, // Map desc to description
          category_id: updates.category_id,
          account_id: updates.account_id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });


  return {
    transactions: queryData?.data ?? [],
    count: queryData?.count ?? 0,
    isLoading,
    error,
    addTransaction: addTransactionMutation.mutateAsync,
    addTransactions: addTransactionsMutation.mutateAsync,
    updateTransaction: updateTransactionMutation.mutateAsync,
    deleteTransaction: deleteTransactionMutation.mutateAsync
  };
}

/**
 * Hook to fetch distinct months that have transactions
 * Returns an array of year-month strings (e.g., "2026-01")
 */
export function useTransactionMonths() {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['transaction-months'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_distinct_transaction_months');

      if (error) throw error;

      return (data as { year_month: string }[]).map(row => row.year_month);
    },
  });

  return {
    months: data ?? [],
    isLoading,
    error
  };
}
