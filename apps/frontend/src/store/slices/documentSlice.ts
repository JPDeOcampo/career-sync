import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DocumentType } from "@/@types/document.types";

type DocumentState = {
  documents: DocumentType[];
  uploadProgress: number;
};

const initialState: DocumentState = {
  documents: [],
  uploadProgress: 0,
};

const documentSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<DocumentType[]>) => {
      state.documents = action.payload;
    },
    addDocument: (
      state,
      action: PayloadAction<DocumentType | DocumentType[]>,
    ) => {
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

    //     markDocumentUploaded: (state, action) => {
    //   const { tempId, document } = action.payload;

    //   const index = state.documents.findIndex((d) => d.id === tempId);
    //   (console.log("index", index), document);
    //   if (index !== -1) {
    //     state.documents[index] = {
    //       ...document,
    //       id: document.id,
    //       userId: document.userId,
    //       fileUrl: document.fileUrl,
    //       isUploading: false,
    //       progress: 100,
    //     };
    //   }
    // },
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
      state.documents = state.documents.filter((d) => d.id !== action.payload);
    },
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocumentProgress,
  markDocumentUploaded,
  removeDocument,
} = documentSlice.actions;

export default documentSlice.reducer;
