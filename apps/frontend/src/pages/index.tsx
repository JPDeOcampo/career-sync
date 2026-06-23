"use client";
import React from "react";
import { ArrowRight, Clock, Briefcase } from "lucide-react";
import {
  STAGE_META,
  PIPELINE,
  STEPS,
  FEATURES,
  BUILT_FOR,
  signupHref,
} from "@/constant/landingPage";
import { PipelineColumn, StageMeta } from "@/@types/landingPageTypes";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface KanbanPreviewProps {
  pipeline: PipelineColumn[];
  stageMeta: Record<string, StageMeta>;
}

const KanbanPreview: React.FC<KanbanPreviewProps> = ({
  pipeline,
  stageMeta,
}) => (
  <div className="md:max-w-7xl w-full md:col-span-7 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 px-4 pt-4 lg:px-6 md:pt-6 rounded-xl shadow-xl dark:shadow-2xl/40">
    <div className="flex items-center justify-between mb-5 border-b border-slate-100 dark:border-slate-800/80 pb-4">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-amber-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="text-xs font-mono font-medium text-slate-400 ml-2">
          kanban_board
        </span>
      </div>
      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
        Preview
      </span>
    </div>

    <div className="overflow-x-auto scrollbar-thin">
      <div className="grid grid-flow-col auto-cols-[150px] gap-4 pb-4 md:pb-6">
        {pipeline.map((column) => {
          const { label, chipBg, chipText } =
            (stageMeta as unknown as Record<string, StageMeta>)[column.stage] ||
            {};
          return (
            <div
              key={column.stage}
              className="flex flex-col gap-3 bg-slate-50 dark:bg-[#0b111e]/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900/60 min-h-45"
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {label || column.stage}
                </span>
                <span
                  className={cn(
                    "w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center",
                    chipBg,
                    chipText,
                  )}
                >
                  {column.cards.length}
                </span>
              </div>
              {column.cards.length === 0 ? (
                <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center p-4">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
                    No jobs tracked
                  </span>
                </div>
              ) : (
                column.cards.map((card, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {card.company}
                      </p>
                      {card.priority && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                          ◯ {card.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2.5">
                      {card.role}
                    </p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <Clock size={9} /> {card.tag}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="min-h-screen bg-background text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased selection:bg-blue-600/20 mt-16 lg:pt-0">
      {/* Hero Layout */}
      <section id="top" className="bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col md:grid md:grid-cols-12 gap-12 items-center px-4 lg:px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto">
          <div className="md:col-span-5 text-left">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4 bg-blue-500/10 dark:bg-blue-500/10 px-4 py-2 rounded-full">
              Track your job application progress
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
              Every application, <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
                one absolute view.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 w-full max-w-md leading-relaxed wrap-break-word">
              CareerSync organizes your entire job search in one intelligent
              workspace, from first application to final offer.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <a
                href={signupHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold px-5 py-3.5 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Get started <ArrowRight size={18} />
              </a>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-semibold px-5 py-3.5 transition-colors shadow-xs"
              >
                See workflow structure
              </Link>
            </div>
          </div>

          <KanbanPreview pipeline={PIPELINE} stageMeta={STAGE_META} />
        </div>
      </section>

      {/* Ribbon Banner */}
      <div className="bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800/60 py-4 transition-colors">
        <p className="text-center font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4 lg:px-6">
          No spreadsheets. No sticky notes. No &ldquo;wait, did I already apply
          here?&ldquo;
        </p>
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-slate-50 dark:bg-slate-900 border-b border-foreground/10"
      >
        <div className="px-4 lg:px-6 py-24  max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <span className="text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">
              How it works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Accelerate applications from raw links to official job offers.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="flex flex-col items-start relative group"
              >
                <div className="font-mono text-5xl font-black text-slate-300/80 dark:text-slate-800/80 mb-4 select-none group-hover:text-blue-600/20 dark:group-hover:text-blue-400/20 transition-colors">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-4 lg:px-6 py-24 max-w-7xl mx-auto">
        <div className="max-w-xl mb-16">
          <span className="text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built with everything an optimized tracking system demands.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 border border-blue-100/20 dark:border-blue-900/30">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About Context & Story */}
      <section
        id="about"
        className="bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800/60"
      >
        <div className=" px-4 lg:px-6 py-24 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <span className="text-sm font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-3">
              Context & Story
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Built because job hunting deserved better than a spreadsheet.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-4">
              CareerSync started as a simple tracker for a job search that had
              outgrown sticky notes and a messy spreadsheet. Every role lived in
              a different tab: one for applied, one for maybe, one for
              &ldquo;did I already apply to this place?&ldquo;
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              CareerSync replaces all of that with one structured view of a
              search: what&apos;s been sent, what&apos;s pending a reply,
              what&apos;s coming up, and what&apos;s been decided. No tabs to
              dig through, no guessing where things stand.
            </p>
          </div>
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0b111e]/60 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase
                size={18}
                className="text-blue-600 dark:text-blue-400"
              />
              <p className="text-md font-bold text-slate-900 dark:text-slate-100">
                Built for
              </p>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-5">
              CareerSync fits anywhere in an active search.
            </p>
            <div className="space-y-3">
              {BUILT_FOR.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-normal">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* End CTA Block */}
      <section className="bg-slate-800 text-white dark:bg-slate-900 border-t border-foreground/10 px-4 lg:px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Bring your job search into one view.
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Add your first application and see your whole pipeline in one place.
          </p>
          <a
            href={signupHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-base font-bold px-4 lg:px-6 py-3.5 shadow-lg shadow-blue-600/10 transition-transform active:scale-[0.98]"
          >
            Create your account <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default App;
