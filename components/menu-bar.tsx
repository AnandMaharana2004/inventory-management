"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  Boxes,
  ChevronDown,
  ClipboardList,
  FileChartColumn,
  X,
  Package,
  ReceiptText,
  ShoppingCart,
  Shield,
  Store,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthRole = "ADMIN" | "MANAGER" | "SALESMAN";

const navigationItems = [
  {
    label: "Purchase",
    href: "/purchases",
    icon: ShoppingCart,
  },
  {
    label: "Sales",
    href: "/sales",
    icon: ReceiptText,
  },
  {
    label: "Report",
    href: "/reports",
    icon: FileChartColumn,
  },
  {
    label: "Stock",
    href: "/stocks",
    icon: Boxes,
  },
];

const masterNavigationItems = [
  {
    label: "User",
    href: "/admin",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Item",
    href: "/items",
    icon: Package,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Vender",
    href: "/venders",
    icon: Store,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Discount",
    href: "/discounts",
    icon: BadgePercent,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Customer",
    href: "/customers",
    icon: Users,
    roles: ["ADMIN", "MANAGER", "SALESMAN"],
  },
];

type MenuBarProps = {
  isOpen: boolean;
  onClose: () => void;
  role: AuthRole | null;
};

export function MenuBar({ isOpen, onClose, role }: MenuBarProps) {
  const pathname = usePathname();
  const [isMasterOpen, setIsMasterOpen] = useState(false);
  const visibleMasterItems = role
    ? masterNavigationItems.filter((item) => item.roles.includes(role))
    : [];
  const isMasterActive = visibleMasterItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const isMasterDropdownOpen = isMasterOpen || isMasterActive;

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r shadow-xl transition-transform duration-200 ease-out md:sticky md:top-0 md:z-auto md:h-svh md:w-64 md:max-w-none md:translate-x-0 md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
              <ClipboardList className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">Inventory</p>
              <p className="text-muted-foreground text-xs">Management</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Close menu"
            onClick={onClose}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {visibleMasterItems.length > 0 ? (
            <div className="pt-1">
              <button
                type="button"
                aria-expanded={isMasterDropdownOpen}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isMasterActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
                onClick={() => setIsMasterOpen((current) => !current)}
              >
                <Shield className="size-4" aria-hidden="true" />
                <span className="flex-1 text-left">Master</span>
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isMasterDropdownOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-200 ease-out",
                  isMasterDropdownOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-sidebar-border/80 mt-1 ml-4 flex flex-col gap-1 border-l py-1 pl-3">
                    {visibleMasterItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive &&
                            "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
