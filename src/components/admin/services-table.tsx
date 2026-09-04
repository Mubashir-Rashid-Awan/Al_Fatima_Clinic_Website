"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceFormDialog } from "@/components/admin/service-form-dialog";
import { deleteService, toggleServiceActive } from "@/lib/admin/actions";
import type { Service } from "@/types/database.types";

export function ServicesTable({ services }: { services: Service[] }) {
  const [list, setList] = useState(services);
  const [, startTransition] = useTransition();

  function handleToggle(service: Service) {
    const next = !service.is_active;
    setList((prev) => prev.map((s) => (s.id === service.id ? { ...s, is_active: next } : s)));
    startTransition(async () => {
      const res = await toggleServiceActive(service.id, next);
      if (!res.success) toast.error(res.error ?? "Failed to update");
    });
  }

  function handleDelete(service: Service) {
    if (!confirm(`Delete ${service.name}? This cannot be undone.`)) return;
    setList((prev) => prev.filter((s) => s.id !== service.id));
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (!res.success) {
        toast.error(res.error ?? "Failed to delete");
        setList(services);
      } else {
        toast.success("Service deleted");
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="font-medium">{service.name}</TableCell>
              <TableCell>{service.duration_minutes} min</TableCell>
              <TableCell>
                <button onClick={() => handleToggle(service)}>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Hidden"}
                  </Badge>
                </button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <ServiceFormDialog
                    service={service}
                    trigger={
                      <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(service)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No services yet.</p>}
    </div>
  );
}
