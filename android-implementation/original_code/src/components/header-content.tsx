"use client";

import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import UserProfile from "./UserProfile";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";

const Page = ({ name, slug, onClick }: { name: string, slug: string, onClick?: () => void }) => (
  <Link href={slug} className="group cursor-pointer" onClick={onClick}>
    <p className="font-medium">{name}</p>
    <span className="block max-w-0 group-hover:max-w-full transition-all duration-150 h-[1px] bg-text"></span>
  </Link>
)

interface HeaderContentProps {
  user: User | null;
}

export default function HeaderContent({ user }: HeaderContentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="border-b-2 w-full bg-secondaryBg dark:bg-secondaryBlack sticky top-0 z-20 text-text dark:text-darkText transition-all duration-300">
      <div className="flex justify-between h-16 px-6 items-center">
        <div className="flex flex-row gap-4 justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">Finance Master</h1>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-5">
            {user && (
              <>
                <Page name="Dashboard" slug="/" />
                <Page name="Transaction" slug="/transaction-list" />
                <Page name="Analytics" slug="/analytics" />
                <Page name="FinCalculate" slug="/calculations" />
                <Page name="Settings" slug="/settings" />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-lg">
          <ModeToggle />
          <div className="hidden md:block">
            <UserProfile user={user} />
          </div>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <Button
              variant="default"
              size="icon"
              onClick={toggleMenu}
              className="bg-transparent hover:bg-transparent [&_svg]:size-6 text-text dark:text-darkText"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden border-t-2 border-border bg-secondaryBg dark:bg-secondaryBlack px-6 py-4 flex flex-col gap-4">
          <Page name="Dashboard" slug="/" onClick={closeMenu} />
          <Page name="Transaction" slug="/transaction-list" onClick={closeMenu} />
          <Page name="Analytics" slug="/analytics" onClick={closeMenu} />
          <Page name="FinCalculate" slug="/calculations" onClick={closeMenu} />
          <Page name="Settings" slug="/settings" onClick={closeMenu} />
          <div className="pt-2 border-t border-border/50">
            <UserProfile user={user} />
          </div>
        </div>
      )}
    </div>
  );
}
