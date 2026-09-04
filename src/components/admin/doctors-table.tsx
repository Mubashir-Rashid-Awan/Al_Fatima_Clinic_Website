"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoctorFormDialog } from "@/components/admin/doctor-form-dialog";
import { deleteDoctor, toggleDoctorActive } from "@/lib/admin/actions";
import type { Doctor, Service } from "@/types/database.types";

export function DoctorsTable({ doctors, services }: { doctors: (Doctor & { serviceIds: string[] })[]; services: Service[] }) {
  const [list, setList] = useState(doctors);
  const [, startTransition] = useTransition();

  function handleToggle(doctor: Doctor) {
    const next = !doctor.is_active;
    setList((prev) => prev.map((d) => (d.id === doctor.id ? { ...d, is_active: next } : d)));
    startTransition(async () => {
      const res = await toggleDoctorActive(doctor.id, next);
      if (!res.success) toast.error(res.error ?? "Failed to update");
    });
  }

  function handleDelete(doctor: Doctor) {
    if (!confirm(`Delete ${doctor.full_name}? This cannot be undone.`)) return;
    setList((prev) => prev.filter((d) => d.id !== doctor.id));
    startTransition(async () => {
      const res = await deleteDoctor(doctor.id);
      if (!res.success) {
        toast.error(res.error ?? "Failed to delete");
        setList(doctors);
      } else {
        toast.success("Doctor deleted");
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell className="font-medium">{doctor.full_name}</TableCell>
              <TableCell>{doctor.specialty}</TableCell>
              <TableCell>{doctor.years_experience} yrs</TableCell>
              <TableCell>
                <button onClick={() => handleToggle(doctor)}>
                  <Badge variant={doctor.is_active ? "default" : "secondary"}>
                    {doctor.is_active ? "Active" : "Hidden"}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <DoctorFormDialog
                    doctor={doctor}
                    services={services}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(doctor)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No doctors yet.</p>}
    </div>
  );
}
