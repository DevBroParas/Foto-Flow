import React, { useEffect, useState } from "react";
import {
  getAllBin,
  deleteManyPermanentlyApi,
  restoreMediaApi,
} from "@/service/BinService";

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
    if (id)
      setLandscapeItems((prev) => ({
        ...prev,
        [id]: isLandscape,
      }));
  };

  const handleVideoMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    id: string | null
  ) => {
    const video = e.currentTarget;
    const isLandscape = video.videoWidth > video.videoHeight;
    if (id)
      setLandscapeItems((prev) => ({
        ...prev,
        [id]: isLandscape,
      }));
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
      if (ids.length === 0) return;
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
      if (ids.length === 0) return;
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
              <div
                key={key}
                onClick={() =>
                  selectionMode
                    ? toggleSelectItem(key)
                    : setSelectedIndex(index)
                }
                className={`relative cursor-pointer overflow-hidden bg-white flex items-center justify-center border-4 transition-all duration-200 ${
                  isLandscape ? "md:col-span-2" : ""
                } ${
                  selectionMode && isSelected
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                {selectionMode && (
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="w-5 h-5"
                    />
                  </div>
                )}

                {item.type === "PHOTO" ? (
                  <img
                    src={`${BASE_URL}${item.url}`}
                    alt={`Media ${item.id}`}
                    className="max-h-[400px] w-full object-contain"
                    onLoad={(e) => handleImageLoad(e, item.id)}
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={`${BASE_URL}${item.url}`}
                    className="max-h-[400px] w-full object-contain"
                    muted
                    loop
                    autoPlay
                    playsInline
                    onLoadedMetadata={(e) => handleVideoMetadata(e, item.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Viewer */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-6 text-white text-4xl font-bold"
          >
            ×
          </button>
          <button
            onClick={handlePrev}
            className="absolute left-4 text-white text-4xl font-bold"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 text-white text-4xl font-bold"
          >
            ›
          </button>

          <div className="max-h-screen max-w-screen flex items-center justify-center">
            {media[selectedIndex].type === "PHOTO" ? (
              <img
                src={`${BASE_URL}${media[selectedIndex].url}`}
                alt="Full view"
                className="max-h-screen max-w-screen object-contain"
              />
            ) : (
              <video
                src={`${BASE_URL}${media[selectedIndex].url}`}
                className="max-h-screen max-w-screen object-contain"
                controls
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BinPage;
