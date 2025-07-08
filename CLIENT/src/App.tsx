import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchUser } from "./app/authSlice";

// Layout and Protected Route
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./routes/Protected";

// Page Components (assuming paths)
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import MediaPage from "./pages/Main/MediaPage";
import HomePage from "./pages/HomePage"; // Assuming you have a HomePage
import PhotoPage from "./pages/Main/PhotoPage";
import VideoPage from "./pages/Main/VideoPage";
import AlbumPage from "./pages/Main/AlbumPage";
import PeoplePage from "./pages/Main/PeoplePage";
import BinPage from "./pages/Main/BinPage";
import UploadPage from "./pages/Main/UploadPage";

function App() {
  const dispatch = useAppDispatch();
  // Use status to prevent re-fetching on every render
  const authStatus = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    // Only fetch the user if we haven't tried yet
    if (authStatus === "idle") {
      dispatch(fetchUser());
    }
  }, [authStatus, dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* Example nested routes inside MainLayout */}
          <Route index element={<HomePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="photo" element={<PhotoPage />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="album" element={<AlbumPage />} />
          <Route path="bin" element={<BinPage />} />
          <Route path="people" element={<PeoplePage />} />

          {/* Add other protected routes here */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
