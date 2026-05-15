/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useCallback, useRef } from "react";
import {
  useUploadDocumentMutation,
  useLazyGetDocumentsQuery,
  useDeleteDocumentsMutation,
} from "@/store/api/documentApi";
import { selectDocuments } from "@/store/selectors";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  addDocument,
  updateDocumentProgress,
  markDocumentUploaded,
  removeDocument,
  setSelectedViewDocument,
} from "@/store/slices/documentSlice";
import { toast } from "sonner";
import { isFetchBaseQueryError } from "@/utils/errorGuard";
import { v4 as uuidv4 } from "uuid";
import { useGlobalModal } from "@/context/GlobalModalContext";
import useInfiniteScroll from "./useInfiniteScroll";
import { Documents, DocumentType } from "@career-sync/shared";

const useDocumentsHooks = () => {
  const dispatch = useAppDispatch();
  const [getDocumentsQuery, setDocumentsQuery] = useState<{
    page: number;
    limit: number;
    sort: string;
    search?: string;
    fileType?: "ALL" | "CV" | "COVER_LETTER";
  }>({
    page: 1,
    limit: 5,
    sort: "recent",
    search: undefined,
    fileType: "ALL",
  });
  const documentContainerRef = useRef(null);
  const { handleGlobalModal } = useGlobalModal();
  const { documents, pagination, selectedViewDocument } =
    useAppSelector(selectDocuments);
  const [uploadDocument] = useUploadDocumentMutation();
  const [fetchDocuments, { isFetching: isFetchingDocuments }] =
    useLazyGetDocumentsQuery();

  const [deleteDocument] = useDeleteDocumentsMutation();

  const getDocumentType = (fileName: string): DocumentType | null => {
    const normalized = fileName.toLowerCase();

    // CV / Resume
    if (/(cv|resume|curriculum[\s\-_]*vitae)/i.test(normalized)) {
      return "CV";
    }

    // Cover Letter
    if (/cover[\s\-_]*letter/i.test(normalized)) {
      return "COVER_LETTER";
    }

    return null;
  };

  const viewDocument = (document: { id: string; url: string }) => {
    dispatch(setSelectedViewDocument(document));
  };

  const handleFetchDocuments = ({
    page,
    limit,
    search,
    fileType,
    sort,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    fileType?: "ALL" | "CV" | "COVER_LETTER";
    sort?: string;
  }) => {
    fetchDocuments({ page, limit, search, fileType, sort });
  };

  const loadMore = useCallback(() => {
    if (isFetchingDocuments) return;

    setDocumentsQuery((prev) => {
      const nextLimit = prev.page + 1;
      if (pagination.totalPages === prev.page) return prev;

      handleFetchDocuments({
        ...prev,
        page: nextLimit,
      });

      return {
        ...prev,
        page: nextLimit,
      };
    });
  }, [isFetchingDocuments, fetchDocuments]);

  const scrollRef = useInfiniteScroll(loadMore);

  const handleFileUpload = async (
    file: File,
    type: "ALL" | "CV" | "COVER_LETTER",
  ): Promise<{ valueType: string; id: string } | undefined> => {
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
      } as Documents),
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
      setDocumentsQuery((prev) => {
        return {
          ...prev,
          fileType: "ALL",
        };
      });
      dispatch(markDocumentUploaded({ id: tempId, document }));
      return { valueType, id: document.id };
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

  const confirmDelete = async (ids: string | string[]) => {
    handleGlobalModal({
      isLoading: true,
    });
    try {
      await deleteDocument({
        ids: Array.isArray(ids) ? ids : [ids],
      }).unwrap();
      // if (ids.length === pages.limit) {
      //   onPaginationAction({ pages: { jobs: { page: pages.jobs - 1 } } });
      // }
      dispatch(removeDocument(ids));
      dispatch(setSelectedViewDocument({ id: null, url: null }));
      toast.success("Job deleted successfully.");
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

    const documentsToDelete = documents.filter((document) =>
      idList.includes(document.id),
    );

    const description = () => {
      if (idList.length === 1) {
        const document = documentsToDelete[0];

        return (
          <>
            <p>
              Are you sure you want to delete this document{" "}
              <b>{document.name}</b>?
            </p>
            <p className="my-2">
              This action cannot be undone. Any jobs currently linked to this
              document will be updated to remove its document reference.
            </p>
          </>
        );
      }

      return (
        <div className="space-y-4">
          <p>
            Are you sure you want to delete these <b>{idList.length}</b>{" "}
            documents?
          </p>

          <ul className="pl-8 pr-4 py-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 list-disc">
            {idList.map((id) => {
              const document = documents.find((document) => document.id === id);
              return (
                <li key={id}>
                  <span className="font-bold">{document?.name}</span>
                </li>
              );
            })}
          </ul>

          <p>
            This action cannot be undone. Any jobs currently linked to these
            documents will be updated to remove their document references.
          </p>
        </div>
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

  return {
    getDocumentsQuery,
    viewDocument,
    setDocumentsQuery,
    documentContainerRef,
    documents,
    isFetchingDocuments,
    getDocumentType,
    handleFetchDocuments,
    scrollRef,
    handleFileUpload,
    confirmDelete,
    handleDelete,
  };
};

export default useDocumentsHooks;
