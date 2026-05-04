export type Transaction = {
  id: string;
  name: string;
  desc?: string;
  type: string;
  account?: string;
  amount: number;
  date: string;
}