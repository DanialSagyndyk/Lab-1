import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "./productsThunks.js";

const initialState = {
  items: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
  lastFetched: null,
  currentRequestId: null, // used to ignore stale responses
  mutation: { status: "idle", error: null },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearMutationState(state) {
      state.mutation = { status: "idle", error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return; // stale response
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetched = Date.now();
        state.currentRequestId = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return; // stale response
        state.status = "failed"; // keep old items so cached data stays visible
        state.error = action.payload ?? action.error.message;
        state.currentRequestId = null;
      });

    for (const thunk of [createProduct, updateProduct, deleteProduct]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.mutation = { status: "loading", error: null };
        })
        .addCase(thunk.fulfilled, (state) => {
          state.mutation = { status: "succeeded", error: null };
        })
        .addCase(thunk.rejected, (state, action) => {
          state.mutation = { status: "failed", error: action.payload ?? action.error.message };
        });
    }
  },
});

export const { clearMutationState } = productsSlice.actions;
export default productsSlice.reducer;
