import { motion } from "motion/react";
import { useAppSelector } from "@/hooks/useRedux";
import { selectAuth, selectJobs } from "@/store/selectors";
import StatCard from "@/components/StatCard";
import { Briefcase, Calendar, Gift, XCircle, AlertCircle } from "lucide-react";
import JobStatus from "@/components/shared/JobStatus";
import useJobHooks from "@/hooks/useJob";

const Dashboard = () => {
  const auth = useAppSelector(selectAuth);
  console.log(auth);
  const jobs = useAppSelector(selectJobs).jobs;
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

  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime(),
    )
    .slice(0, 5);

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
        <StatCard
          title="Total Applications"
          value={stats.total}
          icon={Briefcase}
          color="blue"
          delay={0}
        />
        <StatCard
          title="Interviews"
          value={stats.interviews}
          icon={Calendar}
          color="yellow"
          delay={0.1}
        />
        <StatCard
          title="Offers"
          value={stats.offers}
          icon={Gift}
          color="green"
          delay={0.2}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="red"
          delay={0.3}
        />
        <StatCard
          title="High Priority"
          value={stats.highPriority}
          icon={AlertCircle}
          color="purple"
          delay={0.4}
        />
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

        {recentJobs.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
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
        ) : (
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
