"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { MenuBar } from "@/components/menu-bar";
import { Button } from "@/components/ui/button";

type AuthRole = "ADMIN" | "MANAGER" | "SALESMAN";

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [role, setRole] = useState<AuthRole | null>(null);
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      return;
    }

    let isMounted = true;

    async function loadUser() {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        return;
      }

      const result = (await response.json()) as { data?: { role?: AuthRole } };

      if (isMounted) {
        setRole(result.data?.role ?? null);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [isLoginPage]);

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="bg-background min-h-svh md:flex">
      <MenuBar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} role={role} />

      <div className="min-w-0 flex-1">
        <header className="bg-background/95 sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 backdrop-blur md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="size-4" aria-hidden="true" />
          </Button>
          <p className="text-sm font-semibold">Inventory Management</p>
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
