import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { resources, bookings } from "@/lib/mock-data";
import {
  Plus, CalendarClock, Users2, MapPin, Car, Camera, DoorOpen, TriangleAlert,
} from "lucide-react";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Resource Booking · AssetFlow" }, { name: "description", content: "Book meeting rooms, vehicles and shared equipment." }] }),
  component: BookingsPage,
});

const resourceIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  "Meeting Room": DoorOpen, "Vehicle": Car, "Shared Equipment": Camera,
};

function BookingsPage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("cards");

  return (
    <AppShell
      title="Resource Booking"
      description="Meeting rooms, fleet vehicles and shared equipment — reserved without conflicts."
      breadcrumbs={[{ label: "AssetFlow", to: "/" }, { label: "Resource Booking" }]}
      actions={<Button size="sm" className="rounded-xl h-9" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> New booking</Button>}
    >
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="rounded-xl">
          <TabsTrigger value="cards" className="rounded-lg">Resources</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg">Calendar</TabsTrigger>
          <TabsTrigger value="list" className="rounded-lg">List view</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {resources.map((r) => {
              const Icon = resourceIcon[r.type] ?? DoorOpen;
              return (
                <div key={r.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
                  <div className="flex items-start justify-between">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold bg-muted text-muted-foreground rounded-md px-2 py-0.5">{r.type}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[15px] font-semibold text-foreground">{r.name}</div>
                    <div className="mt-2 space-y-1 text-[12.5px] text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5" /> Capacity {r.capacity}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r.location}</div>
                      <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Next · {r.nextBooking}</div>
                    </div>
                  </div>
                  <Button size="sm" className="mt-4 w-full rounded-xl" onClick={() => setOpen(true)}>Book resource</Button>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="text-[14px] font-semibold">July 2026</div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 rounded-lg">Today</Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">◄</Button>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">►</Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold uppercase text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2;
                const has = [12, 13, 14, 15].includes(day);
                const today = day === 12;
                return (
                  <div key={i} className={`min-h-24 rounded-xl border p-2 ${today ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className={`text-[12px] font-semibold ${day < 1 || day > 31 ? "text-muted-foreground/40" : "text-foreground"}`}>
                      {day >= 1 && day <= 31 ? day : ""}
                    </div>
                    {has && (
                      <div className="mt-1.5 space-y-1">
                        <div className="text-[10.5px] font-medium bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 truncate">Aurora · 14:00</div>
                        {day === 15 && <div className="text-[10.5px] font-medium bg-warning/20 text-warning-foreground rounded-md px-1.5 py-0.5 truncate">FX3 · 10:00</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-5">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-[13px]">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium">Resource</th>
                  <th className="py-3 px-2 font-medium">User</th>
                  <th className="py-3 px-2 font-medium">Date</th>
                  <th className="py-3 px-2 font-medium">Time</th>
                  <th className="py-3 px-2 font-medium">Purpose</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{b.resource}</td>
                    <td className="py-3 px-2">{b.user}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.date}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.start} – {b.end}</td>
                    <td className="py-3 px-2 text-muted-foreground">{b.purpose}</td>
                    <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <BookingDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [start, setStart] = useState("14:00");
  const [conflict, setConflict] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Book a resource</DialogTitle>
          <DialogDescription>Reserve a meeting room, vehicle or shared kit.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Resource</Label>
            <Select onValueChange={(v) => setConflict(v === "r-1")}>
              <SelectTrigger><SelectValue placeholder="Select a resource" /></SelectTrigger>
              <SelectContent>
                {resources.map((r) => <SelectItem key={r.id} value={r.id}>{r.name} · {r.type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Date</Label>
              <Input type="date" defaultValue="2026-07-12" />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Start</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">End</Label>
              <Input type="time" defaultValue="15:30" />
            </div>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Purpose</Label>
            <Textarea placeholder="Brief description…" />
          </div>
          {conflict && (
            <div className="rounded-xl border border-destructive/25 bg-destructive/8 p-3 flex items-start gap-2.5">
              <TriangleAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-[12.5px]">
                <div className="font-semibold text-destructive">Time conflict</div>
                <div className="text-muted-foreground">Aurora Boardroom is booked by Amelia Torres at 14:00–15:30. Choose another slot or resource.</div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={conflict} onClick={() => onOpenChange(false)}>Confirm booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
