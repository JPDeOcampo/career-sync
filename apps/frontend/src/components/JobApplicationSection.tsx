import { Controller, useFormContext } from "react-hook-form";
import { JobFormField } from "./shared/JobFormField";
import {
  Dropdown,
  DropdownItem,
  DropdownUpload,
} from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/shared/Checkbox";
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

const JobApplicationSection = ({
  isJobViewOnly = false,
}: {
  isJobViewOnly?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { documents, uploadProgress } = useAppSelector(selectDocuments);

  const { register, control, setValue } = useFormContext();

  const [uploadDocument, { isLoading: isUploading }] =
    useUploadDocumentMutation();

  const [fetchDocuments, { isLoading: isFetchingDocuments }] =
    useLazyGetDocumentsQuery();

  const handleDropdownToggle = () => {
    fetchDocuments({});
  };

  const handleFileUpload = async (file: File) => {
    const tempId = crypto.randomUUID();

    // 1. Optimistically add to Redux
    dispatch(
      addDocument({
        id: tempId,
        name: file.name,
        fileUrl: URL.createObjectURL(file),
        type: "CV",
        isUploading: true,
        progress: 0,
      }),
    );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "CV");

    try {
      const response = await uploadDocument({
        formData,
        onProgress: (percent: number) => {
          dispatch(updateDocumentProgress({ id: tempId, progress: percent }));
        },
      }).unwrap();
      const document = response.data;
      dispatch(markDocumentUploaded({ id: tempId, document }));
      setValue("cvVersion", document.id);
    } catch (error) {
      dispatch(removeDocument(tempId));
      console.error("Upload error:", error);
    }
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="applicationMethod"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Select Method"
              value={field.value}
              isViewOnly={isJobViewOnly}
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

        <Controller
          control={control}
          name="applicationDate"
          render={({ field }) => (
            <CustomDatePicker
              value={field.value}
              isViewOnly={isJobViewOnly}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Status"
              value={field.value}
              isViewOnly={isJobViewOnly}
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

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Dropdown
              label="Priority"
              value={field.value}
              isViewOnly={isJobViewOnly}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <Controller
          name="cvVersion"
          control={control}
          render={({ field }) => {
            const selectedDoc = documents.find((d) => d.id === field.value);

            return (
              <Dropdown
                containerClassName="max-h-40 overflow-hidden"
                value={selectedDoc?.name || ""}
                url={selectedDoc?.fileUrl}
                onClick={handleDropdownToggle}
                isViewOnly={isJobViewOnly}
                label="CV Version"
              >
                <div className="pt-2 px-1 mb-10 max-h-28 overflow-auto">
                  {documents.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between"
                    >
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
                </div>

                <DropdownUpload onFileSelect={handleFileUpload} />
              </Dropdown>
            );
          }}
        />
        <JobFormField
          label="Contact"
          placeholder="e.g., recruiter@company.com"
          {...register("contact")}
        />
        <div className="md:col-span-2">
          <Checkbox
            label="Cover letter sent"
            disabled={isJobViewOnly}
            {...register("coverLetterSent")}
          />
        </div>
      </div>
    </div>
  );
};

export default JobApplicationSection;
