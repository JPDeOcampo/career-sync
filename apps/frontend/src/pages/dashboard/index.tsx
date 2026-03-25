import { motion } from "motion/react";
import { useAppSelector } from "@/hooks/useRedux";
import { selectJobs } from "@/store/selectors";
import StatCard from "@/components/StatCard";
import { Briefcase, Calendar, Gift, XCircle, AlertCircle } from "lucide-react";
import JobStatus from "@/components/shared/JobStatus";
import useJobHooks from "@/hooks/useJob";
import { useGetJobsQuery } from "@/store/api/jobsApi";
import Skeleton from "@/components/shared/Skeleton";
import Error from "@/components/shared/Error";

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
  const { isLoading, isError } = useGetJobsQuery({
    sort: "recent",
    page: 1,
    limit: 10,
  });
  const { jobs } = useAppSelector(selectJobs);
  const recentJobs = jobs;
  const hasRecentJobs = recentJobs && recentJobs?.length > 0;
  const isLoadingJobs = isLoading && !isError && recentJobs?.length === 0;
  const { handleViewOnly } = useJobHooks();

  const stats = {
    total: jobs.length,
    interviews: jobs.filter(
      (job) => job.status === "Interview", // || job.interviewDate
    ).length,
    offers: jobs.filter((job) => job.status === "Offer" || job.offer).length,
    rejected: jobs.filter((job) => job.status === "Rejected").length,
    highPriority: jobs.filter((job) => job.priority === "High").length,
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
      color: "yellow",
    },
    { title: "Offers", value: stats.offers, icon: Gift, color: "green" },
    { title: "Rejected", value: stats.rejected, icon: XCircle, color: "red" },
    {
      title: "High Priority",
      value: stats.highPriority,
      icon: AlertCircle,
      color: "purple",
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
        {isLoadingJobs && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <JobRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && !hasRecentJobs && <Error />}

        {/* Data State */}
        {!isLoading && !isError && hasRecentJobs && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentJobs?.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handleViewOnly(job)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-default truncate">
                      {job.company}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {job.roleTitle}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <JobStatus status={job.status} />
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
        {!isLoading && !isError && recentJobs?.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No job applications yet</p>
            <p className="text-sm mt-1">
              Click &rdquo;Add Job&rdquo; to get started
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
