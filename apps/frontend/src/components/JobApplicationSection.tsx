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
import {
  useUploadDocumentMutation,
  useLazyGetDocumentsQuery,
} from "@/store/api/documentApi";
import { selectDocuments } from "@/store/selectors";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  addDocument,
  updateDocumentProgress,
  markDocumentUploaded,
  removeDocument,
} from "@/store/slices/documentSlice";
import ProgressBar from "./shared/ProgressBar";
import { getTodayString } from "@/utils/dateHelper";
import { toast } from "sonner";
import { isFetchBaseQueryError } from "@/utils/errorGuard";
import { LoadingSpinner } from "./shared/Loading";
import { v4 as uuidv4 } from "uuid";

const JobApplicationSection = ({ isViewOnly }: { isViewOnly?: boolean }) => {
  const dispatch = useAppDispatch();
  const { documents } = useAppSelector(selectDocuments);
  const { register, control, setValue } = useFormContext();

  const [uploadDocument] = useUploadDocumentMutation();
  const [fetchDocuments, { isLoading: isFetchingDocuments }] =
    useLazyGetDocumentsQuery();

  const handleDropdownToggle = () => {
    fetchDocuments({});
  };

  const handleFileUpload = async (file: File, type: "CV" | "COVER_LETTER") => {
    const tempId = uuidv4();
    const valueType = type === "CV" ? "cvId" : "coverLetterId";

    dispatch(
      addDocument({
        id: tempId,
        name: file.name,
        fileUrl: URL.createObjectURL(file),
        type,
        isUploading: true,
        progress: 0,
      }),
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", type);

    try {
      const response = await uploadDocument({
        formData,
        onProgress: (percent: number) => {
          dispatch(updateDocumentProgress({ id: tempId, progress: percent }));
        },
      }).unwrap();

      const document = response.data;

      dispatch(markDocumentUploaded({ id: tempId, document }));
      setValue(valueType, document.id);
    } catch (error: unknown) {
      dispatch(removeDocument(tempId));

      if (isFetchBaseQueryError(error)) {
        const errMsg =
          "data" in error && error.data && typeof error.data === "object"
            ? (error.data as { message?: string }).message
            : "An error occurred, please try again later.";

        toast.error(errMsg ?? "An error occurred, please try again later.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Unknown error");
      }

      console.error("Upload error:", error);
    }
  };

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
        onClick={handleDropdownToggle}
        isViewOnly={isViewOnly}
        label={label}
      >
        <div className="pt-2 px-1 mb-10 max-h-28 overflow-auto">
          {isFetchingDocuments && documents.length === 0 && (
            <div className="flex justify-center items-center px-2 py-3">
              <LoadingSpinner />
            </div>
          )}

          {!isFetchingDocuments &&
            filteredDocs.length > 0 &&
            filteredDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between">
                <DropdownItem
                  item={d.name || ""}
                  selectedItem={selectedDoc?.name || ""}
                  onSelect={() => field.onChange(d.id)}
                  icon={
                    d.isUploading ? (
                      <ProgressBar progress={d.progress ?? 0} />
                    ) : null
                  }
                />
              </div>
            ))}

          {!isFetchingDocuments && documents.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              {emptyText}
            </div>
          )}
        </div>

        <DropdownUpload onFileSelect={(file) => handleFileUpload(file, type)} />
      </Dropdown>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              "No CV available.",
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
