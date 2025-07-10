import React, { useEffect, useState } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { downloadSelectedMedia } from "@/app/mediaThunks";
import { Download as DownloadIcon } from "lucide-react";

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
  const showChevronBack =
    !selectionMode && (currentTab === "album" || currentTab === "people");

  // 🚀 State to show/hide navbar on scroll
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY || currentY < 100) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleToggleSelection = () => dispatch(toggleSelectionMode());
  const handleBack = () => {
    if (currentTab === "album" && selectedAlbumId) {
      dispatch(setSelectedAlbumId(null));
    } else if (currentTab === "people") {
      dispatch(setSelectedPersonId(null));
    }
  };
  const handleMoveToBin = () => dispatch(moveSelectedMediaToBin(selectedItems));
  const handleRestore = () => dispatch(restoreSelectedBinMedia(selectedItems));
  const handleDeletePermanently = () =>
    dispatch(deleteSelectedBinMedia(selectedItems));

  return (
    <nav
      className={`fixed top-0 md:left-64 left-0 right-0 z-50 bg-gray-900 text-white px-4 sm:px-6 py-3 shadow-lg transition-transform duration-300 ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <SidebarTrigger className="md:hidden" />
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        {/* Back Button */}
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

        {/* Action Buttons */}
        {currentTab && !["album", "people"].includes(currentTab) && (
          <div className="hidden md:flex items-center gap-3">
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

            {selectionMode &&
              selectedCount > 0 &&
              ["media", "photo", "video"].includes(currentTab) && (
                <>
                  <Button
                    onClick={handleMoveToBin}
                    variant="destructive"
                    className="text-white hover:text-red-300"
                  >
                    <Trash2 size={20} />
                    Move to Bin ({selectedCount})
                  </Button>

                  <Button
                    onClick={() =>
                      dispatch(downloadSelectedMedia(selectedItems))
                    }
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    <DownloadIcon size={20} />
                    Download ({selectedCount})
                  </Button>
                </>
              )}

            {selectionMode && selectedCount > 0 && currentTab === "bin" && (
              <>
                <Button
                  onClick={handleRestore}
                  className="hover:text-green-600 bg-green-700"
                >
                  <Undo2 size={20} />
                  Restore ({selectedCount})
                </Button>

                <Button
                  onClick={handleDeletePermanently}
                  variant="destructive"
                  className="text-white hover:text-red-200"
                >
                  <DeleteIcon size={20} />
                  Delete Permanently ({selectedCount})
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
