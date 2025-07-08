import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <AppSidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 w-full">
          <Navbar />
          <main className="flex-1 overflow-auto pt-[64px]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
