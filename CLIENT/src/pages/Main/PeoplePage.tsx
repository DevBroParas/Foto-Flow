import React, { useEffect, useState, useCallback } from "react";
import { getAllPerson } from "@/service/PersonService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSelectedPersonId, setCurrentTab } from "@/app/selectionSlice";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/api\/?$/,
  ""
) as string;

type Face = {
  id: string;
  media: {
    id: string;
    url: string;
    width: number;
    height: number;
  };
};

type Person = {
  id: string;
  name: string;
  faces: Face[];
};

const PeoplePage = () => {
  const dispatch = useAppDispatch();
  const selectedPersonId = useAppSelector(
    (state) => state.selection.selectedPersonId
  );

  const [people, setPeople] = useState<Person[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [landscapeItems, setLandscapeItems] = useState<Record<string, boolean>>(
    {}
  );

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  useEffect(() => {
    dispatch(setCurrentTab("people"));
    const fetchPeople = async () => {
      try {
        const res = await getAllPerson();
        setPeople(res.data);
      } catch (err) {
        console.error("Failed to fetch people", err);
      }
    };
    fetchPeople();
  }, [dispatch]);

  const closePreview = () => setSelectedIndex(null);

  const showPrev = useCallback(() => {
    if (selectedPerson && selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : prev));
    }
  }, [selectedIndex, selectedPerson]);

  const showNext = useCallback(() => {
    if (selectedPerson && selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev! < selectedPerson.faces.length - 1 ? prev! + 1 : prev
      );
    }
  }, [selectedIndex, selectedPerson]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, showPrev, showNext]);

  const personMediaList =
    selectedPerson?.faces.map((face) => ({
      id: face.media.id,
      type: "PHOTO" as const,
      url: face.media.url,
    })) ?? [];

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    id: string
  ) => {
    const img = e.currentTarget;
    const isLandscape = img.naturalWidth > img.naturalHeight;
    setLandscapeItems((prev) => ({ ...prev, [id]: isLandscape }));
  };

  return (
    <div className="p-4 w-full min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧑 People</h1>
      </div>

      {selectedPerson ? (
        <>
          <h2 className="text-xl font-semibold mb-4">
            {selectedPerson.name || "Unknown"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {selectedPerson.faces.map((face, index) => {
              const { media } = face;

              return (
                <MediaGridItem
                  key={face.id}
                  url={media.url}
                  id={media.id}
                  type="PHOTO"
                  isSelected={false}
                  selectionMode={false}
                  isLandscape={landscapeItems[media.id] ?? false}
                  baseUrl={BASE_URL}
                  onClick={() => setSelectedIndex(index)}
                  onLoadImage={handleImageLoad}
                />
              );
            })}
          </div>
        </>
      ) : (
        <>
          {people.length === 0 ? (
            <div className="w-full h-60 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
              No people detected yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {people.map((person) => {
                const imageUrl = person.faces[0]?.media?.url;
                return (
                  <div
                    key={person.id}
                    onClick={() => dispatch(setSelectedPersonId(person.id))}
                    className="cursor-pointer group"
                  >
                    <div className="aspect-square overflow-hidden rounded-xl bg-gray-200">
                      {imageUrl ? (
                        <img
                          src={BASE_URL + imageUrl}
                          alt={person.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-center text-sm font-medium text-gray-800">
                      {person.name || "Unknown"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedIndex !== null && selectedPerson && (
        <FullscreenViewer
          media={personMediaList}
          selectedIndex={selectedIndex}
          onClose={closePreview}
          onPrev={showPrev}
          onNext={showNext}
          baseUrl={BASE_URL}
        />
      )}
    </div>
  );
};

export default PeoplePage;
