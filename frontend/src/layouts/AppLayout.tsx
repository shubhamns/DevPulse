import { useState, type ComponentType } from "react";
import {
  Activity,
  BarChart3,
  Bug,
  FolderKanban,
  LogOut,
  Menu,
  Plug,
  Rocket,
  Settings,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Brand } from "@/components/Brand";
import { GlassBackdrop } from "@/components/GlassBackdrop";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const navItems: Array<{
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { to: "/dashboard", label: "Dashboard", icon: Activity },
  { to: "/issues", label: "Issues", icon: Bug },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/releases", label: "Releases", icon: Rocket },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1.5 p-3">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl border transition-all",
                    isActive
                      ? "border-primary/20 bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-500 group-hover:text-primary",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function UserInitials({ name }: { name?: string }) {
  const initials = (name ?? "Developer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xs font-semibold text-primary">
      {initials}
    </div>
  );
}

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative h-svh w-full overflow-hidden text-foreground">
      <GlassBackdrop />
      <div className="relative flex h-full gap-3 p-3">
        <aside className="glass-sidebar hidden h-full w-72 shrink-0 flex-col overflow-hidden rounded-3xl lg:flex">
          <div className="px-4 py-5">
            <Brand />
          </div>
          <Separator className="bg-slate-200/80" />
          <ScrollArea className="min-h-0 flex-1">
            <SidebarNav />
          </ScrollArea>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <header className="glass-panel flex h-16 shrink-0 items-center justify-between gap-4 rounded-3xl px-4 lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-slate-200 bg-white p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>DevPulse workspace navigation</SheetDescription>
                  </SheetHeader>
                  <div className="px-4 py-5">
                    <Brand />
                  </div>
                  <Separator />
                  <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
                </SheetContent>
              </Sheet>
              <UserInitials name={user?.name} />
              <div className="min-w-0">
                <p className="text-[11px] tracking-[0.16em] text-slate-400 uppercase">Signed in</p>
                <p className="truncate font-medium text-slate-900">{user?.name ?? "Developer"}</p>
              </div>
            </div>
            <Button variant="outline" size="lg" className="gap-2 rounded-full" onClick={() => void logout()}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden rounded-3xl">
            <ScrollArea className="h-full">
              <main className="w-full px-2 py-2 lg:px-3 lg:py-3">
                <Outlet />
              </main>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
