import { useMemo } from "react";
import { motion } from "motion/react";
import StatCard from "@/components/StatCard";
import { Briefcase, Calendar, Gift, XCircle, Star } from "lucide-react";
import { JobTagStatus, JobTagPriorityIcon } from "@/components/shared/JobTag";
import useJobHooks from "@/hooks/useJob";
import { useGetJobsQuery } from "@/store/api/jobsApi";
import Skeleton from "@/components/shared/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/Placeholder";
import Pagination from "@/components/shared/Pagination";
import usePaginationHooks from "@/hooks/usePagination";

const JobRowSkeleton = () => (
  <div className="px-6 py-4 flex items-center justify-between">
    <div className="flex-1 min-w-0">
      {/* Company Name */}
      <Skeleton variant="text" className="w-full max-w-52 mb-2" />
      {/* Role Title */}
      <Skeleton variant="text" className="w-full max-w-48 h-3" />
    </div>
    <div className="ml-4 flex items-center gap-3">
      {/* Status Badge */}
      <Skeleton variant="rectangular" className="w-20 h-6 rounded-full" />
      {/* Date */}
      <Skeleton variant="text" className="w-16 h-3" />
    </div>
  </div>
);

const Dashboard = () => {
  const { jobQueryBuilder } = useJobHooks();
  const getJobsQuery = jobQueryBuilder("dashboard", { sort: "recent" });

  const { data, isFetching, isError } = useGetJobsQuery(getJobsQuery);

  const recentJobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs;
  }, [data]);

  const totalPages = data?.pagination?.totalPages;
  const hasRecentJobs = recentJobs && recentJobs?.length > 0;
  const isLoadingJobs = isFetching && !isError && recentJobs?.length === 0;

  const { handleViewOnly } = useJobHooks();

  const { pages, onPaginationAction } = usePaginationHooks();

  const stats = {
    total: data?.stats?.total || 0,
    interviews: data?.stats?.interviews || 0,
    offers: data?.stats?.offers || 0,
    rejected: data?.stats?.rejected || 0,
    applied: data?.stats?.applied || 0,
    highPriority: data?.stats?.highPriority || 0,
  };

  const statsArray = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Briefcase,
      color: "blue",
    },
    {
      title: "Interviews",
      value: stats.interviews,
      icon: Calendar,
      color: "orange",
    },
    { title: "Offers", value: stats.offers, icon: Gift, color: "green" },
    { title: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
    {
      title: "High Priority",
      value: stats.highPriority,
      icon: Star,
      color: "yellow",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-default">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your job application progress
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsArray.map((stat, index) => {
          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              delay={index * 0.1}
              isLoading={isLoadingJobs}
            />
          );
        })}
      </div>

      {/* Recent Applications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="surface rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-default">
            Recent Applications
          </h2>
        </div>

        {/* Loading State */}
        {isFetching && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <JobRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isFetching && !hasRecentJobs && <ErrorState />}

        {/* Data State */}
        {!isFetching && !isError && hasRecentJobs && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentJobs?.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 + index * 0.1 }}
                className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleViewOnly(job, getJobsQuery)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <JobTagPriorityIcon priority={job.priority} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-default truncate max-w-22.5 md:max-w-56">
                        {job.company}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-22.5 md:max-w-56">
                        {job.roleTitle}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <JobTagStatus status={job.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(job.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!isFetching && !isError && recentJobs?.length === 0 && (
          <EmptyState
            title="No recent job applications for the last 7 days"
            description="Click &rdquo;Add Job&rdquo; to get started"
          />
        )}
      </motion.div>

      {hasRecentJobs && !isError && !isFetching && (
        <Pagination
          currentPage={pages.dashboard || 1}
          totalPages={totalPages || 1}
          onPageChange={(page) =>
            onPaginationAction({
              pages: { dashboard: { page } },
              sort: "recent",
            })
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
