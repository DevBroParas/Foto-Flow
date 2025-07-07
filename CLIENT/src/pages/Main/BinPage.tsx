import React, { useEffect, useState } from "react";
import {
  getAllBin,
  deleteManyPermanentlyApi,
  restoreMediaApi,
} from "@/service/BinService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/api\/?$/,
  ""
) as string;

type Media = {
  id: string | null;
  albumId: string | null;
  userId: string;
  type: "PHOTO" | "VIDEO";
  url: string;
  thumbnailUrl: string | null;
  takenAt: string | null;
  recognitionStatus: "PENDING" | "DONE" | "FAILED";
  createdAt: string;
};

const BinPage = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [landscapeItems, setLandscapeItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await getAllBin();
        if (response?.data?.media) {
          setMedia(response.data.media.reverse());
        }
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };
    fetchMedia();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    id: string | null
  ) => {
    const img = e.currentTarget;
    const isLandscape = img.naturalWidth > img.naturalHeight;
    if (id) {
      setLandscapeItems((prev) => ({ ...prev, [id]: isLandscape }));
    }
  };

  const handleVideoMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    id: string | null
  ) => {
    const video = e.currentTarget;
    const isLandscape = video.videoWidth > video.videoHeight;
    if (id) {
      setLandscapeItems((prev) => ({ ...prev, [id]: isLandscape }));
    }
  };

  const handlePrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : media.length - 1));
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! < media.length - 1 ? prev! + 1 : 0));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleDeleteSelected = async () => {
    try {
      const ids = Array.from(selectedItems).filter(Boolean);
      if (!ids.length) return;
      await deleteManyPermanentlyApi(ids);
      setMedia((prev) => prev.filter((m) => !selectedItems.has(m.id!)));
      setSelectedItems(new Set());
      setSelectionMode(false);
    } catch (err) {
      console.error("Failed to delete selected items", err);
    }
  };

  const handleRestoreSelected = async () => {
    try {
      const ids = Array.from(selectedItems).filter(Boolean);
      if (!ids.length) return;
      await restoreMediaApi(ids);
      setMedia((prev) => prev.filter((m) => !selectedItems.has(m.id!)));
      setSelectedItems(new Set());
      setSelectionMode(false);
    } catch (err) {
      console.error("Failed to restore selected items", err);
    }
  };

  return (
    <div className="p-4 w-full flex flex-col min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Bin</h2>

        <div className="flex items-center gap-4">
          <button
            className={
              selectionMode
                ? "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                : "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            }
            onClick={() => {
              setSelectionMode((prev) => !prev);
              if (selectionMode) setSelectedItems(new Set());
            }}
          >
            {selectionMode ? "Cancel Selection" : "Select Media"}
          </button>

          {selectionMode && selectedItems.size > 0 && (
            <>
              <span className="text-lg font-medium">
                {selectedItems.size} selected
              </span>
              <button
                onClick={handleRestoreSelected}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Restore Media
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Permanently
              </button>
            </>
          )}
        </div>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-lg">
          No file in bin
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => {
            const key = item.id || item.url;
            if (!key) return null;
            const isLandscape = landscapeItems[key] ?? false;
            const isSelected = selectedItems.has(key);

            return (
              <MediaGridItem
                key={key}
                url={item.url}
                id={item.id!}
                type={item.type}
                isSelected={selectedItems.has(key)}
                selectionMode={selectionMode}
                isLandscape={landscapeItems[key] ?? false}
                baseUrl={BASE_URL}
                onClick={() =>
                  selectionMode
                    ? toggleSelectItem(key)
                    : setSelectedIndex(index)
                }
                onLoadImage={handleImageLoad}
                onLoadVideo={handleVideoMetadata}
              />
            );
          })}
        </div>
      )}

      {selectedIndex !== null && (
        <FullscreenViewer
          media={media.map((m) => ({
            id: m.id!,
            type: m.type,
            url: m.url,
          }))}
          selectedIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          baseUrl={BASE_URL}
        />
      )}
    </div>
  );
};

export default BinPage;
