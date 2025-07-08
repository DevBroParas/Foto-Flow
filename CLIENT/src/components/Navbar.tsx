import { SidebarTrigger } from "./ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  Trash2,
  X,
  Undo2,
  ChevronLeft,
  SquareCheck,
  DeleteIcon,
} from "lucide-react";
import {
  moveSelectedMediaToBin,
  deleteSelectedBinMedia,
  restoreSelectedBinMedia,
} from "@/app/mediaThunks";
import {
  toggleSelectionMode,
  setSelectedAlbumId,
  setSelectedPersonId,
} from "@/app/selectionSlice";
import { Button } from "./ui/button";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { selectionMode, selectedItems, currentTab, selectedAlbumId } =
    useAppSelector((state) => state.selection);

  const selectedCount = selectedItems.length;

  const handleToggleSelection = () => {
    console.log("Toggling selection mode:", !selectionMode);
    dispatch(toggleSelectionMode());
  };

  const handleBack = () => {
    console.log("Back clicked in tab:", currentTab);
    if (currentTab === "album" && selectedAlbumId) {
      console.log("Clearing selected album ID");
      dispatch(setSelectedAlbumId(null));
    } else if (currentTab === "people") {
      console.log("Clearing selected person ID");
      dispatch(setSelectedPersonId(null));
    }
  };

  const handleMoveToBin = () => {
    console.log("Moving to bin:", selectedItems);
    dispatch(moveSelectedMediaToBin(selectedItems));
  };

  const handleRestore = () => {
    console.log("Restoring media:", selectedItems);
    dispatch(restoreSelectedBinMedia(selectedItems));
  };

  const handleDeletePermanently = () => {
    console.log("Deleting permanently:", selectedItems);
    dispatch(deleteSelectedBinMedia(selectedItems));
  };

  const showChevronBack =
    !selectionMode && (currentTab === "album" || currentTab === "people");

  return (
    <nav className=" text-primary px-4 sm:px-6 py-3 shadow-lg w-full">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <SidebarTrigger className="md:hidden" />
        {/* Left: Back Button */}
        <div className="flex items-center gap-4">
          {showChevronBack ? (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              title="Back"
            >
              <ChevronLeft size={26} />
            </Button>
          ) : (
            <div className="w-[36px]" />
          )}
        </div>

        {/* Center: Selection Actions */}
        {currentTab && !["album", "people"].includes(currentTab) && (
          <div className="flex items-center gap-3">
            {/* Toggle Select Mode (icon only) */}
            <Button
              onClick={handleToggleSelection}
              variant="ghost"
              size="icon"
              title={selectionMode ? "Cancel Selection" : "Select"}
            >
              {selectionMode ? (
                <X size={20} className="text-red-500" />
              ) : (
                <SquareCheck size={20} className="text-blue-500" />
              )}
            </Button>

            {/* Move to Bin */}
            {selectionMode &&
              selectedCount > 0 &&
              ["media", "photo", "video"].includes(currentTab) && (
                <Button
                  onClick={handleMoveToBin}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  <span className="hidden md:inline">
                    Move to Bin ({selectedCount})
                  </span>
                </Button>
              )}

            {/* Bin Restore & Delete */}
            {selectionMode && selectedCount > 0 && currentTab === "bin" && (
              <>
                <Button
                  onClick={handleRestore}
                  className="flex items-center gap-2 bg-green-700 hover:text-green-400"
                >
                  <Undo2 size={20} />
                  <span className="hidden md:inline">
                    Restore ({selectedCount})
                  </span>
                </Button>

                <Button
                  onClick={handleDeletePermanently}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <DeleteIcon size={20} />
                  <span className="hidden md:inline">
                    Delete Permanently ({selectedCount})
                  </span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
