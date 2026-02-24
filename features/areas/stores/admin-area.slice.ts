import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AreaService } from "../services/area.service";
import { AdminArea, AdminAreaParams } from "../types/admin-area.types";

export interface AdminAreaState {
  items: AdminArea[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  params: AdminAreaParams;
}

const initialState: AdminAreaState = {
  items: [],
  totalCount: 0,
  loading: false,
  error: null,
  params: {
    pageNumber: 1,
    pageSize: 100,
  },
};

// --- THUNKS ---

export const fetchAdminAreas = createAsyncThunk<
  { administrativeAreas: AdminArea[]; totalCount: number },
  AdminAreaParams | undefined,
  { rejectValue: string }
>("adminAreas/fetch", async (params, { getState, rejectWithValue }) => {
  try {
    const currentState = (getState() as any).adminAreas as AdminAreaState;
    const currentParams = { ...currentState.params, ...params };

    const response = await AreaService.getAdminAreas(currentParams);
   
    return {
      administrativeAreas: response.administrativeAreas,
      totalCount: response.totalCount,
    };
  } catch (error: any) {
    console.error("Failed to fetch admin areas:", error);
    return rejectWithValue(error?.message || "Failed to fetch admin areas");
  }
});

// --- SLICE ---

const adminAreaSlice = createSlice({
  name: "adminAreas",
  initialState,
  reducers: {
    setParams: (state, action: PayloadAction<AdminAreaParams>) => {
      state.params = { ...state.params, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAreas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAreas.fulfilled, (state, action) => {
        state.items = action.payload.administrativeAreas;
        state.totalCount = action.payload.totalCount;
        state.loading = false;
      })
      .addCase(fetchAdminAreas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An error occurred";
      });
  },
});

export const { setParams, clearError, reset } = adminAreaSlice.actions;

export default adminAreaSlice.reducer;
