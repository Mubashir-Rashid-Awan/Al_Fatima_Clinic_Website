"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Clock, AlertCircle } from "lucide-react";
import type { TimeSlot } from "@/lib/booking/slots";

interface Props {
  doctorId: string;
  selectedDate: string | null; // "YYYY-MM-DD"
  selectedTime: string | null; // "HH:MM"
  onSelectDate: (date: string) => void;
  onSelectTime: (start: string, end: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function StepDateTime({
  doctorId,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onBack,
  onContinue,
}: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 60);

  useEffect(() => {
    if (!selectedDate) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/availability?doctorId=${doctorId}&date=${selectedDate}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load availability");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load available times. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [doctorId, selectedDate]);

  const availableSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">3. Choose a date</h2>
        <Card>
          <CardContent className="flex justify-center py-4">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(`${selectedDate}T00:00:00`) : undefined}
              onSelect={(date) => {
                if (date) onSelectDate(date.toISOString().slice(0, 10));
              }}
              disabled={{ before: today, after: maxDate }}
              className="w-full"
            />
          </CardContent>
        </Card>
      </div>

      {selectedDate && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" /> Choose a time
          </h2>

          {loading && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          )}

          {!loading && !error && availableSlots.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No available slots on this date. Please choose another date.
            </p>
          )}

          {!loading && !error && availableSlots.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {availableSlots.map((slot) => (
                <button
                  key={slot.start_time}
                  type="button"
                  onClick={() => onSelectTime(slot.start_time, slot.end_time)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-medium transition-colors hover:border-primary/60",
                    selectedTime === slot.start_time
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  )}
                >
                  {formatTime(slot.start_time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={!selectedDate || !selectedTime}>
          Continue
        </Button>
      </div>
    </div>
  );
}
