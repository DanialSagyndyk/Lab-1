import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/service.js";
import { errorText, isStale } from "../cache.js";

// 1) LIST FETCH. `force: true` skips the freshness check (retry button, after mutations).
export const fetchProducts = createAsyncThunk(
  "products/fetchList",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      const data = await api.getProducts({ signal });
      return data.products ?? [];
    } catch (error) {
      return rejectWithValue(errorText(error));
    }
  },
  {
    // Avoid unnecessary requests: skip when fresh data exists or a request is already running.
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { status, lastFetched } = getState().products;
      if (status === "loading") return false;
      return isStale(lastFetched);
    },
  }
);

// Re-load lists/details after a successful write.
const refreshAfterMutation = (dispatch) => dispatch(fetchProducts({ force: true }));

// 3) MUTATIONS / BUSINESS OPERATIONS
export const createProduct = createAsyncThunk("products/create", async (product, { dispatch, rejectWithValue }) => {
  try {
    const created = await api.createProduct(product);
    refreshAfterMutation(dispatch);
    return created;
  } catch (error) {
    return rejectWithValue(errorText(error));
  }
});

export const updateProduct = createAsyncThunk("products/update", async (product, { dispatch, rejectWithValue }) => {
  try {
    const updated = await api.updateProduct(product);
    refreshAfterMutation(dispatch);
    return updated;
  } catch (error) {
    return rejectWithValue(errorText(error));
  }
});

export const deleteProduct = createAsyncThunk("products/delete", async (id, { dispatch, rejectWithValue }) => {
  try {
    await api.deleteProduct(id);
    refreshAfterMutation(dispatch);
    return id;
  } catch (error) {
    return rejectWithValue(errorText(error));
  }
});
