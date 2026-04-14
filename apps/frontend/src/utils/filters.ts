import { JobApplication, JobFilters, isDateInRange } from "@career-sync/shared";

export const filterJobs = (
  jobs: JobApplication[],
  filters: JobFilters,
): JobApplication[] => {
  return jobs.filter((job) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        job.company.toLowerCase().includes(searchLower) ||
        job.roleTitle.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== "All" && job.status !== filters.status) {
      return false;
    }

    // Priority filter
    if (filters.priority !== "All" && job.priority !== filters.priority) {
      return false;
    }

    // Date range filter
    if (!isDateInRange(job.applicationDate, filters.dateFrom, filters.dateTo)) {
      return false;
    }

    return true;
  });
};

export const sortJobs = (
  jobs: JobApplication[],
  sortBy: "applicationDate" | "company" | "priority",
  sortOrder: "asc" | "desc",
): JobApplication[] => {
  const sorted = [...jobs].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "applicationDate":
        comparison =
          new Date(a.applicationDate).getTime() -
          new Date(b.applicationDate).getTime();
        break;
      case "company":
        comparison = a.company.localeCompare(b.company);
        break;
      case "priority":
        const priorityOrder = { All: 0, High: 3, Medium: 2, Low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return sorted;
};
