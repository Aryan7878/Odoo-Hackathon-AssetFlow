import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Bot, X, Send, Minimize2, Maximize2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Message Types ────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// ─── Intent Detection ─────────────────────────────────────────────────────────
type Intent =
  | "dashboard_stats"
  | "search_assets"
  | "asset_detail"
  | "allocations"
  | "overdue"
  | "employees"
  | "departments"
  | "maintenance"
  | "bookings"
  | "notifications"
  | "audit"
  | "navigate"
  | "greeting"
  | "unknown";

function detectIntent(query: string): { intent: Intent; params: Record<string, string> } {
  const q = query.toLowerCase().trim();
  const params: Record<string, string> = {};

  // Greeting
  if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|namaste|yo)\b/.test(q))
    return { intent: "greeting", params };

  // Dashboard
  if (/\b(dashboard|summary|stats|overview|total assets|how many assets|utilization)\b/.test(q))
    return { intent: "dashboard_stats", params };

  // Overdue / returns
  if (/\b(overdue|late|not returned|past due|overdue return)\b/.test(q))
    return { intent: "overdue", params };

  // Allocations
  if (/\b(allocation|allocated|who has|assigned to|allocate|transfer|issue)\b/.test(q)) {
    const nameMatch = q.match(/to\s+([a-z\s]+)$/);
    if (nameMatch) params.employeeName = nameMatch[1].trim();
    return { intent: "allocations", params };
  }

  // Maintenance
  if (/\b(maintenance|repair|service|broken|fix|pending maintenance|raise request|ticket)\b/.test(q))
    return { intent: "maintenance", params };

  // Bookings
  if (/\b(book|booking|meeting room|conference room|vehicle|resource|schedule|reserve)\b/.test(q))
    return { intent: "bookings", params };

  // Notifications
  if (/\b(notification|alert|unread|inbox|recent activity|activity)\b/.test(q))
    return { intent: "notifications", params };

  // Audit
  if (/\b(audit|missing|discrepancy|cycle|verify|audit progress)\b/.test(q))
    return { intent: "audit", params };

  // Departments
  if (/\b(department|team|division|section|group)\b/.test(q)) {
    const deptMatch = q.match(/\b(department|team)\s+([a-z]+)/);
    if (deptMatch) params.deptName = deptMatch[2];
    return { intent: "departments", params };
  }

  // Employees
  if (/\b(employee|staff|member|person|people|who is|find user|show user)\b/.test(q)) {
    const nameMatch = q.match(/\b(employee|staff|member|find|show user)\s+([a-z\s]+)$/);
    if (nameMatch) params.search = nameMatch[2].trim();
    return { intent: "employees", params };
  }

  // Navigation help
  if (/\b(where|how do i|how to|navigate|go to|open|find the|where is)\b/.test(q))
    return { intent: "navigate", params };

  // Asset search — most general, kept last
  if (/\b(asset|laptop|monitor|phone|mobile|vehicle|equipment|device|printer|keyboard|router|furniture|license|server|mac|dell|hp|lenovo|available|damaged|maintenance|idle)\b/.test(q)) {
    // Extract status
    if (/\b(available|free|unassigned)\b/.test(q)) params.status = "AVAILABLE";
    else if (/\b(allocated|assigned|in use)\b/.test(q)) params.status = "ALLOCATED";
    else if (/\b(maintenance|repair|service)\b/.test(q)) params.status = "UNDER_MAINTENANCE";
    else if (/\b(retired|decommissioned|disposed)\b/.test(q)) params.status = "RETIRED";
    else if (/\b(damaged|broken|faulty)\b/.test(q)) params.condition = "POOR";

    // Extract search term
    const searchTerms = ["laptop", "monitor", "phone", "vehicle", "printer", "keyboard", "router", "macbook", "dell", "hp", "lenovo", "mac", "server", "desktop", "tablet", "projector", "camera"];
    for (const term of searchTerms) {
      if (q.includes(term)) { params.search = term; break; }
    }
    // Generic asset name extraction
    if (!params.search) {
      const assetMatch = q.match(/(?:find|show|list|search for?)\s+(?:all\s+)?([a-z\s]+?)(?:\s+assets?|\s+in\b|$)/);
      if (assetMatch) params.search = assetMatch[1].trim();
    }

    return { intent: "search_assets", params };
  }

  return { intent: "unknown", params };
}

// Helper to parse bold, italic and code formats inline
function parseInlineMarkdown(text: string): React.ReactNode {
  // Regex to match **bold**, *italic*, or normal text
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

// ─── Markdown-like renderer ───────────────────────────────────────────────────
function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("### ")) {
      return <h3 key={i} className="text-[13px] font-semibold text-foreground mt-2 mb-1">{parseInlineMarkdown(line.slice(4))}</h3>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={i} className="text-[13px] font-bold text-foreground mt-2 mb-1">{parseInlineMarkdown(line.slice(3))}</h2>;
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return (
        <div key={i} className="flex items-start gap-1.5 text-[12.5px] mt-0.5">
          <span className="text-primary mt-0.5 shrink-0">•</span>
          <span>{parseInlineMarkdown(line.slice(2))}</span>
        </div>
      );
    }
    if (line.startsWith("  ✅")) {
      return <div key={i} className="text-[12.5px] text-success pl-3">{parseInlineMarkdown(line.trim())}</div>;
    }
    if (line.startsWith("  ⚠️") || line.startsWith("  ⚡")) {
      return <div key={i} className="text-[12.5px] text-warning-foreground pl-3">{parseInlineMarkdown(line.trim())}</div>;
    }
    if (line.startsWith("  🔴")) {
      return <div key={i} className="text-[12.5px] text-destructive pl-3">{parseInlineMarkdown(line.trim())}</div>;
    }
    if (line.startsWith("  🔵") || line.startsWith("  📦") || line.startsWith("  🏢")) {
      return <div key={i} className="text-[12.5px] text-muted-foreground pl-3">{parseInlineMarkdown(line.trim())}</div>;
    }
    if (line === "---") return <hr key={i} className="border-border my-2" />;
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <div key={i} className="text-[12.5px] leading-snug">{parseInlineMarkdown(line)}</div>;
  });
}

// ─── AI Engine ────────────────────────────────────────────────────────────────
async function processQuery(query: string, user: any): Promise<string> {
  const { intent, params } = detectIntent(query);
  const q = query.toLowerCase();

  try {
    switch (intent) {
      case "greeting": {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
        const name = user?.firstName || "there";
        return `${greeting}, **${name}**! 👋\n\nI'm **AssetPlanet AI**, your enterprise asset management assistant.\n\nHere's what I can help you with:\n• Search and filter assets\n• Check allocations and overdue returns\n• View maintenance requests\n• Check resource bookings\n• View dashboard statistics\n• Navigate the system\n\nWhat would you like to know?`;
      }

      case "dashboard_stats": {
        const stats = await apiClient.getDashboardStats();
        return `## Dashboard Summary\n\n• **Total Assets:** ${stats.totalAssets ?? 0}\n• **Available:** ${stats.availableAssets ?? 0}\n• **Allocated:** ${stats.allocatedAssets ?? 0}\n• **Under Maintenance:** ${stats.underMaintenanceAssets ?? 0}\n• **Retired:** ${stats.retiredAssets ?? 0}\n---\n• **Overdue Returns:** ${stats.overdueAssets ?? 0} ${(stats.overdueAssets ?? 0) > 0 ? "⚠️" : "✅"}\n• **Upcoming Returns (7d):** ${stats.upcomingReturns ?? 0}\n• **Pending Maintenance:** ${stats.pendingMaintenance ?? 0}\n• **Open Bookings:** ${stats.activeBookings ?? 0}\n\n_Last refreshed: ${new Date().toLocaleTimeString()}_`;
      }

      case "search_assets": {
        const assetsRes = await apiClient.getAssets({
          search: params.search || undefined,
          status: params.status || undefined,
          condition: params.condition || undefined,
          limit: 10,
        });
        const assets = assetsRes?.data || [];
        if (assets.length === 0) return `No assets found matching your query.\n\nTry a broader search term or visit the **Assets** page to browse all assets.`;
        const statusLabel = params.status ? ` (Status: ${params.status})` : "";
        let response = `## Assets Found${statusLabel} — ${assets.length} result${assets.length !== 1 ? "s" : ""}\n\n`;
        for (const a of assets.slice(0, 8)) {
          const statusIcon = a.status === "AVAILABLE" ? "✅" : a.status === "ALLOCATED" ? "🔵" : a.status === "UNDER_MAINTENANCE" ? "⚠️" : "🔴";
          response += `  ${statusIcon} **${a.assetTag}** — ${a.name}\n`;
          response += `  📦 Status: ${a.status}${a.category?.name ? ` | ${a.category.name}` : ""}${a.location ? ` | 📍 ${a.location}` : ""}\n`;
        }
        if (assets.length > 8) response += `\n_...and ${assets.length - 8} more. Visit **Assets** page for full results._`;
        response += `\n\nWant me to allocate any of these or get more details?`;
        return response;
      }

      case "allocations": {
        const search = params.employeeName || "";
        const allocs = await apiClient.getAllocations({ limit: 15, status: "ACTIVE" });
        const list = allocs?.data || [];
        if (list.length === 0) return `No active allocations found${search ? ` for "${search}"` : ""}.\n\nAll assets are currently in inventory.`;
        let filtered = list;
        if (search) {
          filtered = list.filter((a: any) => {
            const name = `${a.allocatedTo?.firstName} ${a.allocatedTo?.lastName}`.toLowerCase();
            return name.includes(search.toLowerCase());
          });
        }
        if (filtered.length === 0) return `No active allocations found for **"${search}"**.\n\nEmployee may not have any assets assigned. Check the **Employees** page.`;
        let response = `## Active Allocations${search ? ` — ${search}` : ""}\n${filtered.length} allocation${filtered.length !== 1 ? "s" : ""} found\n\n`;
        for (const a of filtered.slice(0, 8)) {
          const emp = a.allocatedTo ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : "Unknown";
          const due = a.expectedReturn ? new Date(a.expectedReturn).toLocaleDateString() : "No due date";
          const overdue = a.expectedReturn && new Date(a.expectedReturn) < new Date();
          response += `  ${overdue ? "🔴" : "🔵"} **${a.asset?.assetTag}** — ${a.asset?.name}\n`;
          response += `  🏢 Assigned to: ${emp}${a.allocatedTo?.department?.name ? ` · ${a.allocatedTo.department.name}` : ""}\n`;
          response += `  📅 Due: ${due}${overdue ? " **OVERDUE**" : ""}\n`;
        }
        return response;
      }

      case "overdue": {
        const allocs = await apiClient.getAllocations({ limit: 50, status: "ACTIVE" });
        const all = allocs?.data || [];
        const overdue = all.filter((a: any) => a.expectedReturn && new Date(a.expectedReturn) < new Date());
        if (overdue.length === 0) return `✅ No overdue returns! All assets with due dates have been returned on time.\n\nGreat job keeping the inventory clean.`;
        let response = `## 🔴 Overdue Returns — ${overdue.length} asset${overdue.length !== 1 ? "s" : ""}\n\n`;
        for (const a of overdue) {
          const emp = a.allocatedTo ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : "Unknown";
          const daysOverdue = Math.floor((Date.now() - new Date(a.expectedReturn).getTime()) / 86400000);
          response += `  🔴 **${a.asset?.assetTag}** — ${a.asset?.name}\n`;
          response += `  👤 ${emp}${a.allocatedTo?.department?.name ? ` · ${a.allocatedTo.department.name}` : ""} — **${daysOverdue}d overdue**\n`;
        }
        response += `\nGo to **Allocations** page to process returns.`;
        return response;
      }

      case "employees": {
        const empRes = await apiClient.getEmployees({ limit: 10, search: params.search || "" });
        const emps = empRes?.data || [];
        if (emps.length === 0) return `No employees found${params.search ? ` matching "${params.search}"` : ""}.\n\nTry the **Employees** page to browse the full directory.`;
        let response = `## Employees${params.search ? ` — "${params.search}"` : ""}\n${emps.length} found\n\n`;
        for (const e of emps.slice(0, 8)) {
          const roleLabel = e.role === "ADMIN" ? "Admin" : e.role === "ASSET_MANAGER" ? "Asset Manager" : "Employee";
          response += `  🏢 **${e.firstName} ${e.lastName}** (${e.employeeId})\n`;
          response += `  📧 ${e.email} | ${roleLabel}${e.department?.name ? ` · ${e.department.name}` : ""}\n`;
          response += `  📦 Assets assigned: ${e._count?.allocations ?? 0}\n`;
        }
        return response;
      }

      case "departments": {
        const depts = await apiClient.getDepartments();
        if (!depts || depts.length === 0) return `No departments found. Visit the **Departments** page to add one.`;
        let response = `## Departments Overview\n${depts.length} departments\n\n`;
        for (const d of depts) {
          response += `  🏢 **${d.name}** (${d.code})\n`;
          response += `  👥 Members: ${d._count?.users ?? 0} | 📦 Assets: ${d._count?.assets ?? 0}\n`;
        }
        return response;
      }

      case "maintenance": {
        const isRaise = /\b(raise|create|submit|new|report|log)\b/.test(q);
        if (isRaise) return `To raise a maintenance request:\n\n• Go to the **Maintenance** page\n• Click **"Raise request"** button\n• Select the asset, describe the issue, and set priority\n\nOr tell me the asset tag and issue description and I can guide you through it.`;
        
        const reqs = await apiClient.getMaintenanceRequests();
        const all = Array.isArray(reqs) ? reqs : [];
        const pending = all.filter((m: any) => m.status === "PENDING");
        const approved = all.filter((m: any) => m.status === "APPROVED");
        const inProgress = all.filter((m: any) => m.status === "IN_PROGRESS");
        const completed = all.filter((m: any) => m.status === "COMPLETED");

        if (all.length === 0) return `No maintenance requests found.\n\nAll assets appear to be in good working order! ✅`;

        let response = `## Maintenance Overview\n\n• 🟡 Pending: ${pending.length}\n• 🔵 Approved: ${approved.length}\n• 🔧 In Progress: ${inProgress.length}\n• ✅ Completed: ${completed.length}\n---\n`;

        const showList = q.includes("pending") ? pending : q.includes("progress") ? inProgress : q.includes("complet") ? completed : pending;
        const listLabel = q.includes("pending") ? "Pending" : q.includes("progress") ? "In Progress" : q.includes("complet") ? "Completed" : "Pending";
        if (showList.length > 0) {
          response += `\n### ${listLabel} Requests\n`;
          for (const m of showList.slice(0, 5)) {
            const prioIcon = m.priority === "CRITICAL" ? "🔴" : m.priority === "HIGH" ? "⚠️" : m.priority === "MEDIUM" ? "🔵" : "⚡";
            response += `  ${prioIcon} **${m.asset?.assetTag}** — ${m.asset?.name}\n`;
            response += `  📝 ${m.description?.slice(0, 80)}${m.description?.length > 80 ? "…" : ""}\n`;
          }
        }
        response += `\nVisit the **Maintenance** page to take action.`;
        return response;
      }

      case "bookings": {
        const isAvailability = /\b(available|free|vacant|empty|check)\b/.test(q);
        const resources = await apiClient.getResources();
        const resourcesList = Array.isArray(resources) ? resources : [];

        if (isAvailability || q.includes("meeting room") || q.includes("conference")) {
          if (resourcesList.length === 0) return `No resources configured. Visit **Resource Booking** to see available rooms.`;
          let response = `## Available Resources\n${resourcesList.length} resources found\n\n`;
          for (const r of resourcesList) {
            const typeLabel = r.type === "MEETING_ROOM" ? "Meeting Room" : r.type === "VEHICLE" ? "Vehicle" : r.type === "SHARED_EQUIPMENT" ? "Equipment" : r.type;
            response += `  🏢 **${r.name}** — ${typeLabel}\n`;
            if (r.capacity) response += `  👥 Capacity: ${r.capacity}${r.location ? ` | 📍 ${r.location}` : ""}\n`;
          }
          response += `\nTo book a resource, visit the **Resource Booking** page and click **"New booking"**.`;
          return response;
        }

        const bookings = await apiClient.getBookings();
        const bookingsList = Array.isArray(bookings) ? bookings : [];
        const active = bookingsList.filter((b: any) => b.status !== "CANCELLED" && new Date(b.endTime) > new Date());
        if (active.length === 0) return `No upcoming bookings found.\n\nTo create a new booking, visit the **Resource Booking** page.`;
        let response = `## Upcoming Bookings\n${active.length} booking${active.length !== 1 ? "s" : ""}\n\n`;
        for (const b of active.slice(0, 6)) {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          response += `  🔵 **${b.resource?.name}** — ${b.title}\n`;
          response += `  📅 ${start.toLocaleDateString()} · ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n`;
          if (b.bookedBy) response += `  👤 Booked by: ${b.bookedBy.firstName} ${b.bookedBy.lastName}\n`;
        }
        return response;
      }

      case "notifications": {
        const notifs = await apiClient.getNotifications();
        const all = Array.isArray(notifs) ? notifs : [];
        const unread = all.filter((n: any) => !n.isRead);
        if (all.length === 0) return `Your inbox is empty. No notifications to show.`;
        let response = `## Notifications\n${unread.length} unread · ${all.length} total\n\n`;
        for (const n of all.slice(0, 6)) {
          const icon = n.type === "SUCCESS" ? "✅" : n.type === "WARNING" ? "⚠️" : n.type === "ERROR" ? "🔴" : "🔵";
          response += `  ${icon} **${n.title}**${!n.isRead ? " 🔸" : ""}\n`;
          response += `  📝 ${n.message?.slice(0, 80)}${n.message?.length > 80 ? "…" : ""}\n`;
        }
        if (unread.length > 0) response += `\nTo mark all as read, visit the **Notifications** page.`;
        return response;
      }

      case "audit": {
        const cycles = await apiClient.getAuditCycles();
        const all = Array.isArray(cycles) ? cycles : [];
        if (all.length === 0) return `No audit cycles found.\n\nTo create one, visit the **Audit** page and click **"New audit cycle"**.`;
        let response = `## Audit Cycles\n${all.length} cycle${all.length !== 1 ? "s" : ""}\n\n`;
        for (const c of all.slice(0, 5)) {
          const total = c._count?.items ?? 0;
          const verified = c.items?.filter((i: any) => i.status !== "PENDING")?.length ?? 0;
          const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
          const statusIcon = c.status === "COMPLETED" ? "✅" : c.status === "IN_PROGRESS" ? "🔵" : "🟡";
          response += `  ${statusIcon} **${c.title}**\n`;
          response += `  📅 ${new Date(c.startDate).toLocaleDateString()}${c.endDate ? ` – ${new Date(c.endDate).toLocaleDateString()}` : ""}\n`;
          if (total > 0) response += `  📦 Progress: ${verified}/${total} (${pct}%)\n`;
        }
        response += `\nVisit the **Audit** page to review and verify individual assets.`;
        return response;
      }

      case "navigate": {
        const navMap: Array<[RegExp, string]> = [
          [/asset/i, "**Assets** → Navigate to **/assets** in the sidebar"],
          [/allocat/i, "**Allocations** → Navigate to **/allocations** in the sidebar\nClick **New allocation** to assign an asset"],
          [/employee|staff|people/i, "**Employees** → Navigate to **/employees** in the sidebar"],
          [/department/i, "**Departments** → Navigate to **/departments** in the sidebar"],
          [/category|categories/i, "**Categories** → Navigate to **/categories** in the sidebar"],
          [/maintenance|repair/i, "**Maintenance** → Navigate to **/maintenance** in the sidebar\nClick **Raise request** to log a new issue"],
          [/book|meeting|room|resource/i, "**Resource Booking** → Navigate to **/bookings** in the sidebar\nClick **New booking** to reserve a room or vehicle"],
          [/audit/i, "**Audit** → Navigate to **/audit** in the sidebar\nClick **New audit cycle** to start an inventory check"],
          [/notification/i, "**Notifications** → Navigate to **/notifications** in the sidebar\nOr check the bell icon in the top navigation"],
          [/setting|profile|account/i, "**Settings** → Navigate to **/settings** in the sidebar\nHere you can update your profile and change the theme"],
          [/admin|user management|approve|pending/i, "**Admin Panel** → Navigate to **/admin** in the sidebar (Admin only)\nHere you can approve/reject/manage all user accounts"],
          [/register|add employee|new employee/i, "New employees must self-register at **/register**\nAn Admin then approves them via the **Admin Panel**"],
          [/dashboard/i, "**Dashboard** → Navigate to **/** (home) in the sidebar\nShows live stats, charts and recent activity"],
        ];
        for (const [pattern, guide] of navMap) {
          if (pattern.test(q)) {
            return `## Navigation Guide\n\n${guide}`;
          }
        }
        return `I can guide you to:\n\n• Dashboard (home)\n• Assets\n• Allocations\n• Employees\n• Departments\n• Categories\n• Maintenance\n• Resource Booking\n• Audit\n• Notifications\n• Admin Panel\n• Settings\n\nWhat are you looking for?`;
      }

      default: {
        return `I'm not sure I understood that. Here are some things you can ask me:\n\n• **"Show available laptops"** — search assets\n• **"Who has the MacBook Pro?"** — find allocations\n• **"Show overdue returns"** — track late assets\n• **"Pending maintenance"** — view repair requests\n• **"Dashboard summary"** — see live stats\n• **"Available meeting rooms"** — check bookings\n• **"Show employees in Engineering"** — find staff\n• **"How do I allocate an asset?"** — navigation help\n\nWhat would you like to know?`;
      }
    }
  } catch (err: any) {
    const msg = err?.message || "Unknown error";
    if (msg.includes("No active session") || msg.includes("401")) {
      return `I need you to be logged in to fetch live data. Please sign in and try again.`;
    }
    return `I ran into an issue fetching data: **${msg}**\n\nPlease check your connection or try again in a moment.`;
  }
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Dashboard summary",
  "Show available assets",
  "Overdue returns",
  "Pending maintenance",
  "Available meeting rooms",
  "Show unread notifications",
];

// ─── Main Widget ──────────────────────────────────────────────────────────────
export function AIChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (messages.length === 0) {
        const name = user?.firstName || "there";
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: `Hello, **${name}**! 👋\n\nI'm **AssetPlanet AI**. I can help you search assets, check allocations, view maintenance requests, find bookings, and much more.\n\nTry a quick action below or type your question!`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    const loadingMsg: Message = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await processQuery(text, user);
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading ? { ...m, content: response, isLoading: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.isLoading
            ? { ...m, content: "Sorry, something went wrong. Please try again.", isLoading: false }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }, [loading, user]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage(input);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300",
            expanded ? "w-[520px] h-[680px]" : "w-[380px] h-[540px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-3.5 border-b border-border rounded-t-2xl bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-foreground">AssetPlanet AI</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                Online · Powered by live data
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                aria-label={expanded ? "Minimize" : "Maximize"}
              >
                {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mr-2 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2.5 text-[12.5px] leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted/50 text-foreground rounded-bl-sm border border-border/50"
                  )}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-[12px]">Fetching live data…</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {renderContent(msg.content)}
                    </div>
                  )}
                  <div className={cn("text-[10px] mt-1.5", msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground/60")}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when no messages beyond welcome) */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11.5px] px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/50 text-muted-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about assets…"
              className="flex-1 h-9 rounded-xl text-[12.5px] bg-muted/40"
              disabled={loading}
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-xl shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
