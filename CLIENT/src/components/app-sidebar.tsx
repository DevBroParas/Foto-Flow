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
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { title: "Media", path: "/media", icon: LayoutGridIcon },
  { title: "Upload", path: "/Upload", icon: UploadCloud },
  { title: "Photo", path: "/photo", icon: ImageIcon },
  { title: "Video", path: "/video", icon: VideoIcon },
  { title: "Album", path: "/album", icon: FolderIcon },
  { title: "People", path: "/people", icon: UsersIcon },
  { title: "Bin", path: "/bin", icon: Trash2Icon },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="h-full">
      <SidebarContent className="h-full">
        {/* Logo at top */}
        <div className="flex items-center gap-3 px-4 py-6">
          <img src="/logo.png" alt="logo" className="w-10 h-10" />
          <span className="text-xl font-bold">Foto Flow</span>
        </div>

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
      </SidebarContent>
    </Sidebar>
  );
}
