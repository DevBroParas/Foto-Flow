import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 shadow-md w-full">
      <div className="flex items-center justify-between w-full">
        {/* Logo + Title */}
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold tracking-tight">Foto Flow</h1>
        </div>

        {/* Optional user actions / sidebar trigger for mobile */}
        <SidebarTrigger className="md:hidden" />
      </div>
    </nav>
  );
};

export default Navbar;
