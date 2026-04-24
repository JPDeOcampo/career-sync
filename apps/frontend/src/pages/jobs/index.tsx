import { useMemo } from "react";
import { JobTagStatus, JobTagPriorityText } from "@/components/shared/JobTag";
import { Search, Trash2, ArrowUpDown } from "lucide-react";
import {
  formatDate,
  getTimeAgo,
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
import { toast } from "sonner";

// JobTableHead
type ColumnKey =
  | "company"
  | "role"
  | "status"
  | "priority"
  | "applicationDate"
  | "location"
  | "actions";

const JobTableHead = ({
  handleSort,
  disableSort = false,
  visibleColumns = [
    "company",
    "role",
    "status",
    "priority",
    "applicationDate",
    "location",
    "actions",
  ],
}: {
  handleSort?: (field: "priority" | "applicationDate" | "company") => void;
  disableSort?: boolean;
  visibleColumns?: ColumnKey[];
}) => {
  const show = (col: ColumnKey) => visibleColumns.includes(col);

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

        {show("company") && (
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
        )}

        {show("role") && <th className={TH_TEXT_CLASSES}>Role</th>}

        {show("status") && <th className={TH_TEXT_CLASSES}>Status</th>}

        {show("priority") && (
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
        )}

        {show("applicationDate") && (
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
        )}

        {show("location") && <th className={TH_TEXT_CLASSES}>Location</th>}

        {show("actions") && <th className={TH_ACTION_CLASSES}>Actions</th>}
      </tr>
    </thead>
  );
};

const JobTableSkeleton = ({ rows = 5 }) => {
  const tdClass = "px-4 py-4";

  return (
    <>
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* DESKTOP SKELETON */}

        <table className="w-full">
          <JobTableHead disableSort={true} />
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className={tdClass}>
                  <Skeleton className="w-6 h-6 rounded-md" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-32 h-4 rounded-md" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-24 h-4 rounded-md" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-20 h-6 rounded-full" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-16 h-4 rounded-md" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-20 h-4 rounded-md" />
                </td>
                <td className={tdClass}>
                  <Skeleton className="w-24 h-4 rounded-md" />
                </td>
                <td className={`${tdClass} flex justify-end`}>
                  <Skeleton className="w-6 h-6 rounded-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD SKELETON */}
      <div className="block md:hidden p-2 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 ">
                <Skeleton className="w-5 h-5 rounded-md" />

                <div>
                  <div className="space-y-2">
                    <Skeleton className="w-28 h-4 rounded-md" />
                    <Skeleton className="w-20 h-4 rounded-md" />
                  </div>
                  {/* Tags Row */}
                  <div className="flex items-center gap-2 my-3 flex-wrap">
                    <Skeleton className="w-14 h-4 rounded-full" />
                    <Skeleton className="w-12 h-4 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between mt-3">
              <Skeleton className="w-20 h-3 rounded-md" />
              <Skeleton className="w-16 h-3 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

//Filters
type FilterKey = "search" | "filters" | "actions";

const Filters = ({
  filters,
  jobs,
  isLoading,
  handleDelete,
  visibleColumns = ["search", "filters", "actions"],
  isInContainer = true,
}: {
  filters: JobFilters;
  jobs: JobApplication[];
  isLoading?: boolean;
  handleDelete: (id: string[]) => void;
  visibleColumns?: FilterKey[];
  isInContainer?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { selectedItems } = useAppSelector(selectJobs);

  const show = (filter: FilterKey) => visibleColumns.includes(filter);

  const total = jobs.length;

  const jobsSelected = selectedItems.filter((id) =>
    jobs.some((job) => job.id === id),
  );

  const checkboxState =
    jobsSelected.length === 0
      ? "unchecked"
      : jobsSelected.length === total
        ? "checked"
        : "indeterminate";

  const isDisabled = checkboxState === "unchecked" || isLoading;

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

  const content = (
    <>
      {show("search") && (
        <div className="md:col-span-2">
          <div className="flex w-full gap-4">
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
      )}

      {show("filters") && (
        <div className="md:col-span-2 flex items-center gap-4">
          <Dropdown
            value={`Status: ${filters.status || filterList[0].value}`}
            align="left"
          >
            {filterList.map((s) => (
              <DropdownItem
                key={s.value}
                item={s.value}
                selectedItem={filters.status || filterList[0].value}
                onSelect={() => handleFilterChange({ status: s.value })}
              />
            ))}
          </Dropdown>

          <Dropdown
            value={`Priority: ${filters.priority || priorityList[0].value}`}
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
      )}

      {show("actions") && (
        <div className="flex items-center gap-4 justify-between w-full">
          <Checkbox
            name="selectAll"
            label={checkboxState === "checked" ? "Deselect All" : "Select All"}
            labelClassName={`text-md font-semibold text-foreground/90    ${
              isLoading || jobs.length === 0
                ? "text-foreground/40 cursor-not-allowed opacity-60"
                : " text-foreground/90 hover:text-foreground"
            }`}
            variantSize="lg"
            className="w-44"
            state={checkboxState}
            checked={
              (checkboxState === "checked" ||
                checkboxState === "indeterminate") &&
              !isLoading
            }
            disabled={isLoading || jobs.length === 0}
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

          <button
            disabled={isDisabled}
            className={`flex gap-2 items-center font-semibold transition-colors
              ${
                isDisabled
                  ? "text-foreground/40 cursor-not-allowed opacity-60"
                  : "text-foreground/90 hover:text-red-500 cursor-pointer"
              }`}
            onClick={() => handleDelete(jobsSelected)}
          >
            <Trash2 className={`w-6 h-6 ${isDisabled ? "opacity-60" : ""}`} />
            <span className="hidden md:block">Delete</span>
          </button>
        </div>
      )}
    </>
  );

  if (!isInContainer) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">{content}</div>
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
  handleDelete: (id: string | string[]) => void;
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
    return "No jobs match.";
  };

  return (
    <>
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className=" w-full">
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

      <div className="block md:hidden space-y-3">
        <div className="py-3 px-4 flex items-center gap-8 justify-between border-b border-gray-200 dark:border-gray-700">
          <Filters
            filters={filters}
            jobs={jobs}
            handleDelete={handleDelete}
            visibleColumns={["actions"]}
            isInContainer={false}
          />
        </div>
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => handleViewOnly(job, getJobsQuery)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 ">
                <Checkbox
                  name="select"
                  variantSize="lg"
                  checked={selectedItems.includes(job.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => dispatch(setSelectedItem(job.id))}
                />

                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base">
                    {job.company}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-45">
                    {job.roleTitle}
                  </p>

                  <div className="flex flex-col gap-1 text-xs mt-1 mb-3 text-gray-500">
                    <span>Applied Date: {formatDate(job.applicationDate)}</span>
                    <span className="truncate max-w-30">
                      Location: {job.location || "N/A"}
                    </span>
                    <span className="truncate max-w-30">
                      Work Setup: {job.workSetup || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(job.id);
                }}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Info */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 flex-wrap">
                <JobTagStatus status={job.status} />
                <JobTagPriorityText priority={job.priority} />
              </div>
              <span>{getTimeAgo(job.createdAt)}</span>
            </div>
          </div>
        ))}

        {jobs?.length === 0 && <EmptyState title={emptyStateText()} />}
      </div>
    </>
  );
};

const Jobs = () => {
  const dispatch = useAppDispatch();
  const { pages, onPaginationAction } = usePaginationHooks();
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
  const [deleteJob] = useDeleteJobMutation();

  const totalPages = data?.pagination?.totalPages;
  const jobs = useMemo(() => {
    if (!data?.jobs) return [];
    return data.jobs;
  }, [data]);

  const hasJobs = jobs && jobs?.length > 0;
  const { handleGlobalModal } = useGlobalModal();

  const handleSort = (newSortBy: typeof sortBy) => {
    const newSortOrder =
      sortBy === newSortBy && sortOrder === "desc" ? "asc" : "desc";
    dispatch(setSort({ sortBy: newSortBy, sortOrder: newSortOrder }));
  };

  const confirmDelete = async (ids: string | string[]) => {
    handleGlobalModal({
      isLoading: true,
    });
    try {
      await deleteJob({
        ids: Array.isArray(ids) ? ids : [ids],
      }).unwrap();
      if (ids.length === pages.limit) {
        onPaginationAction({ pages: { jobs: { page: pages.jobs - 1 } } });
      }
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job, please try again later.");
    } finally {
      handleGlobalModal({});
    }
  };

  const handleDelete = async (ids: string | string[]) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    const id = idList[0];

    const jobsToDelete = jobs.filter((job) => idList.includes(job.id));

    const description = () => {
      if (idList.length === 1) {
        const job = jobsToDelete[0];

        return (
          <>
            <p>
              Are you sure you want to delete your application for the{" "}
              <b>{job.roleTitle}</b> role at <b>{job.company}</b>?
            </p>
            <p className="my-2">This action cannot be undone.</p>
          </>
        );
      }

      return (
        <>
          <p>
            Are you sure you want to delete these <b>{idList.length}</b>{" "}
            applications?
          </p>

          <p className="my-2">This action cannot be undone.</p>

          <ul className="pl-8 pr-4 py-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 list-disc">
            {idList.map((id) => {
              const job = jobs.find((job) => job.id === id);
              return (
                <li key={id}>
                  <span className="font-bold">{job?.roleTitle}</span> role at{" "}
                  <span className="font-bold">{job?.company}</span>
                </li>
              );
            })}
          </ul>
        </>
      );
    };

    handleGlobalModal({
      variant: "default",
      title: "Confirm Delete",
      description: description(),
      confirmText: "Delete",
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
      <div className="hidden md:block">
        <Filters
          filters={filters}
          jobs={jobs}
          isLoading={isFetching}
          handleDelete={handleDelete}
        />
      </div>

      <div className="block md:hidden">
        <Filters
          filters={filters}
          jobs={jobs}
          isLoading={isFetching}
          handleDelete={handleDelete}
          visibleColumns={["search", "filters"]}
        />
      </div>

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
            handleDelete={handleDelete}
            getJobsQuery={getJobsQuery}
          />
        )}
      </motion.div>

      {hasJobs && !isError && !isFetching && (
        <Pagination
          currentPage={pages.jobs || 1}
          totalPages={totalPages || 1}
          onPageChange={(page) =>
            onPaginationAction({
              pages: { jobs: { page } },
              search: getJobsQuery.search,
              sort: getJobsQuery.sort,
            })
          }
        />
      )}
    </div>
  );
};

export default Jobs;
