import React from "react";

interface MediaItemProps {
  url: string;
  id: string;
  type: "PHOTO" | "VIDEO";
  isSelected?: boolean;
  selectionMode?: boolean;
  isLandscape?: boolean;
  onClick?: () => void;
  onLoadImage?: (e: React.SyntheticEvent<HTMLImageElement>, id: string) => void;
  onLoadVideo?: (e: React.SyntheticEvent<HTMLVideoElement>, id: string) => void;
  baseUrl: string;
}

const MediaGridItem: React.FC<MediaItemProps> = ({
  url,
  id,
  type,
  isSelected = false,
  selectionMode = false,
  isLandscape = false,
  onClick,
  onLoadImage,
  onLoadVideo,
  baseUrl,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden bg-white flex items-center justify-center border-4 transition-all duration-200 ${
        isLandscape ? "md:col-span-2" : ""
      } ${
        selectionMode && isSelected ? "border-blue-500" : "border-transparent"
      }`}
    >
      {selectionMode && (
        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="w-5 h-5 accent-blue-600"
          />
        </div>
      )}

      {type === "PHOTO" ? (
        <img
          src={`${baseUrl}${url}`}
          alt={`Media ${id}`}
          className="max-h-[400px] w-full object-contain"
          onLoad={(e) => onLoadImage?.(e, id)}
          loading="lazy"
        />
      ) : (
        <video
          src={`${baseUrl}${url}`}
          className="max-h-[400px] w-full object-contain"
          muted
          loop
          autoPlay
          playsInline
          onLoadedMetadata={(e) => onLoadVideo?.(e, id)}
        />
      )}
    </div>
  );
};

export default MediaGridItem;
