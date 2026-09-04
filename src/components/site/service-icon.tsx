import {
  Activity,
  Baby,
  HeartPulse,
  Smile,
  Sparkles,
  Stethoscope,
  type LucideProps,
} from "lucide-react";

// Only a fixed, known set of icons is rendered here — the icon name
// comes from the database (editable in the admin dashboard), so we
// map it through an allow-list rather than dynamically resolving an
// arbitrary import, which keeps this safe and predictable.
const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Stethoscope,
  Smile,
  HeartPulse,
  Baby,
  Sparkles,
  Activity,
};

export function ServiceIcon({ iconName, ...props }: { iconName: string | null } & LucideProps) {
  const Icon = (iconName && ICON_MAP[iconName]) || Stethoscope;
  return <Icon {...props} />;
}
