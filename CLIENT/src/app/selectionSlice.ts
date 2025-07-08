import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SelectionState {
  selectionMode: boolean;
  selectedItems: string[];
  currentTab: "media" | "bin" | "album" | "people" | "photo" | "video" | null;
  mediaNeedsRefresh: boolean;
  selectedAlbumId: string | null;
  selectedPersonId: string | null;
}

const initialState: SelectionState = {
  selectionMode: false,
  selectedItems: [],
  currentTab: null,
  mediaNeedsRefresh: false,
  selectedAlbumId: null,
  selectedPersonId: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    toggleSelectionMode(state) {
      state.selectionMode = !state.selectionMode;
      if (!state.selectionMode) state.selectedItems = [];
    },
    setSelectionMode(state, action: PayloadAction<boolean>) {
      state.selectionMode = action.payload;
      if (!action.payload) state.selectedItems = [];
    },
    setCurrentTab(state, action: PayloadAction<SelectionState["currentTab"]>) {
      state.currentTab = action.payload;
    },
    toggleSelectedItem(state, action: PayloadAction<string>) {
      if (state.selectedItems.includes(action.payload)) {
        state.selectedItems = state.selectedItems.filter(
          (id) => id !== action.payload
        );
      } else {
        state.selectedItems.push(action.payload);
      }
    },
    clearSelectedItems(state) {
      state.selectedItems = [];
    },
    setSelectedItems(state, action: PayloadAction<string[]>) {
      state.selectedItems = action.payload;
    },
    setMediaNeedsRefresh(state, action: PayloadAction<boolean>) {
      state.mediaNeedsRefresh = action.payload;
    },
    setSelectedAlbumId(state, action: PayloadAction<string | null>) {
      state.selectedAlbumId = action.payload;
    },
    setSelectedPersonId(state, action: PayloadAction<string | null>) {
      state.selectedPersonId = action.payload;
    },
  },
});

export const {
  toggleSelectionMode,
  setSelectionMode,
  toggleSelectedItem,
  clearSelectedItems,
  setCurrentTab,
  setSelectedItems,
  setMediaNeedsRefresh,
  setSelectedAlbumId,
  setSelectedPersonId,
} = selectionSlice.actions;

export default selectionSlice.reducer;
