import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Doctor & Service", "Date & Time", "Your Details", "Confirmation"];

export function BookingStepper({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mb-10 flex items-center justify-between">
      {STEPS.map((step, i) => {
        const stepNumber = i + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <span
                className={cn(
                  "hidden text-center text-xs sm:block",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
            {stepNumber !== STEPS.length && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded transition-colors",
                  isComplete ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
