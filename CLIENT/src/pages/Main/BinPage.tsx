import React, { useEffect, useState } from "react";
import { getAllBin } from "@/service/BinService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  toggleSelectedItem,
  setCurrentTab,
  setMediaNeedsRefresh,
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

const BinPage = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [landscapeItems, setLandscapeItems] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const mediaNeedsRefresh = useAppSelector(
    (state) => state.selection.mediaNeedsRefresh
  );

  const dispatch = useAppDispatch();
  const { selectionMode, selectedItems } = useAppSelector(
    (state) => state.selection
  );

  useEffect(() => {
    dispatch(setCurrentTab("bin"));
  }, [dispatch]);

  const fetchMedia = async () => {
    try {
      const response = await getAllBin();
      if (response?.data?.media) {
        setMedia(response.data.media.reverse());
      }
    } catch (error) {
      console.error("Error fetching bin media:", error);
    }
  };

  useEffect(() => {
    const checkAndRefresh = async () => {
      await fetchMedia();
      dispatch(setMediaNeedsRefresh(false));
    };

    if (mediaNeedsRefresh) {
      checkAndRefresh();
    }
  }, [mediaNeedsRefresh, dispatch]);

  useEffect(() => {
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
    dispatch(toggleSelectedItem(id));
  };

  return (
    <div className="p-4 w-full flex flex-col min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Bin</h2>
        {selectionMode && selectedItems.length > 0 && (
          <span className="text-gray-700 text-md font-medium">
            {selectedItems.length} selected
          </span>
        )}
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-lg">
          No file in bin
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
          {media.map((item, index) => {
            const key = item.id || item.url;
            if (!key) return null;

            return (
              <MediaGridItem
                key={key}
                url={item.url}
                id={item.id!}
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
