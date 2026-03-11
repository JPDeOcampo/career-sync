const JobStatus = ({ status }: { status: string }) => {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        status === "Applied"
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : status === "Interview"
            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            : status === "Offer"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : status === "Rejected"
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : status === "Under Review"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {status}
    </span>
  );
};

export default JobStatus;
