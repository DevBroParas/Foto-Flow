import React from "react";
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
  const selected = media[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-white text-4xl font-bold hover:text-red-400 transition"
      >
        <X size={32} />
      </button>
      <button
        onClick={onPrev}
        className="absolute left-6 text-white text-4xl font-bold hover:text-blue-300"
      >
        <ArrowLeft size={32} />
      </button>
      <button
        onClick={onNext}
        className="absolute right-6 text-white text-4xl font-bold hover:text-blue-300"
      >
        <ArrowRight size={32} />
      </button>

      <div className="max-h-screen max-w-screen flex items-center justify-center rounded-lg overflow-hidden">
        {selected.type === "PHOTO" ? (
          <img
            src={`${baseUrl}${selected.url}`}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        ) : (
          <video
            src={`${baseUrl}${selected.url}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            controls
            autoPlay
          />
        )}
      </div>
    </div>
  );
};

export default FullscreenViewer;
