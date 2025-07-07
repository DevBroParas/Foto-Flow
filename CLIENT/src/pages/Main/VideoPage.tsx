import React, { useEffect, useState } from "react";
import { getAllMedia } from "../../service/MediaService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";

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

const BASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/api\/?$/,
  ""
) as string;

const VideoPage = () => {
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
        const response = await getAllMedia();
        if (response?.data?.media) {
          const videosOnly = response.data.media
            .filter((item: Media) => item.type === "VIDEO")
            .reverse();
          setMedia(videosOnly);
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

  const handleVideoMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    id: string | null
  ) => {
    const video = e.currentTarget;
    const isLandscape = video.videoWidth > video.videoHeight;
    setLandscapeItems((prev) => ({
      ...prev,
      [id || video.src]: isLandscape,
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
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">Video Gallery</h2>
        <div className="mb-4 flex items-center gap-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              setSelectionMode((prev) => !prev);
              if (selectionMode) setSelectedItems(new Set());
            }}
          >
            {selectionMode ? "Cancel Selection" : "Select Videos"}
          </button>
          {selectionMode && selectedItems.size > 0 && (
            <span className="text-lg font-medium">
              {selectedItems.size} selected
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* {media.map((item, index) => {
          const key = item.id || item.url;
          const isLandscape = landscapeItems[key] ?? false;
          const isSelected = selectedItems.has(key);

          return (
            <div
              key={key}
              onClick={() => {
                if (selectionMode) {
                  toggleSelectItem(key);
                } else {
                  setSelectedIndex(index);
                }
              }}
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
              <video
                src={`${BASE_URL}${item.url}`}
                className="max-h-[400px] w-full object-contain"
                muted
                loop
                autoPlay
                playsInline
                onLoadedMetadata={(e) => handleVideoMetadata(e, item.id)}
              />
            </div>
          );
        })} */}
        {media.map((item, index) => {
          const key = item.id || item.url;
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
                selectionMode ? toggleSelectItem(key) : setSelectedIndex(index)
              }
              onLoadVideo={handleVideoMetadata}
            />
          );
        })}
      </div>

      {selectedIndex !== null && (
        <FullscreenViewer
          media={media}
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

export default VideoPage;
