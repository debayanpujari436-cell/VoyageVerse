import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { AccountMenu } from "@/components/account-menu";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/simulate", label: "Simulate" },
  { to: "/destinations", label: "Destinations" },
  { to: "/compare", label: "Compare" },
  { to: "/trips", label: "My trips" },
  { to: "/admin", label: "Insights" },
  { to: "/account", label: "Account" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:flex sm:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="VoyageVerse logo" width={512} height={512} className="size-8 shrink-0" />
          <span className="truncate font-display text-base font-semibold sm:text-lg">VoyageVerse</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link to="/simulate" search={{ destination: undefined }}>
              Start simulation
            </Link>
          </Button>
          <AccountMenu />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      <div className={cn("overflow-hidden border-t border-border/60 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-7xl flex-col p-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={512} height={512} loading="lazy" className="size-7" />
            <span className="font-display font-semibold">VoyageVerse</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Try the trip before you buy the ticket. AI simulations of budget, weather, crowds and days.
          </p>
        </div>
        <FooterCol title="Product" links={[["Simulator", "/simulate"], ["Compare", "/compare"], ["My trips", "/trips"]]} />
        <FooterCol title="Explore" links={[["Destinations", "/destinations"], ["Home", "/"]]} />
        <FooterCol title="Company" links={[["Admin", "/admin"], ["Home", "/"]]} />
      </div>
      <div className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VoyageVerse. Simulated data for planning purposes.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}