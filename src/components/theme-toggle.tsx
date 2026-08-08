import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("vacsim.theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("vacsim.theme", next ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle} className="rounded-full">
      {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}