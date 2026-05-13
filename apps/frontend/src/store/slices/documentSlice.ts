import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Documents } from "@career-sync/shared";

type Pagination = {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
};

type DocumentState = {
  documents: Documents[];
  pagination: Pagination;
  uploadProgress: number;
  selectedItems: string[];
};

const initialState: DocumentState = {
  documents: [],
  pagination: { page: 0, limit: 0, totalPages: 0, total: 0 },
  uploadProgress: 0,
  selectedItems: [],
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Documents[]>) => {
      state.documents = action.payload;
    },
    setLoadMoreDocuments: (state, action: PayloadAction<Documents[]>) => {
      const docs = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      docs.forEach((doc) => {
        const exists = state.documents.some((d) => d.id === doc.id);
        if (!exists) {
          state.documents.push(doc);
        }
      });
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    addDocument: (state, action: PayloadAction<Documents | Documents[]>) => {
      const docs = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      docs.forEach((doc) => {
        const exists = state.documents.some((d) => d.id === doc.id);
        if (!exists) {
          state.documents.unshift(doc);
        }
      });
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    updateDocumentProgress: (state, action) => {
      const doc = state.documents.find((d) => d.id === action.payload.id);
      if (doc) {
        doc.progress = action.payload.progress;
      }
    },
    markDocumentUploaded: (state, action) => {
      const doc = state.documents.find((d) => d.id === action.payload.id);
      if (doc) {
        Object.assign(doc, action.payload.document, {
          isUploading: false,
          progress: 100,
        });
      }
    },

    removeDocument: (state, action) => {
      const ids = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      state.documents = state.documents.filter((d) => !ids.includes(d.id));
    },

    setSelectedAllItems: (state, action: PayloadAction<string[]>) => {
      // state.selectedItems = action.payload;
      action.payload.forEach((id) => {
        if (!state.selectedItems.includes(id)) {
          state.selectedItems.push(id);
        }
      });
    },
    deselectAllItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = state.selectedItems.filter(
        (id) => !action.payload.includes(id),
      );
    },
    setSelectedItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      if (state.selectedItems.includes(id)) {
        state.selectedItems = state.selectedItems.filter((item) => item !== id);
      } else {
        state.selectedItems.push(id);
      }
    },
  },
});

export const {
  setDocuments,
  setLoadMoreDocuments,
  setPagination,
  addDocument,
  updateDocumentProgress,
  markDocumentUploaded,
  removeDocument,
  setSelectedAllItems,
  deselectAllItems,
  setSelectedItem,
} = documentSlice.actions;

export default documentSlice.reducer;
