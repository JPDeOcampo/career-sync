/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import Dropbox from "@/components/shared/Dropbox";
import useDocumentsHooks from "@/hooks/useDocuments";
import { selectDocuments } from "@/store/selectors";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/shared/Loading";
import { motion } from "motion/react";
import { Checkbox } from "@/components/shared/Checkbox";
import { EmptyState } from "@/components/shared/Placeholder";
import { getTimeAgo, formatDate } from "@career-sync/shared";
import { Documents } from "@career-sync/shared";
import {
  setSelectedAllItems,
  deselectAllItems,
  setSelectedItem,
} from "@/store/slices/documentSlice";
import {
  SearchFilter,
  DropdownFilters,
  ActionFilters,
} from "@/components/shared/Filters";
import { ProgressBar } from "@/components/shared/Loading";
import { useDebounce } from "@/hooks/useDebounce";
import CustomTooltip from "@/components/shared/CustomTooltip";

type ColumnKey = "filename" | "type" | "dateUploaded" | "actions";

const DocumentsTableHead = ({
  disableSort = false,
  handleSort,
  visibleColumns = ["filename", "type", "dateUploaded", "actions"],
}: {
  disableSort?: boolean;
  handleSort?: (field: "dateUploaded") => void;
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

        {show("filename") && (
          <th className={TH_TEXT_CLASSES}>
            <button disabled={disableSort} className={TH_BUTTON_CLASSES}>
              Filename
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </th>
        )}

        {show("type") && <th className={TH_TEXT_CLASSES}>Type</th>}

        {show("dateUploaded") && (
          <th className={TH_TEXT_CLASSES}>
            <button
              disabled={disableSort}
              onClick={() => handleSort?.("dateUploaded")}
              className={TH_BUTTON_CLASSES}
            >
              Date Uploaded
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </th>
        )}

        {show("actions") && <th className={TH_ACTION_CLASSES}>Actions</th>}
      </tr>
    </thead>
  );
};

const DocumentsTableSkeleton = ({
  rows = 5,
  type = "desktop",
}: {
  rows?: number;
  type?: "desktop" | "mobile";
}) => {
  const tdClass = "px-4 py-4";

  {
    /* DESKTOP SKELETON */
  }
  if (type === "desktop") {
    return (
      <>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index} className="animate-pulse">
            <td className={tdClass}>
              <Skeleton className="w-6 h-6 rounded-md" />
            </td>
            <td className={tdClass}>
              <Skeleton className="w-32 h-4 rounded-md" />
            </td>
            <td className={tdClass}>
              <Skeleton className="w-32 h-4 rounded-md" />
            </td>
            <td className={tdClass}>
              <Skeleton className="w-24 h-4 rounded-md" />
            </td>
            <td className={`${tdClass} flex justify-end`}>
              <Skeleton className="w-6 h-6 rounded-full" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {/* MOBILE CARD SKELETON */}
      <div className="space-y-3">
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

const DocumentsTable = ({
  isLoading,
  documents,
  handleSort,
  emptyStateText,
}: {
  isLoading?: boolean;
  documents: Documents[];
  handleSort?: (field: "dateUploaded") => void;
  emptyStateText?: string;
}) => {
  const dispatch = useAppDispatch();
  const { selectedItems } = useAppSelector(selectDocuments);
  const { handleDelete, viewDocument } = useDocumentsHooks();

  const tdClass = "px-4 py-4";

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden">
            <DocumentsTableHead
              handleSort={handleSort}
              disableSort={isLoading}
            />
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {documents && documents.length > 0 && (
                <>
                  {documents.map((document, index) => (
                    <motion.tr
                      key={document.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 + index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() =>
                        viewDocument({ id: document.id, url: document.fileUrl })
                      }
                    >
                      <td className={`px-4 py-4`}>
                        <Checkbox
                          name="select"
                          variantSize="lg"
                          checked={selectedItems.includes(document.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() =>
                            dispatch(setSelectedItem(document.id))
                          }
                        />
                      </td>
                      <td className={`px-4 py-4`}>
                        <CustomTooltip label={document.name} position="top">
                          <div className="font-medium text-gray-900 dark:text-white truncate max-w-37.5">
                            {document.name}
                          </div>
                        </CustomTooltip>
                      </td>
                      <td className={`${tdClass}`}>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-37.5">
                          {document.type === "COVER_LETTER"
                            ? "Cover Letter"
                            : document.type}
                        </div>
                      </td>

                      <td className={`px-4 py-4`}>
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-37.5">
                          {document?.createdAt &&
                            formatDate(document?.createdAt, "yyyy-MM-dd")}
                        </div>
                      </td>

                      <td className={`${tdClass}`}>
                        <div className="flex items-center justify-end gap-2">
                          <CustomTooltip
                            label={document.isUploading ? "Loading" : "Delete"}
                            position="bottom"
                          >
                            {document.isUploading ? (
                              <ProgressBar
                                progress={document.progress ?? 0}
                                size={20}
                              />
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete?.(document.id);
                                }}
                                className={`p-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </CustomTooltip>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </>
              )}
              {isLoading && <DocumentsTableSkeleton rows={5} />}
            </tbody>
          </table>

          {/* No Data State */}
          {documents?.length === 0 && <EmptyState title={emptyStateText} />}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="block md:hidden space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition"
            onClick={() =>
              viewDocument({ id: document.id, url: document.fileUrl })
            }
          >
            {/* Top Row */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 ">
                <Checkbox
                  name="select"
                  variantSize="lg"
                  checked={selectedItems.includes(document.id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => dispatch(setSelectedItem(document.id))}
                />

                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base truncate max-w-45">
                    {document.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-45">
                    {document.type}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-45">
                    {document.createdAt &&
                      formatDate(document.createdAt, "yyyy-MM-dd")}
                  </p>
                </div>
              </div>

              {/* Delete Button */}

              {document.isUploading ? (
                <ProgressBar progress={document.progress ?? 0} />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete?.(document.id);
                  }}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Bottom Info */}
            <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
              <span>
                {document?.createdAt && getTimeAgo(document.createdAt)}
              </span>
            </div>
          </div>
        ))}
        {isLoading && <DocumentsTableSkeleton rows={5} type="mobile" />}
        {/* No Data State */}
        {documents?.length === 0 && <EmptyState title={emptyStateText} />}
      </div>
    </>
  );
};

const filterTypeList = [
  { label: "All", value: "ALL" },
  { label: "CV", value: "CV" },
  { label: "Cover Letter", value: "COVER_LETTER" },
];

const DocumentSetting = () => {
  const dispatch = useAppDispatch();
  const { documents, selectedItems } = useAppSelector(selectDocuments);
  const {
    isFetchingDocuments,
    handleFetchDocuments,
    handleFileUpload,
    handleDelete,
    scrollRef,
    getDocumentsQuery,
    setDocumentsQuery,
  } = useDocumentsHooks();

  const debouncedSearch = useDebounce(getDocumentsQuery.search, 500);

  const filterDocuments = documents.filter((document) => {
    if (getDocumentsQuery.fileType === "ALL") return true;
    return document.type === getDocumentsQuery.fileType;
  });

  const emptyStateText = () => {
    if (getDocumentsQuery.search) {
      return `No documents match your search for "${getDocumentsQuery.search}".`;
    }
    return "No documents match.";
  };

  useEffect(() => {
    handleFetchDocuments({
      ...getDocumentsQuery,
      search: debouncedSearch,
    });
  }, [debouncedSearch, getDocumentsQuery.fileType]);

  return (
    <div className="h-full overflow-y-auto md:pt-6 px-4" ref={scrollRef}>
      <div className="flex flex-col gap-4">
        <h3>Documents</h3>
        <div className="flex flex-col gap-6">
          <Dropbox
            title="Upload Documents"
            accept=".pdf"
            onFileSelect={(file, documentType) =>
              handleFileUpload(file, documentType)
            }
          />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 md:pl-[1.5px]">
              <SearchFilter
                filters={getDocumentsQuery.search || ""}
                placeholder="Search by filename"
                onSearch={(value) => {
                  setDocumentsQuery({
                    ...getDocumentsQuery,
                    search: value,
                    page: 1,
                  });
                }}
              />
              <DropdownFilters
                valueLabel="Type"
                value={
                  filterTypeList.find(
                    (s) => s.value === getDocumentsQuery.fileType,
                  )?.label || filterTypeList[0].label
                }
                filterList={filterTypeList}
                handleFilterChange={(value) => {
                  setDocumentsQuery({
                    ...getDocumentsQuery,
                    fileType: value as "ALL" | "CV" | "COVER_LETTER",
                    page: 1,
                  });
                }}
              />
            </div>
            <div className="py-3 flex items-center gap-8 justify-between border-b border-gray-200 dark:border-gray-700">
              <ActionFilters
                items={documents}
                selectedItems={selectedItems}
                isLoading={isFetchingDocuments}
                onSelectionChange={(ids, selected) => {
                  if (selected) {
                    dispatch(setSelectedAllItems(ids));
                  } else {
                    dispatch(deselectAllItems(ids));
                  }
                }}
                onDelete={(ids) => handleDelete?.(ids)}
              />
            </div>
          </div>

          <DocumentsTable
            key={getDocumentsQuery.fileType}
            documents={filterDocuments as Documents[]}
            isLoading={isFetchingDocuments}
            emptyStateText={emptyStateText()}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentSetting;
