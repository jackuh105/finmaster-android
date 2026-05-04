"use client";

import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HiUserCircle } from "react-icons/hi";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface UserProfileProps {
  user: User | null;
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button className="font-heading">Login</Button>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-lg">
        <HiUserCircle className="text-xl" />
        <p className="hidden sm:block text-sm sm:text-base">{user.email}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Logout"
        className="text-text hover:text-destructive"
      >
        <LogOut className="h-5 w-5 text-text dark:text-darkText" />
      </Button>
    </div>
  );
}
