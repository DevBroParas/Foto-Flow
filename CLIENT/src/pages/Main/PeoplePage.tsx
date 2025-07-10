import React, { useEffect, useState, useCallback } from "react";
import { getAllPerson, updatePerson } from "@/service/PersonService";
import FullscreenViewer from "@/components/FullscreenViewer";
import MediaGridItem from "@/components/MediaGridItem";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSelectedPersonId, setCurrentTab } from "@/app/selectionSlice";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/api\/?$/,
  ""
) as string;

type BoundingBox = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Face = {
  id: string;
  boundingBox: BoundingBox;
  media: {
    id: string;
    url: string;
    width: number;
    height: number;
    deletedAt: string | null;
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
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  const visibleFaces =
    selectedPerson?.faces.filter((face) => !face.media.deletedAt) ?? [];

  const fetchPeople = async () => {
    try {
      const res = await getAllPerson();
      setPeople(res.data);
    } catch (err) {
      console.error("Failed to fetch people", err);
    }
  };

  useEffect(() => {
    dispatch(setCurrentTab("people"));
    fetchPeople();
  }, [dispatch]);

  useEffect(() => {
    if (selectedPerson) {
      setNewName(selectedPerson.name || "");
    }
  }, [selectedPerson]);

  const closePreview = () => setSelectedIndex(null);

  const showPrev = useCallback(() => {
    if (visibleFaces.length && selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : prev));
    }
  }, [selectedIndex, visibleFaces]);

  const showNext = useCallback(() => {
    if (visibleFaces.length && selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev! < visibleFaces.length - 1 ? prev! + 1 : prev
      );
    }
  }, [selectedIndex, visibleFaces]);

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

  const personMediaList = visibleFaces.map((face) => ({
    id: face.media.id,
    type: "PHOTO" as const,
    url: face.media.url,
  }));

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
    id: string
  ) => {
    const img = e.currentTarget;
    setLandscapeItems((prev) => ({
      ...prev,
      [id]: img.naturalWidth > img.naturalHeight,
    }));
  };

  const handleSaveName = async () => {
    try {
      if (!selectedPerson) return;
      await updatePerson(selectedPerson.id, { name: newName });
      await fetchPeople();
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update name", err);
    }
  };

  return (
    <div className="p-4 w-full min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧑 People</h1>
      </div>

      {selectedPerson ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            {editingName ? (
              <>
                <input
                  type="text"
                  className="border px-2 py-1 rounded"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={handleSaveName}
                >
                  Save
                </button>
                <button
                  className="text-sm px-3 py-1 bg-gray-300 rounded"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  {selectedPerson.name || "Unknown"}
                </h2>
                <button
                  className="text-sm text-blue-600 underline ml-2"
                  onClick={() => setEditingName(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {visibleFaces.map((face, index) => {
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
          {people.filter((p) => p.faces.some((f) => !f.media.deletedAt))
            .length === 0 ? (
            <div className="w-full h-60 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
              No people detected yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {people
                .filter((person) =>
                  person.faces.some((face) => !face.media.deletedAt)
                )
                .map((person) => {
                  const face = person.faces.find((f) => !f.media.deletedAt);
                  if (!face) return null;

                  const imageUrl = face.media.url;
                  const box = face.boundingBox;
                  const width = face.media.width ?? 512;
                  const height = face.media.height ?? 512;

                  const centerX = (box.left + box.right) / 2;
                  const centerY = (box.top + box.bottom) / 2;
                  const xPercent = (centerX / width) * 100;
                  const yPercent = (centerY / height) * 100;

                  return (
                    <div
                      key={person.id}
                      onClick={() => dispatch(setSelectedPersonId(person.id))}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-square overflow-hidden rounded-xl bg-gray-200 relative">
                        <img
                          src={BASE_URL + imageUrl}
                          alt="face"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          style={{
                            objectPosition: `${xPercent}% ${yPercent}%`,
                          }}
                        />
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
