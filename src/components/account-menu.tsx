"use client";

import { Link } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import { signInWithGoogle, signOutUser, useAuth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AccountMenu() {
  const user = useAuth();

  if (!user) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="hidden rounded-full sm:inline-flex"
        onClick={() => void signInWithGoogle()}
      >
        Sign in
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden rounded-full border border-border bg-background p-0.5 transition hover:border-primary sm:inline-flex"
        >
          <Avatar>
            {user.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName ?? user.email ?? "Profile"} />
            ) : (
              <AvatarFallback>{user.displayName?.[0] ?? user.email?.[0] ?? "U"}</AvatarFallback>
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={8} className="w-64">
        <DropdownMenuLabel className="pb-2 text-sm">
          {user.displayName ?? user.email ?? "Account"}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/account" className="flex items-center gap-2 w-full">
            <Settings className="size-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void signOutUser()}>
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
