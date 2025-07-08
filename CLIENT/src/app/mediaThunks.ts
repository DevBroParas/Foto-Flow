import { createAsyncThunk } from "@reduxjs/toolkit";
import { moveManyToBinApi } from "@/service/MediaService";
import {
  clearSelectedItems,
  setMediaNeedsRefresh,
  setSelectionMode,
} from "./selectionSlice";
import {
  deleteManyPermanentlyApi,
  restoreMediaApi,
} from "@/service/BinService";

export const moveSelectedMediaToBin = createAsyncThunk<
  void,
  string[],
  { rejectValue: string }
>(
  "media/moveSelectedMediaToBin",
  async (mediaIds, { dispatch, rejectWithValue }) => {
    try {
      await moveManyToBinApi(mediaIds);
      dispatch(clearSelectedItems());
      dispatch(setSelectionMode(false));
      dispatch(setMediaNeedsRefresh(true));
    } catch (error) {
      console.error("Failed to move media to bin:", error);
      return rejectWithValue("Failed to move media");
    }
  }
);

export const deleteSelectedBinMedia = createAsyncThunk(
  "bin/deleteSelected",
  async (ids: string[], { dispatch }) => {
    await deleteManyPermanentlyApi(ids);
    dispatch(setMediaNeedsRefresh(true));
    dispatch(clearSelectedItems());
  }
);

export const restoreSelectedBinMedia = createAsyncThunk(
  "bin/restoreSelected",
  async (ids: string[], { dispatch }) => {
    await restoreMediaApi(ids);
    dispatch(setMediaNeedsRefresh(true));
    dispatch(clearSelectedItems());
  }
);
