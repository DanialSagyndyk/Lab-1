import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../../services/service.js";
import { errorText, isStale } from "../cache.js";
import { updateProduct, deleteProduct } from "../products/productsThunks.js";

// 2) DETAILS FETCH. Results are cached per product id.
export const fetchProductById = createAsyncThunk(
  "productDetails/fetchById",
  async ({ id }, { signal, rejectWithValue }) => {
    try {
      return await api.getProduct(id, { signal });
    } catch (error) {
      return rejectWithValue(errorText(error));
    }
  },
  {
    condition: ({ id, force }, { getState }) => {
      if (force) return true;
      const entry = getState().productDetails.byId[String(id)];
      if (entry?.status === "loading") return false;
      return !entry?.data || isStale(entry.lastFetched);
    },
  }
);

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState: { byId: {} }, // { [id]: { data, status, error, lastFetched, requestId } }
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state, action) => {
        const key = String(action.meta.arg.id);
        const entry = state.byId[key] ?? { data: null, lastFetched: null };
        state.byId[key] = { ...entry, status: "loading", error: null, requestId: action.meta.requestId };
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const key = String(action.meta.arg.id);
        if (state.byId[key]?.requestId !== action.meta.requestId) return; // stale response
        state.byId[key] = { data: action.payload, status: "succeeded", error: null, lastFetched: Date.now(), requestId: null };
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        const key = String(action.meta.arg.id);
        if (state.byId[key]?.requestId !== action.meta.requestId) return; // stale response
        state.byId[key] = { ...state.byId[key], status: "failed", error: action.payload ?? action.error.message, requestId: null };
      })
      // A successful write makes the cached detail obsolete: remove it so it is re-fetched.
      .addCase(updateProduct.fulfilled, (state, action) => {
        delete state.byId[String(action.meta.arg.id)];
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        delete state.byId[String(action.payload)];
      });
  },
});

export default productDetailsSlice.reducer;
