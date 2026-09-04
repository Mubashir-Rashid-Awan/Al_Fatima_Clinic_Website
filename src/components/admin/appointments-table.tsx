"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateAppointmentStatus } from "@/lib/admin/actions";
import type { AppointmentStatus, AppointmentWithDetails } from "@/types/database.types";

const STATUS_OPTIONS: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled"];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  completed: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function AppointmentsTable({ appointments }: { appointments: AppointmentWithDetails[] }) {
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [localAppointments, setLocalAppointments] = useState(appointments);

  const filtered = useMemo(
    () => (filter === "all" ? localAppointments : localAppointments.filter((a) => a.status === filter)),
    [localAppointments, filter]
  );

  function handleStatusChange(id: string, status: AppointmentStatus) {
    setLocalAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    startTransition(async () => {
      const res = await updateAppointmentStatus(id, status);
      if (!res.success) {
        toast.error(res.error ?? "Failed to update status");
        setLocalAppointments(appointments); // revert
      } else {
        toast.success("Status updated");
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...STATUS_OPTIONS] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
              filter === f ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>
                  <p className="font-medium">{appt.patient_first_name} {appt.patient_last_name}</p>
                  <p className="text-xs text-muted-foreground">{appt.patient_email}</p>
                  <p className="text-xs text-muted-foreground">{appt.patient_phone}</p>
                </TableCell>
                <TableCell>{appt.doctor?.full_name ?? "—"}</TableCell>
                <TableCell>{appt.service?.name ?? "—"}</TableCell>
                <TableCell>
                  {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
                </TableCell>
                <TableCell>
                  <Select
                    value={appt.status}
                    onValueChange={(value) => handleStatusChange(appt.id, value as AppointmentStatus)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Badge className={STATUS_STYLES[appt.status]} variant="secondary">
                        <SelectValue />
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">No appointments found.</p>
        )}
      </div>
    </div>
  );
}
