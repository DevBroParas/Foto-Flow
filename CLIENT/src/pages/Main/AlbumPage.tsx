import { getAllAlbum } from "@/service/AlbumService";
import React, { useEffect, useState } from "react";

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

type Album = {
  id: string;
  userId: string;
  title: string;
  description: string;
  coverPhotoId: string | null;
  createdAt: string;
  coverPhoto: null;
  media: Media[];
};

const AlbumPage = () => {
  const [album, setAlbum] = useState<Album[]>([]);
  const [albumFormState, setAlbumFormState] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await getAllAlbum();
        if (response?.data?.albums) {
          setAlbum(response.data.albums);
        }
      } catch (error) {
        console.error("Error fetching album:", error);
      }
    };
    fetchAlbum();
  }, []);

  const toggleAlbumForm = () => {
    setAlbumFormState(!albumFormState);
  };

  return (
    <div>
      <div className="flex items-center justify-between px-5">
        <h1 className="text-3xl font-bold mb-4">Album's</h1>
        <button onClick={toggleAlbumForm} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          + Add Album
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 ">
        {album.map((item) => (
          <div className="" key={item.id}>
            <div className="border-blue-500 border-2 h-60 w-60 rounded-2xl ">
              {/* <img src={} alt="coverPhoto" /> */}
            </div>
            <p className="font-bold uppercase text-gray-700 text-lg">
              {item.title}
            </p>
            <p className="text-gray-400 text-sm">{item.media.length} items</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumPage;
