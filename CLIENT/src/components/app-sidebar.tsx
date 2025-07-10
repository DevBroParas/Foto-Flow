import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ImageIcon,
  VideoIcon,
  FolderIcon,
  UsersIcon,
  Trash2Icon,
  LayoutGridIcon,
  UploadCloud,
  LogOutIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { logout } from "@/app/authSlice";

const items = [
  { title: "Media", path: "/media", icon: LayoutGridIcon },
  { title: "Upload", path: "/upload", icon: UploadCloud },
  { title: "Photo", path: "/photo", icon: ImageIcon },
  { title: "Video", path: "/video", icon: VideoIcon },
  { title: "Album", path: "/album", icon: FolderIcon },
  { title: "People", path: "/people", icon: UsersIcon },
  { title: "Bin", path: "/bin", icon: Trash2Icon },
];

export function AppSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Sidebar className="h-full">
      <SidebarContent className="h-full flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-6">
            <img src="/logo.png" alt="logo" className="w-10 h-10" />
            <span className="text-xl font-bold">Foto Flow</span>
          </div>

          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 w-full px-3 py-2 rounded-md transition ${
                            isActive
                              ? "bg-muted text-blue-500 font-semibold"
                              : "hover:bg-muted"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="text-md">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* 🔻 Logout Button */}
        <div className="px-4 py-4 border-t border-muted">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-red-500 hover:bg-muted transition"
          >
            <LogOutIcon className="w-5 h-5" />
            <span className="text-md">Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
