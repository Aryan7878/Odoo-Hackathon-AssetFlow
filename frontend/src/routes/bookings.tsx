import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { toast } from "sonner";
import {
  Plus, CalendarClock, Users2, MapPin, Car, Camera, DoorOpen, Trash,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [{ title: "Resource Booking · AssetFlow" }, { name: "description", content: "Book meeting rooms, vehicles and shared equipment." }] }),
  component: BookingsPage,
});

const resourceIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  "MEETING_ROOM": DoorOpen,
  "VEHICLE": Car,
  "SHARED_EQUIPMENT": Camera,
  "PROJECTOR": Camera,
};

function BookingsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("cards");

  // Queries
  const resourcesQuery = useQuery({
    queryKey: ["resources"],
    queryFn: () => apiClient.getResources(),
  });

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () => apiClient.getBookings(),
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiClient.cancelBooking(id, "Cancelled by user."),
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to cancel booking");
    },
  });

  const resourcesData = resourcesQuery.data || [];
  const bookingsData = bookingsQuery.data || [];

  const getTypeName = (type: string) => {
    switch (type) {
      case "MEETING_ROOM": return "Meeting Room";
      case "VEHICLE": return "Vehicle";
      case "SHARED_EQUIPMENT": return "Shared Equipment";
      case "PROJECTOR": return "Projector";
      default: return type;
    }
  };

  const formatDate = (val: any) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (val: any) => {
    if (!val) return "—";
    return new Date(val).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  // Next booking calculations for cards
  const getNextBookingText = (resId: string) => {
    const upcoming = bookingsData
      .filter((b: any) => b.resourceId === resId && new Date(b.startTime) > new Date() && b.status !== "CANCELLED")
      .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
      
    if (!upcoming) return "Available";
    return `${formatDate(upcoming.startTime)} · ${formatTime(upcoming.startTime)}`;
  };

  const isLoading = resourcesQuery.isLoading || bookingsQuery.isLoading;

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
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : resourcesData.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No resources registered in the system.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {resourcesData.map((r: any) => {
                const Icon = resourceIcon[r.type] ?? DoorOpen;
                return (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-5 card-hover">
                    <div className="flex items-start justify-between">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-semibold bg-muted text-muted-foreground rounded-md px-2 py-0.5">{getTypeName(r.type)}</span>
                    </div>
                    <div className="mt-4">
                      <div className="text-[15px] font-semibold text-foreground">{r.name}</div>
                      <div className="mt-2 space-y-1 text-[12.5px] text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Users2 className="h-3.5 w-3.5" /> Capacity {r.capacity || "—"}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {r.location || "Default Location"}</div>
                        <div className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Next · {getNextBookingText(r.id)}</div>
                      </div>
                    </div>
                    <Button size="sm" className="mt-4 w-full rounded-xl" onClick={() => setOpen(true)}>Book resource</Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-5">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="text-[14px] font-semibold">Active Calendar Overview</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold uppercase text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNum = i - 2;
                const today = dayNum === new Date().getDate();
                const dayDate = new Date();
                dayDate.setDate(dayNum);
                
                // Find bookings on this specific day
                const dayBookings = bookingsData.filter((b: any) => {
                  const bDate = new Date(b.startTime);
                  return bDate.getDate() === dayNum && bDate.getMonth() === dayDate.getMonth() && b.status !== "CANCELLED";
                });

                return (
                  <div key={i} className={`min-h-24 rounded-xl border p-2 ${today ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                    <div className="text-[12px] font-semibold text-foreground">
                      {dayNum >= 1 && dayNum <= 31 ? dayNum : ""}
                    </div>
                    <div className="mt-1.5 space-y-1">
                      {dayBookings.slice(0, 2).map((b: any) => (
                        <div key={b.id} className="text-[10.5px] font-medium bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 truncate">
                          {b.resource?.name || "Booking"} · {formatTime(b.startTime)}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <div className="text-[9.5px] text-muted-foreground pl-1">+{dayBookings.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-5">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : bookingsData.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No bookings made yet.</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-3 px-4 font-medium">Resource</th>
                    <th className="py-3 px-2 font-medium">User</th>
                    <th className="py-3 px-2 font-medium">Date</th>
                    <th className="py-3 px-2 font-medium">Time</th>
                    <th className="py-3 px-2 font-medium">Purpose</th>
                    <th className="py-3 px-2 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookingsData.map((b: any) => {
                    const bookedUser = b.bookedBy ? `${b.bookedBy.firstName} ${b.bookedBy.lastName}` : "—";
                    return (
                      <tr key={b.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{b.resource?.name}</td>
                        <td className="py-3 px-2">{bookedUser}</td>
                        <td className="py-3 px-2 text-muted-foreground">{formatDate(b.startTime)}</td>
                        <td className="py-3 px-2 text-muted-foreground">{formatTime(b.startTime)} – {formatTime(b.endTime)}</td>
                        <td className="py-3 px-2 text-muted-foreground">{b.title}</td>
                        <td className="py-3 px-2"><StatusBadge status={b.status === "CONFIRMED" ? "Confirmed" : b.status === "CANCELLED" ? "Cancelled" : b.status} /></td>
                        <td className="py-3 px-4 text-right">
                          {b.status !== "CANCELLED" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => cancelMutation.mutate(b.id)}>
                              <Trash className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BookingDialog open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [resourceId, setResourceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("15:30");
  const [purpose, setPurpose] = useState("");

  const resourcesQuery = useQuery({
    queryKey: ["resources"],
    queryFn: () => apiClient.getResources(),
  });

  const bookingMutation = useMutation({
    mutationFn: (data: any) => apiClient.createBooking(data),
    onSuccess: () => {
      toast.success("Resource booked successfully");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      onOpenChange(false);
      // Reset
      setResourceId("");
      setPurpose("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to book resource");
    },
  });

  const resourcesList = resourcesQuery.data || [];

  const handleConfirm = () => {
    if (!resourceId || !purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startISO = new Date(`${date}T${start}:00`).toISOString();
    const endISO = new Date(`${date}T${end}:00`).toISOString();

    bookingMutation.mutate({
      resourceId,
      title: purpose,
      startTime: startISO,
      endTime: endISO,
    });
  };

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
            <Select value={resourceId} onValueChange={setResourceId}>
              <SelectTrigger><SelectValue placeholder="Select a resource" /></SelectTrigger>
              <SelectContent>
                {resourcesList.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.name} · {getTypeName(r.type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">Start</Label>
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label className="text-[12.5px] mb-1.5 block">End</Label>
              <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-[12.5px] mb-1.5 block">Purpose</Label>
            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Brief description…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={bookingMutation.isPending}>
            {bookingMutation.isPending ? "Booking..." : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getTypeName(type: string) {
  switch (type) {
    case "MEETING_ROOM": return "Meeting Room";
    case "VEHICLE": return "Vehicle";
    case "SHARED_EQUIPMENT": return "Shared Equipment";
    case "PROJECTOR": return "Projector";
    default: return type;
  }
}
