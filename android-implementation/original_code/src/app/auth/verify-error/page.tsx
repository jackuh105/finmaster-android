import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyError() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-bg dark:bg-darkBg font-sans flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-lg">
        <Card className="bg-secondaryBg dark:bg-secondaryBlack border-2 border-border shadow-light p-8 rounded-base">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-heading text-text dark:text-darkText">
              Verification Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="p-4 bg-red-100 border-2 border-red-500 text-red-700 text-base font-bold rounded-base">
              The link you clicked is invalid or has expired. Please try requesting a new one.
            </div>
            
            <Button asChild className="w-full font-heading">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
