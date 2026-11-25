import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as api from "../../services/service.js";
import { errorText, isStale } from "../cache.js";

// Extra read thunk: category list for the filter dropdown.
export const fetchCategories = createAsyncThunk(
  "categories/fetchList",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await api.getCategories({ signal });
    } catch (error) {
      return rejectWithValue(errorText(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { status, lastFetched } = getState().categories;
      return status !== "loading" && isStale(lastFetched);
    },
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: { items: [], status: "idle", error: null, lastFetched: null, currentRequestId: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export default categoriesSlice.reducer;
