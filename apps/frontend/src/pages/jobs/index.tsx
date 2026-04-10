import { useState } from "react";
import { JobTagStatus, JobTagPriorityText } from "@/components/shared/JobTag";
import { Search, Trash2, ArrowUpDown } from "lucide-react";
import {
  formatDate,
  JobApplication,
  JobFilters,
  JobQueryTypes,
} from "@career-sync/shared";
import { motion } from "motion/react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { selectJobs } from "@/store/selectors";
import {
  setFilter,
  setSearch,
  setSort,
  setSelectedAllItems,
  deselectAllItems,
  setSelectedItem,
} from "@/store/slices/jobSlice";
import { useGetJobsQuery, useDeleteJobMutation } from "@/store/api/jobsApi";
import Pagination from "@/components/shared/Pagination";
import usePaginationHooks from "@/hooks/usePagination";
import Skeleton from "@/components/shared/Skeleton";
import { EmptyState, ErrorState } from "@/components/shared/Placeholder";
import useJobHooks from "@/hooks/useJob";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { useDebounce } from "@/hooks/useDebounce";
import { resetPagination } from "@/store/slices/paginationSlice";
import { useGlobalModal } from "@/context/GlobalModalContext";
import { Checkbox } from "@/components/shared/Checkbox";

// JobTableHead
const JobTableHead = ({
  handleSort,
  disableSort = false,
}: {
  handleSort?: (field: "priority" | "applicationDate" | "company") => void;
  disableSort?: boolean;
}) => {
  const TH_BUTTON_CLASSES =
    "flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-gray-900 dark:hover:text-white disabled:cursor-not-allowed";

  const TH_TEXT_CLASSES =
    "px-4 py-4 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider";

  const TH_ACTION_CLASSES =
    "px-4 py-4 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider";

  return (
    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
      <tr>
        <th className="w-2 px-4 md:pl-6 md:pr-4 py-4"></th>
        <th className={TH_TEXT_CLASSES}>
          <button
            disabled={disableSort}
            onClick={() => handleSort?.("company")}
            className={TH_BUTTON_CLASSES}
          >
            Company
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </th>
        <th className={TH_TEXT_CLASSES}>Role</th>
        <th className={TH_TEXT_CLASSES}>Status</th>
        <th className={TH_TEXT_CLASSES}>
          <button
            disabled={disableSort}
            onClick={() => handleSort?.("priority")}
            className={TH_BUTTON_CLASSES}
          >
            Priority
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </th>
        <th className={TH_TEXT_CLASSES}>
          <button
            disabled={disableSort}
            onClick={() => handleSort?.("applicationDate")}
            className={TH_BUTTON_CLASSES}
          >
            Applied
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </th>
        <th className={TH_TEXT_CLASSES}>Location</th>
        <th className={TH_ACTION_CLASSES}>Actions</th>
      </tr>
    </thead>
  );
};

const JobTableSkeleton = ({ rows = 5 }) => {
  const tdClass = "px-4 py-4";
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <JobTableHead disableSort={true} />
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, index) => (
            <tr
              key={index}
              className="animate-pulse hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <td className={`${tdClass}`}>
                <Skeleton
                  variant="rectangular"
                  className="w-6 h-6 rounded-md"
                />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton variant="text" className="w-32 h-4 rounded-md" />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton variant="text" className="w-24 h-4 rounded-md" />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton
                  variant="rectangular"
                  className="w-20 h-6 rounded-full"
                />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton variant="text" className="w-16 h-4 rounded-md" />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton variant="text" className="w-20 h-4 rounded-md" />
              </td>
              <td className={`${tdClass}`}>
                <Skeleton variant="text" className="w-24 h-4 rounded-md" />
              </td>
              <td className={`${tdClass} flex justify-end`}>
                <Skeleton variant="circular" className="w-6 h-6" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

//Filters
const Filters = ({
  filters,
  jobs,
  isLoading,
}: {
  filters: JobFilters;
  jobs: JobApplication[];
  isLoading: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { selectedItems } = useAppSelector(selectJobs);
  const total = jobs.length;
  // const jobsSelected = jobs.filter((job) => selectedItems.includes(job.id));
  const jobsSelected = selectedItems.filter((id) =>
    jobs.some((job) => job.id === id),
  );

  const checkboxState =
    jobsSelected.length === 0
      ? "unchecked"
      : jobsSelected.length === total
        ? "checked"
        : "indeterminate";

  const filterList = [
    { label: "All", value: "All" },
    { label: "Applied", value: "Applied" },
    { label: "Under Review", value: "Under Review" },
    { label: "Interview", value: "Interview" },
    { label: "Offer", value: "Offer" },
    { label: "Rejected", value: "Rejected" },
    { label: "Withdrawn", value: "Withdrawn" },
  ];

  const priorityList = [
    { label: "All", value: "All" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
  ];

  const handleFilterChange = (filter: Partial<JobFilters>) => {
    dispatch(setFilter(filter));
    dispatch(resetPagination());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="flex w-full gap-4">
            <Checkbox
              name="selectAll"
              label={
                checkboxState === "checked" ? "Deselect All" : "Select All"
              }
              labelClassName="text-md font-semibold"
              variantSize="lg"
              className="w-44"
              state={checkboxState}
              checked={
                (checkboxState === "checked" ||
                  checkboxState === "indeterminate") &&
                !isLoading
              }
              onChange={(e) => {
                const ids = jobs.map((job) => job.id);
                const shouldSelectAll =
                  checkboxState === "indeterminate" || e.target.checked;

                dispatch(
                  shouldSelectAll
                    ? setSelectedAllItems(ids)
                    : deselectAllItems(ids),
                );
              }}
            />
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, role, or location..."
                value={filters.search}
                onChange={(e) => {
                  dispatch(setSearch(e.target.value));
                  dispatch(resetPagination());
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <Dropdown value={filters.status || filterList[0].label} align="left">
          {filterList.map((s) => (
            <DropdownItem
              key={s.value}
              item={s.value}
              selectedItem={filters.status || filterList[0].value}
              onSelect={() => {
                handleFilterChange({ status: s.value });
              }}
            />
          ))}
        </Dropdown>

        <Dropdown
          value={filters.priority || priorityList[0].label}
          align="left"
        >
          {priorityList.map((p) => (
            <DropdownItem
              key={p.value}
              item={p.value}
              selectedItem={filters.priority || priorityList[0].value}
              onSelect={() => handleFilterChange({ priority: p.value })}
            />
          ))}
        </Dropdown>
      </div>
    </motion.div>
  );
};

const JobsTable = ({
  jobs,
  handleSort,
  handleDelete,
  getJobsQuery,
}: {
  jobs: JobApplication[];
  handleSort: (field: "priority" | "applicationDate" | "company") => void;
  handleDelete: (id: string) => void;
  getJobsQuery: JobQueryTypes;
}) => {
  const dispatch = useAppDispatch();
  const { filters, selectedItems } = useAppSelector(selectJobs);

  const tdClass = "px-4 py-4";
  const { handleViewOnly } = useJobHooks();

  const emptyStateText = () => {
    if (filters.search) {
      return `No jobs match your search for "${filters.search}".`;
    }
    return "No jobs match your current filters.";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <JobTableHead handleSort={handleSort} />
          {jobs && jobs.length > 0 && (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job, index) => (
                <motion.tr
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 + index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleViewOnly(job, getJobsQuery)}
                >
                  <td className={`px-4 py-4`}>
                    <Checkbox
                      name="select"
                      variantSize="lg"
                      checked={selectedItems.includes(job.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => dispatch(setSelectedItem(job.id))}
                    />
                  </td>
                  <td className={`px-4 py-4`}>
                    <div className="font-medium text-gray-900 dark:text-white truncate max-w-37.5">
                      {job.company}
                    </div>
                  </td>
                  <td className={`${tdClass}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-37.5">
                      {job.roleTitle}
                    </div>
                  </td>
                  <td className={`${tdClass} min-w-37.5`}>
                    <JobTagStatus status={job.status} />
                  </td>
                  <td className={`${tdClass}`}>
                    <JobTagPriorityText priority={job.priority} />
                  </td>
                  <td className={`${tdClass} min-w-37.5`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(job.applicationDate)}
                    </div>
                  </td>
                  <td className={`${tdClass}`}>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-37.5">
                      {job.location || "N/A"}
                    </div>
                  </td>
                  <td className={`${tdClass}`}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id);
                        }}
                        className={`p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          )}
        </table>

        {/* No Data State */}
        {jobs?.length === 0 && <EmptyState title={emptyStateText()} />}
      </div>
    </div>
  );
};

const Jobs = () => {
  const dispatch = useAppDispatch();
  const { pages, handleNextPage } = usePaginationHooks();
  const { filters, sortBy, sortOrder } = useAppSelector(selectJobs);
  const { jobQueryBuilder } = useJobHooks();
  const debouncedSearch = useDebounce(filters.search, 500);
  const getJobsQuery = jobQueryBuilder("jobs", {
    page: pages.jobs || 1,
    search: debouncedSearch,
    status: filters.status,
    priority: filters.priority,
  });

  const { data, isFetching, isError } = useGetJobsQuery(getJobsQuery);
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const jobs = data?.jobs || [];
  const totalPages = data?.pagination?.totalPages;
  const hasJobs = jobs && jobs?.length > 0;

  const { handleGlobalModal } = useGlobalModal();

  // const filteredAndSortedJobs = useMemo(() => {
  //   const filtered = filterJobs(jobs, filters);
  //   return sortJobs(filtered, sortBy, sortOrder);
  // }, [jobs, filters, sortBy, sortOrder]);

  const handleSort = (newSortBy: typeof sortBy) => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    dispatch(setSort({ sortBy: newSortBy, sortOrder: newSortOrder }));
  };

  const confirmDelete = async (ids: string | string[]) => {
    try {
      await deleteJob({
        ids: Array.isArray(ids) ? ids : [ids],
        jobQuery: getJobsQuery,
      }).unwrap();
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const handleSingleDelete = async (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    const id = idList[0];

    const jobsToDelete = jobs.filter((job) => idList.includes(job.id));

    const description = () => {
      if (idList.length === 1) {
        return `Are you sure you want to delete your application for the <b>${jobsToDelete[0].roleTitle}</b> role at <b>${jobsToDelete[0].company}</b>? <br/> <br/> This action cannot be undone.`;
      } else {
        return `Are you sure you want to delete ${idList.length} applications? <br/> <br/> This action cannot be undone.`;
      }
    };

    handleGlobalModal({
      variant: "default",
      title: "Confirm Delete",
      description: description(),
      confirmText: "Delete",
      isLoading: isDeleting,
      onConfirm: () => confirmDelete(idList.length === 1 ? id : ids),
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Job Applications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage all your applications
        </p>
      </motion.div>

      {/* Filters */}
      <Filters filters={filters} jobs={jobs} isLoading={isFetching} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Loading State */}
        {isFetching && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <JobTableSkeleton />
          </div>
        )}

        {/* Error State */}
        {isError && !isFetching && !hasJobs && <ErrorState />}

        {/* Table */}
        {!isFetching && !isError && (
          <JobsTable
            jobs={jobs}
            handleSort={handleSort}
            handleDelete={handleSingleDelete}
            getJobsQuery={getJobsQuery}
          />
        )}
      </motion.div>

      {hasJobs && !isError && !isFetching && (
        <Pagination
          currentPage={pages.jobs || 1}
          totalPages={totalPages || 1}
          onPageChange={(page) => handleNextPage({ pages: { jobs: { page } } })}
        />
      )}
    </div>
  );
};

export default Jobs;
