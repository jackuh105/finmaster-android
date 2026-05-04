import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getMillisecondsUntilMidnight } from "@/lib/time";

const supportedCurrency = ["mop", "hkd", "cny", "jpy", "twd", "usd", "aud"];

export function useExchangeRate(currency: string, date: string) {
  return useQuery({
    queryKey: ['exchangeRate', currency, date],
    queryFn: async () => {
      let selectDate = date;
      const today = format(new Date(), "yyyy-MM-dd");
      if (date !== "latest" && date >= today) selectDate = "latest";

      const sourceUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${selectDate}/v1/currencies/mop.json`;
      const fallbackUrl = `https://${selectDate}.currency-api.pages.dev/v1/currencies/mop.json`;

      async function fetchFromUrl(url: string) {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch exchange rate", { cause: res });
        return res.json();
      }

      function processData(data: { "mop": { [key: string]: number } }) {
        const filtered = Object.fromEntries(Object.entries(data["mop"]).filter(([k, v]) => supportedCurrency.includes(k)));
        const exchangeRate = Object.fromEntries(Object.entries(filtered).map(([k, v]) => [k.toUpperCase(), v]));
        // Ensure 1:1 for MOP
        if (!exchangeRate["MOP"]) exchangeRate["MOP"] = 1;
        return exchangeRate;
      }

      // Try main source
      try {
        const data = await fetchFromUrl(sourceUrl);
        return processData(data);
      } catch (error) {
        console.warn("Failed to fetch exchange rate using main source, trying fallback source...", error);
      }

      // Try fallback source
      try {
        const data = await fetchFromUrl(fallbackUrl);
        return processData(data);
      } catch (error) {
        console.error("Failed to fetch exchange rate from all sources", error);
        // Return 1:1 fallback if all fails
        const exchangeRate: { [key: string]: number } = {};
        supportedCurrency.forEach((c) => exchangeRate[c.toUpperCase()] = 1);
        return exchangeRate;
      }
    },
    staleTime: getMillisecondsUntilMidnight(),
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
