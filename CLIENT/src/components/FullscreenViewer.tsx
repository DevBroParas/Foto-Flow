import React, { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface FullscreenViewerProps {
  media: {
    id: string | null;
    type: "PHOTO" | "VIDEO";
    url: string;
  }[];
  selectedIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  baseUrl: string;
}

const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  media,
  selectedIndex,
  onClose,
  onPrev,
  onNext,
  baseUrl,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = media[selectedIndex];

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchStartX.current - touchEndX.current;
      if (deltaX > 50) onNext(); // swipe left
      else if (deltaX < -50) onPrev(); // swipe right
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el && document.fullscreenElement !== el) {
      el.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen failed:", err);
      });
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center sm:p-6 p-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-8 text-white hover:text-red-400 transition"
        aria-label="Close"
      >
        <X size={28} className="sm:size-8" />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-3 sm:left-6 text-white hover:text-blue-300 transition"
        aria-label="Previous"
      >
        <ArrowLeft size={28} className="sm:size-8" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-3 sm:right-6 text-white hover:text-blue-300 transition"
        aria-label="Next"
      >
        <ArrowRight size={28} className="sm:size-8" />
      </button>

      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        {selected.type === "PHOTO" ? (
          <img
            src={`${baseUrl}${selected.url}`}
            alt="Full view"
            className="object-contain w-full h-full"
          />
        ) : (
          <video
            src={`${baseUrl}${selected.url}`}
            className="object-contain w-full h-full"
            controls
            autoPlay
          />
        )}
      </div>
    </div>
  );
};

export default FullscreenViewer;
