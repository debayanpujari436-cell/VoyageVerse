"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LogOut, User, Users } from "lucide-react";
import { useAuth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { GlassCard, SectionTitle } from "@/components/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSimulations } from "@/lib/store";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — VoyageVerse" },
      { name: "description", content: "Manage your VoyageVerse profile and access your saved simulations." },
      { property: "og:title", content: "VoyageVerse Account" },
      { property: "og:description", content: "View your profile and saved trip simulations." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const user = useAuth();
  const sims = useSimulations();

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 text-center">
        <SectionTitle
          eyebrow="Account"
          title="Sign in to save your trips"
          description="Connect with Firebase authentication to keep your VoyageVerse simulations linked to your account."
        />
        <GlassCard className="mt-8 p-8">
          <p className="mb-6 text-sm text-muted-foreground">
            Once signed in, your profile and simulation history will be available across devices. Your My Trips page will show the same saved simulations.
          </p>
          <Button onClick={() => void signInWithGoogle()} className="rounded-full px-6 py-3">
            Sign in with Google
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <SectionTitle
        eyebrow="Account"
        title="Your VoyageVerse profile"
        description="Manage sign in, view your profile details, and jump to your saved trip simulations."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_320px]">
        <GlassCard className="space-y-6 p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName ?? user.email ?? "Profile"} />
              ) : (
                <AvatarFallback className="text-2xl font-semibold">
                  {user.displayName?.[0] ?? user.email?.[0] ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-base font-semibold">{user.displayName ?? "VoyageVerse user"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Badge variant="secondary" className="rounded-full px-4 py-3 text-sm">
              {sims.length} saved simulations
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-3 text-sm">
              {Math.max(sims.reduce((total, simulation) => total + simulation.input.days, 0), 0)} planned days
            </Badge>
            <Badge variant="secondary" className="rounded-full px-4 py-3 text-sm">
              {user.providerData[0]?.providerId ?? "firebase"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-5 py-3">
              <Link to="/trips">Go to My Trips</Link>
            </Button>
            <Button variant="outline" className="rounded-full px-5 py-3" onClick={() => void signOutUser()}>
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-8">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="size-5 text-primary" />
            <span>Connected account</span>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            Your saved simulations are available through your signed-in profile. Use My Trips to revisit any simulation and keep planning your next adventure.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
