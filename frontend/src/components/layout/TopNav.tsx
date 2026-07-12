import { Search, Bell, ChevronDown, HelpCircle, Command as CommandIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { notifications } from "@/lib/mock-data";

export function TopNav() {
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="h-full flex items-center gap-3 px-5 lg:px-8">
        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assets, employees, requests…"
            className="w-full h-10 rounded-xl bg-muted/60 border border-transparent focus:border-primary/40 focus:bg-background focus:ring-4 focus:ring-primary/10 outline-none pl-10 pr-16 text-[13.5px] placeholder:text-muted-foreground transition"
          />
          <kbd className="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center gap-1 rounded-md bg-background border border-border px-1.5 h-6 text-[10.5px] font-medium text-muted-foreground">
            <CommandIcon className="h-3 w-3" /> K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button className="hidden md:grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground transition">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>



          <Link to="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-muted text-muted-foreground transition">
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9.5px] font-bold grid place-items-center">
                {unread}
              </span>
            )}
          </Link>

          <div className="h-6 w-px bg-border mx-1.5" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1.5 pr-2 h-10 rounded-xl hover:bg-muted transition">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 grid place-items-center text-primary-foreground text-[12.5px] font-semibold">
                  PR
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-[13px] font-medium text-foreground flex items-center gap-1.5">
                    Priya R.
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                      Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">priya.r@assetflow.io</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/settings">Profile settings</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Company</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings">Roles & permissions</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
