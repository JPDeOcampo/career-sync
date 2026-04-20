import { useState, useMemo, useEffect } from "react";
import { JobApplication } from "@career-sync/shared";
import { DayPicker } from "react-day-picker";
import { format, parseISO, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { JobTagStatus } from "@/components/shared/JobTag";
import "react-day-picker/dist/style.css";
import useJobHooks from "@/hooks/useJob";
import { useGetJobsQuery } from "@/store/api/jobsApi";
import { Skeleton } from "@/components/shared/Loading";

type CalendarFilter = "all" | "applications" | "interviews";

const CalendarSkeleton = () => {
  return (
    <div className="w-110 p-4 mx-auto ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-24 h-5 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="h-3 w-10 mx-auto"
          />
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 justify-items-center">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" className="h-11 w-10" />
        ))}
      </div>
    </div>
  );
};

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filter, setFilter] = useState<CalendarFilter>("all");
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const { jobQueryBuilder } = useJobHooks();

  const getJobsQuery = jobQueryBuilder("jobs", { limit: 0 });

  const { data, isFetching, isError } = useGetJobsQuery(getJobsQuery);
  const jobs = data?.jobs || [];
  const latestStage = selectedJob?.interviewStages?.at(-1);
  const modifiersClassNames = {
    application: "rdp-day--application",
    interview: "rdp-day--interview",
  };

  // Get dates with applications
  const applicationDates = useMemo(() => {
    return jobs.map((job) => parseISO(job.applicationDate));
  }, [jobs]);

  // Get dates with interviews
  const interviewDates = useMemo(() => {
    return jobs
      .filter((job) => job.interviewStages?.length)
      .map((job) => {
        const lastStage =
          job.interviewStages &&
          job.interviewStages[job.interviewStages.length - 1];

        if (!lastStage?.interviewDate) return null;

        return parseISO(lastStage.interviewDate);
      })
      .filter((date): date is Date => date !== null);
  }, [jobs]);

  // Get jobs for selected date
  const jobsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    if (selectedDate) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    const applicationsOnDate = jobs.filter((job) =>
      isSameDay(parseISO(job.applicationDate), selectedDate),
    );

    const interviewsOnDate = jobs.filter((job) => {
      const lastStage = job.interviewStages?.at(-1);
      const dateStr = lastStage?.interviewDate;

      if (!dateStr) return false;

      return isSameDay(parseISO(dateStr), selectedDate);
    });

    if (filter === "applications") return applicationsOnDate;
    if (filter === "interviews") return interviewsOnDate;

    // Merge and deduplicate
    const allJobs = [...applicationsOnDate];
    interviewsOnDate.forEach((job) => {
      if (!allJobs.find((j) => j.id === job.id)) {
        allJobs.push(job);
      }
    });

    return allJobs;
  }, [selectedDate, jobs, filter]);

  // Custom modifiers for DayPicker
  const modifiers = useMemo(() => {
    const mods: Record<string, Date[]> = {};

    if (filter === "all" || filter === "applications") {
      mods.application = applicationDates;
    }

    if (filter === "all" || filter === "interviews") {
      mods.interview = interviewDates;
    }

    return mods;
  }, [applicationDates, interviewDates, filter]);

  useEffect(() => {
    if (selectedDate) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Calendar View
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track applications and interviews by date
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-100 dark:border-gray-700 w-fit"
      >
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter("applications")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "applications"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => setFilter("interviews")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "interviews"
              ? "bg-blue-600 text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          Interviews
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
            {/*Loading State*/}
            {isFetching && !isError && <CalendarSkeleton />}

            {/*Error State*/}
            {!isFetching && isError && (
              <div className="text-center py-2 text-red-500">
                <p className="text-sm">
                  Failed to load calendar data. Please try again later.
                </p>
              </div>
            )}

            {/*Success State*/}
            {!isFetching && !isError && (
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                showOutsideDays
              />
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                Legend
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Application Date
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Interview Date
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Date Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-32">
            {selectedDate ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                </div>

                {jobsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {jobsForSelectedDate.map((job) => {
                      const latestStage =
                        job.interviewStages &&
                        job.interviewStages[job.interviewStages.length - 1];
                      return (
                        <motion.div
                          key={job.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setSelectedJob(job)}
                        >
                          <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                            {job.company}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {job.roleTitle}
                          </div>
                          <JobTagStatus status={job.status} />
                          {isSameDay(
                            parseISO(latestStage?.interviewDate || ""),
                            selectedDate,
                          ) && (
                            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                              📅 Interview scheduled
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No events on this date</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a date to view details</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden z-50"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedJob.company}
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {selectedJob.roleTitle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedJob.jobDescription}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Status:
                    </span>
                    <div className="mt-1">
                      <JobTagStatus status={selectedJob.status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Type:
                    </span>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {selectedJob.jobType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">
                      Work Setup:
                    </span>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {selectedJob.workSetup}
                    </p>
                  </div>
                  {selectedJob.location && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Location:
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {selectedJob.location}
                      </p>
                    </div>
                  )}
                  {selectedJob.salary && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        Salary:
                      </span>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {selectedJob.salary}
                      </p>
                    </div>
                  )}
                </div>

                {latestStage && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-900 dark:text-yellow-400 mb-2">
                      Interview Details:
                    </h4>
                    <div className="text-sm space-y-1 text-yellow-800 dark:text-yellow-300">
                      <p>
                        Date:{" "}
                        {format(
                          parseISO(latestStage.interviewDate),
                          "MMMM d, yyyy",
                        )}
                      </p>
                      {latestStage.interviewTime && (
                        <p>Time: {latestStage.interviewTime}</p>
                      )}
                      {latestStage.interviewerName && (
                        <p>Interviewer: {latestStage.interviewerName}</p>
                      )}
                      <p>
                        Stage-{selectedJob?.interviewStages?.length}:{" "}
                        {latestStage.interviewType}
                      </p>
                    </div>
                  </div>
                )}

                {selectedJob.notes && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Notes:
                    </span>
                    <p className="text-gray-900 dark:text-white mt-1 text-sm">
                      {selectedJob.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
