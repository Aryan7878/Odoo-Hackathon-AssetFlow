import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";

export type Crumb = { label: string; to?: string };

export function AppShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-64">
        <TopNav />
        <main className="px-5 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground mb-3">
                {breadcrumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {c.to ? (
                      <Link to={c.to} className="hover:text-foreground transition">{c.label}</Link>
                    ) : (
                      <span className="text-foreground font-medium">{c.label}</span>
                    )}
                    {i < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
                  </span>
                ))}
              </nav>
            )}
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div className="min-w-0">
                <h1 className="text-[26px] lg:text-[30px] font-semibold tracking-tight text-foreground leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="mt-1 text-[13.5px] text-muted-foreground max-w-2xl">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
