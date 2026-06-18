import {
  Send,
  CalendarClock,
  CheckCircle2,
  LayoutGrid,
  BarChart3,
  FileText,
  ShieldCheck,
  LogIn,
  HelpCircle,
  CircleX,
  RefreshCw,
} from "lucide-react";
import {
  NavLink,
  Feature,
  Step,
  PipelineColumn,
} from "@/@types/landingPageTypes";

export const loginHref = "/login";
export const signupHref = "/signup";

export const NAV_LINKS: NavLink[] = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
];

export const STAGE_META = {
  applied: {
    label: "Applied",
    icon: Send,
    chipBg: "bg-blue-500/10 dark:bg-blue-500/10",
    chipText: "text-blue-600 dark:text-blue-400",
  },
  "under-review": {
    label: "Under Review",
    icon: HelpCircle,
    chipBg: "bg-purple-500/10 dark:bg-purple-500/10",
    chipText: "text-purple-600 dark:text-purple-400",
  },
  interview: {
    label: "Interview",
    icon: CalendarClock,
    chipBg: "bg-amber-500/10 dark:bg-amber-500/10",
    chipText: "text-amber-600 dark:text-amber-400",
  },
  offer: {
    label: "Offer",
    icon: CheckCircle2,
    chipBg: "bg-emerald-500/10 dark:bg-emerald-500/10",
    chipText: "text-emerald-600 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: CircleX,
    chipBg: "bg-red-500/10 dark:bg-red-500/10",
    chipText: "text-red-600 dark:text-red-400",
  },
  withdrawn: {
    label: "Withdrawn",
    icon: RefreshCw,
    chipBg: "bg-gray-500/10 dark:bg-gray-500/10",
    chipText: "text-gray-600 dark:text-gray-400",
  },
};

export const PIPELINE: PipelineColumn[] = [
  {
    stage: "applied",
    cards: [
      {
        role: "Software Engineer",
        company: "Google",
        tag: "Jun 18, 2026",
        priority: "Low",
      },
    ],
  },
  {
    stage: "under-review",
    cards: [],
  },
  {
    stage: "interview",
    cards: [],
  },
  {
    stage: "offer",
    cards: [],
  },
  {
    stage: "rejected",
    cards: [],
  },
  {
    stage: "withdrawn",
    cards: [],
  },
];

export const STEPS: Step[] = [
  {
    n: "01",
    title: "Log the detail",
    text: "Tap '+ Add Job' to quickly capture company records, targeting titles, operational environments, and core tracking context.",
  },
  {
    n: "02",
    title: "Track every stage",
    text: "Move your cards fluidly across your interactive Kanban lanes as initial applications advance into live round milestones.",
  },
  {
    n: "03",
    title: "Master your schedule",
    text: "Isolate critical tracking data using the calendar engine, neatly keeping interview dates separate from submission targets.",
  },
];

export const FEATURES: Feature[] = [
  {
    icon: BarChart3,
    title: "Metrics Dashboard",
    text: "Track real-time performance metrics via counters monitoring your total count of submissions, live reviews, and offers at a glance.",
  },
  {
    icon: FileText,
    title: "Granular Job Ledger",
    text: "Search, filter, and sort through data lists displaying application parameters, priorities, logs, and targeted actions.",
  },
  {
    icon: LayoutGrid,
    title: "Visual Kanban Board",
    text: "Track applications visually across structured status lanes—Applied, Under Review, Interview, and Offer columns.",
  },
  {
    icon: CalendarClock,
    title: "Chronological Calendar View",
    text: "Map milestones using a color-coded calendar engine. Easily isolate application deadlines from critical interviews.",
  },
  {
    icon: LogIn,
    title: "Quick sign-in",
    text: "Sign in with Google and pick up your search from any device.",
  },
  {
    icon: ShieldCheck,
    title: "Isolated & Private Structure",
    text: "Your professional data records are completely sandboxed and strictly visible only to your profile.",
  },
];

export const BUILT_FOR: string[] = [
  "New grads starting their first search for jobs.",
  "Career changers exploring a new field of work.",
  "Job seekers aiming to replace messy tab sets with single views.",
  "Anyone tired of spreadsheets and browser tabs.",
];
