import { LucideIcon } from "lucide-react";
import { STAGE_META } from "@/constant/landingPage";

export interface NavLink {
  href: string;
  label: string;
}

export interface PipelineCard {
  role: string;
  company: string;
  tag?: string;
  priority?: "Low" | "Medium" | "High";
}

export interface PipelineColumn {
  stage: keyof typeof STAGE_META;
  cards: PipelineCard[];
}

export interface StageMeta {
  label: string;
  icon: LucideIcon;
  chipBg: string;
  chipText: string;
}

export interface Step {
  n: string;
  title: string;
  text: string;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}
