import {
  Controller,
  useFormContext,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";
import { JobFormField } from "./shared/JobFormField";
import {
  Dropdown,
  DropdownItem,
  DropdownUpload,
} from "@/components/shared/CustomDropdown";
import {
  applicationMethods,
  priorities,
  statuses,
} from "@/constant/jobSelectList";
import CustomDatePicker from "./shared/CustomDatePicker";
import { selectDocuments } from "@/store/selectors";
import { useAppSelector } from "@/hooks/useRedux";
import ProgressBar from "./shared/ProgressBar";
import { getTodayString } from "@career-sync/shared";
import { LoadingSpinner } from "./shared/Loading";
import useDocumentsHooks from "@/hooks/useDocuments";
import { toast } from "sonner";

const JobApplicationSection = ({ isViewOnly }: { isViewOnly?: boolean }) => {
  const { documents } = useAppSelector(selectDocuments);
  const { register, control, setValue } = useFormContext();

  const {
    isFetchingDocuments,
    getDocumentsQuery,
    getDocumentType,
    handleFetchDocuments,
    handleFileUpload,
    scrollRef,
  } = useDocumentsHooks();

  const renderDocumentDropdown = (
    type: "CV" | "COVER_LETTER",
    field: ControllerRenderProps<FieldValues, Path<FieldValues>>,
    label: string,
    emptyText: string,
  ) => {
    const selectedDoc = documents.find((d) => d.id === field.value);
    const filteredDocs = documents.filter((d) => d.type === type);

    return (
      <Dropdown
        containerClassName="max-h-40 overflow-hidden"
        value={selectedDoc?.name || ""}
        url={selectedDoc?.fileUrl}
        onClick={() => handleFetchDocuments(getDocumentsQuery)}
        isViewOnly={isViewOnly}
        label={label}
      >
        <div className="px-1.5 mb-8 max-h-28 overflow-auto" ref={scrollRef}>
          {filteredDocs.length > 0 &&
            filteredDocs.map((d) => (
              <DropdownItem
                key={d.name}
                item={d.name || ""}
                selectedItem={selectedDoc?.name || ""}
                onSelect={() => field.onChange(d.id)}
                icon={
                  d.isUploading ? (
                    <ProgressBar progress={d.progress ?? 0} />
                  ) : null
                }
              />
            ))}

          {isFetchingDocuments && (
            <div className="flex justify-center items-center px-2 py-3">
              <LoadingSpinner />
            </div>
          )}

          {!isFetchingDocuments && filteredDocs.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              {emptyText}
            </div>
          )}
        </div>

        <DropdownUpload
          onFileSelect={async (file) => {
            if (type === "CV") {
              if (getDocumentType(file.name) !== "CV") {
                toast.error("File name must contain CV or Resume");
              }
            } else if (type === "COVER_LETTER") {
              if (getDocumentType(file.name) !== "COVER_LETTER") {
                toast.error("File name must contain Cover Letter");
              }
            }

            const result = await handleFileUpload(file, type);
            if (result) {
              setValue(result.valueType, result.id);
            }
          }}
        />
      </Dropdown>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Application Method */}
        <Controller
          name="applicationMethod"
          control={control}
          defaultValue={applicationMethods[0]}
          render={({ field }) => (
            <Dropdown
              label="Select Method"
              value={field.value}
              isViewOnly={isViewOnly}
              align="left"
            >
              {applicationMethods.map((m) => (
                <DropdownItem
                  key={m}
                  item={m}
                  selectedItem={field.value}
                  onSelect={field.onChange}
                />
              ))}
            </Dropdown>
          )}
        />

        {/* Application Date */}
        <Controller
          control={control}
          name="applicationDate"
          defaultValue={getTodayString()}
          render={({ field }) => (
            <CustomDatePicker
              value={field.value}
              isViewOnly={isViewOnly}
              onChange={field.onChange}
            />
          )}
        />

        {/* Status */}
        <Controller
          name="status"
          control={control}
          defaultValue={statuses[0]}
          render={({ field }) => (
            <Dropdown
              label="Status"
              value={field.value}
              isViewOnly={isViewOnly}
              align="left"
            >
              {statuses.map((s) => (
                <DropdownItem
                  key={s}
                  item={s}
                  selectedItem={field.value}
                  onSelect={field.onChange}
                />
              ))}
            </Dropdown>
          )}
        />

        {/* Priority */}
        <Controller
          name="priority"
          control={control}
          defaultValue={priorities[0]}
          render={({ field }) => (
            <Dropdown
              label="Priority"
              value={field.value}
              isViewOnly={isViewOnly}
              align="left"
            >
              {priorities.map((p) => (
                <DropdownItem
                  key={p}
                  item={p}
                  selectedItem={field.value}
                  onSelect={field.onChange}
                />
              ))}
            </Dropdown>
          )}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* CV */}
        <Controller
          name="cvId"
          control={control}
          render={({ field }) =>
            renderDocumentDropdown(
              "CV",
              field,
              "CV Version",
              "No CV's available.",
            )
          }
        />

        {/* Contact */}
        <JobFormField
          label="Contact"
          placeholder="e.g., recruiter@company.com"
          isViewOnly={isViewOnly}
          {...register("contact")}
        />

        {/* Cover Letter */}
        <Controller
          name="coverLetterId"
          control={control}
          render={({ field }) =>
            renderDocumentDropdown(
              "COVER_LETTER",
              field,
              "Cover Letter",
              "No cover letters available.",
            )
          }
        />
      </div>
    </div>
  );
};

export default JobApplicationSection;
