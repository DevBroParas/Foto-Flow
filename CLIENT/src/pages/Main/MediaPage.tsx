import React, { useEffect, useState } from "react";
import { getAllMedia } from "../../service/MediaService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setCurrentTab,
  setMediaNeedsRefresh,
  toggleSelectedItem,
} from "@/app/selectionSlice";

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

const MediaPage = () => {
  const [media, setMedia] = useState<Media[]>([]);

  const [landscapeItems, setLandscapeItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mediaNeedsRefresh = useAppSelector(
    (state) => state.selection.mediaNeedsRefresh
  );

  const dispatch = useAppDispatch();
  const selectionMode = useAppSelector(
    (state) => state.selection.selectionMode
  );
  const selectedItems = useAppSelector(
    (state) => state.selection.selectedItems
  );

  useEffect(() => {
    dispatch(setCurrentTab("media"));
  }, [dispatch]);

  // ✅ Define fetchMedia outside useEffect
  const fetchMedia = async () => {
    try {
      const response = await getAllMedia();
      if (response?.data?.media) {
        setMedia(response.data.media.reverse());
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    }
  };

  useEffect(() => {
    dispatch(setCurrentTab("media"));
    fetchMedia(); // initial load
  }, [dispatch]);

  // ✅ Refresh when redux flag says to
  useEffect(() => {
    if (mediaNeedsRefresh) {
      fetchMedia();
      dispatch(setMediaNeedsRefresh(false));
    }
  }, [mediaNeedsRefresh, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  // Watch for Redux action completion if needed or trigger refetch manually.

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    id: string | null
  ) => {
    const img = e.currentTarget;
    const isLandscape = img.naturalWidth > img.naturalHeight;
    setLandscapeItems((prev) => ({ ...prev, [id || img.src]: isLandscape }));
  };

  const handleVideoMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
    id: string | null
  ) => {
    const video = e.currentTarget;
    const isLandscape = video.videoWidth > video.videoHeight;
    setLandscapeItems((prev) => ({ ...prev, [id || video.src]: isLandscape }));
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
    dispatch(toggleSelectedItem(id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-800">
          📷 Media Gallery
        </h2>
      </div>

      {media.length === 0 ? (
        <div className="text-center col-span-full py-16 text-gray-500 text-xl">
          No media found. Start uploading to see your photos and videos here!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
          {media.map((item, index) => {
            const key: string = item.id ?? item.url;

            return (
              <MediaGridItem
                key={key}
                url={item.url}
                id={key}
                type={item.type}
                isSelected={selectedItems.includes(key)}
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

export default MediaPage;
