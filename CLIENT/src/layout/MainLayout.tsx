import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <LayoutWithSidebar />
    </SidebarProvider>
  );
};

const LayoutWithSidebar = () => {
  const { state } = useSidebar();
  const sidebarWidth = state === "collapsed" ? "w-12" : "w-64";

  return (
    <div className="flex min-h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      >
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
  );
};

export default MainLayout;
