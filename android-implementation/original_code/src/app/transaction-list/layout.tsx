import TransactionListContextProvider from "@/context/TransactionListContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased flex items-center flex-col w-full p-2">
      <TransactionListContextProvider>
        {children}
      </TransactionListContextProvider>
    </div>
  );
}
