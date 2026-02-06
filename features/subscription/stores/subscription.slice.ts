import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { SubscriptionService } from "../services/subscription.service";
import type { Subscription, TierCode } from "../types/subscription.types";

export interface SubscriptionState {
  current: Subscription | null;
  loading: boolean;
  error?: string | null;
}

const initialState: SubscriptionState = {
  current: null,
  loading: false,
  error: null,
};

export const fetchCurrentSubscription = createAsyncThunk<
  Subscription | null,
  void,
  { rejectValue: string }
>("subscription/fetchCurrent", async (_, { rejectWithValue }) => {
  try {
    return await SubscriptionService.getCurrent();
  } catch (error: any) {
    console.error("Failed to fetch subscription:", error);
    return rejectWithValue(error?.message || "Không thể tải gói đăng ký");
  }
});

export const subscribeToPlan = createAsyncThunk<
  void,
  { planCode: TierCode; durationMonths: number },
  { rejectValue: string }
>("subscription/subscribe", async ({ planCode, durationMonths }, { dispatch, rejectWithValue }) => {
  try {
    await SubscriptionService.subscribe(planCode, durationMonths);
    await dispatch(fetchCurrentSubscription()).unwrap();
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể đăng ký gói";
    return rejectWithValue(message);
  }
});

export const cancelSubscription = createAsyncThunk<
  void,
  string | undefined,
  { rejectValue: string }
>("subscription/cancel", async (cancelReason, { dispatch, rejectWithValue }) => {
  try {
    await SubscriptionService.cancel(cancelReason);
    await dispatch(fetchCurrentSubscription()).unwrap();
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể hủy gói đăng ký";
    return rejectWithValue(message);
  }
});

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setCurrent: (state, action: PayloadAction<Subscription>) => {
      state.current = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.current = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.current = null;
        state.loading = false;
        state.error = action.payload || "Không thể tải gói đăng ký";
      });

    builder
      .addCase(subscribeToPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribeToPlan.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(subscribeToPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể đăng ký gói";
      });

    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Không thể hủy gói đăng ký";
      });
  },
});

export const { setCurrent, setLoading, setError } = subscriptionSlice.actions;

export const selectSubscriptionCurrent = (state: RootState) =>
  state.subscription.current;
export const selectSubscriptionLoading = (state: RootState) =>
  state.subscription.loading;
export const selectSubscriptionError = (state: RootState) =>
  state.subscription.error;

export default subscriptionSlice.reducer;
