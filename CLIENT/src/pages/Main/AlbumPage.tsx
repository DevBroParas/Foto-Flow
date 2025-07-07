import React, { useEffect, useState, useRef } from "react";
import {
  getAllAlbum,
  createAlbumApi,
  deleteAlbumApi,
  updateAlbumApi,
} from "@/service/AlbumService";
import { getAllMedia } from "@/service/MediaService";
import MediaGridItem from "@/components/MediaGridItem";
import FullscreenViewer from "@/components/FullscreenViewer";

const BASE_URL = import.meta.env.VITE_API_URL?.replace(
  /\/api\/?$/,
  ""
) as string;

interface Media {
  id: string;
  url: string;
  type: "PHOTO" | "VIDEO";
}

interface Album {
  id: string;
  title: string;
  description: string;
  userId: string;
  coverPhotoId: string | null;
  createdAt: string;
  media: Media[];
}

const AlbumPage = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [landscapeItems, setLandscapeItems] = useState<Record<string, boolean>>(
    {}
  );
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await getAllAlbum();
        if (response?.data?.albums) setAlbums(response.data.albums);
      } catch (error) {
        console.error("Error fetching albums:", error);
      }
    };
    fetchAlbum();
  }, []);

  useEffect(() => {
    if (!createMode) return;
    const fetchMedia = async () => {
      try {
        const response = await getAllMedia();
        if (response?.data?.media) setMedia(response.data.media);
      } catch (error) {
        console.error("Error fetching media:", error);
      }
    };
    fetchMedia();
  }, [createMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, selectedAlbum]);

  const handlePrev = () => {
    if (selectedAlbum && selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev! > 0 ? prev! - 1 : selectedAlbum.media.length - 1
      );
    }
  };

  const handleNext = () => {
    if (selectedAlbum && selectedIndex !== null) {
      setSelectedIndex((prev) =>
        prev! < selectedAlbum.media.length - 1 ? prev! + 1 : 0
      );
    }
  };

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

  const toggleMedia = (id: string) => {
    setSelectedMedia((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  const handleEditClick = (album: Album) => {
    setEditAlbum(album);
    setEditTitle(album.title);
    setEditDescription(album.description);
    setMenuOpenId(null);
  };

  const handleUpdateAlbum = async () => {
    if (!editAlbum) return;
    try {
      await updateAlbumApi(editAlbum.id, {
        title: editTitle,
        description: editDescription,
      });
      setEditAlbum(null);
      const refreshed = await getAllAlbum();
      setAlbums(refreshed.data.albums);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this album?")) return;
    try {
      await deleteAlbumApi(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      setMenuOpenId(null);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleCreateAlbum = async () => {
    try {
      const mediaIds = Array.from(selectedMedia);
      await createAlbumApi({
        title: newTitle,
        description: newDescription,
        mediaIds,
      });
      setCreateMode(false);
      setNewTitle("");
      setNewDescription("");
      setSelectedMedia(new Set());
      const refreshed = await getAllAlbum();
      setAlbums(refreshed.data.albums);
    } catch (err) {
      console.error("Album creation failed", err);
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Albums</h1>
        <button
          onClick={() => setCreateMode((prev) => !prev)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {createMode ? "Cancel" : "+ Create Album"}
        </button>
      </div>

      {createMode && (
        <div className="mb-6 p-4 border rounded shadow bg-white">
          <h2 className="text-xl font-bold mb-2">New Album</h2>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 mb-2 border"
          />
          <textarea
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 mb-4 border"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto mb-4">
            {media.map((m) => (
              <div
                key={m.id}
                className={`border-4 ${
                  selectedMedia.has(m.id)
                    ? "border-blue-500"
                    : "border-transparent"
                } cursor-pointer`}
                onClick={() => toggleMedia(m.id)}
              >
                {m.type === "PHOTO" ? (
                  <img
                    src={`${BASE_URL}${m.url}`}
                    alt="media"
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <video
                    src={`${BASE_URL}${m.url}`}
                    className="w-full h-40 object-cover"
                    muted
                    loop
                    playsInline
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleCreateAlbum}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Album
          </button>
        </div>
      )}

      {editAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h2 className="text-xl font-bold mb-4">Edit Album</h2>
            <input
              type="text"
              className="w-full p-2 mb-2 border"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="w-full p-2 mb-4 border"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setEditAlbum(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleUpdateAlbum}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAlbum ? (
        <>
          <button
            className="mb-4 text-blue-600 underline"
            onClick={() => setSelectedAlbum(null)}
          >
            ← Back to Albums
          </button>
          <h2 className="text-2xl font-bold mb-2">{selectedAlbum.title}</h2>
          <p className="text-gray-600 mb-4">{selectedAlbum.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {selectedAlbum.media.map((item, index) => {
              const key = item.id || item.url;
              return (
                <MediaGridItem
                  key={key}
                  url={item.url}
                  id={item.id}
                  type={item.type}
                  isSelected={false}
                  selectionMode={false}
                  isLandscape={landscapeItems[key] ?? false}
                  baseUrl={BASE_URL}
                  onClick={() => setSelectedIndex(index)}
                  onLoadImage={handleImageLoad}
                  onLoadVideo={handleVideoMetadata}
                />
              );
            })}
          </div>

          {selectedIndex !== null && (
            <FullscreenViewer
              media={selectedAlbum.media}
              selectedIndex={selectedIndex}
              onClose={() => setSelectedIndex(null)}
              onPrev={handlePrev}
              onNext={handleNext}
              baseUrl={BASE_URL}
            />
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {albums.map((item) => (
            <div key={item.id} className="group relative">
              <div
                className="aspect-square w-full rounded-2xl overflow-hidden shadow-md cursor-pointer"
                onClick={() => setSelectedAlbum(item)}
              >
                {item.media.length > 0 ? (
                  item.media[0].type === "PHOTO" ? (
                    <img
                      src={`${BASE_URL}${item.media[0].url}`}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${BASE_URL}${item.media[0].url}`}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  )
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                    No Cover Image
                  </div>
                )}
              </div>
              <div
                className="absolute top-2 right-2 z-30"
                ref={(el) => {
                  menuRefs.current[item.id] = el;
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === item.id ? null : item.id);
                  }}
                  className="bg-white/80 hover:bg-white rounded-full p-1"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="text-gray-700"
                  >
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                  </svg>
                </button>
                {menuOpenId === item.id && (
                  <div
                    className="absolute right-0 mt-2 w-32 bg-white border rounded shadow z-40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      onClick={() => handleDeleteAlbum(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="font-bold uppercase text-gray-700 text-lg mt-2">
                {item.title}
              </p>
              <p className="text-gray-400 text-sm">{item.media.length} items</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlbumPage;
