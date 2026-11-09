import {
  Briefcase, ChefHat, Cog, Cpu, FlaskConical, GraduationCap, HardHat, HeartPulse, Palette, Plane, Scale, Sprout,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  health: HeartPulse,
  engineering: Cog,
  technology: Cpu,
  "business-finance": Briefcase,
  "law-public-service": Scale,
  education: GraduationCap,
  "agriculture-environment": Sprout,
  "creative-media": Palette,
  "construction-trades": HardHat,
  "hospitality-tourism": ChefHat,
  "science-research": FlaskConical,
  "transport-logistics": Plane,
};

export function ClusterIcon({ cluster, size = 20, className = "" }: { cluster: string; size?: number; className?: string }) {
  const Icon = icons[cluster] ?? Briefcase;
  return <Icon aria-hidden="true" size={size} strokeWidth={2} className={className} />;
}
