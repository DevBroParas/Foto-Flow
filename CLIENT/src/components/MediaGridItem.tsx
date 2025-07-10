import React, { useRef, useState } from "react";
import { Play } from "lucide-react"; // Make sure Lucide is installed

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.load(); // load only on hover
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <>
          <video
            ref={videoRef}
            src={`${baseUrl}${url}`}
            className="max-h-[400px] w-full object-contain"
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => onLoadVideo?.(e, id)}
          />

          {!isHovered && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MediaGridItem;
