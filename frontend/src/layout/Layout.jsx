import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useState } from "react";

const SIDEBAR_PX = 260; // keep this in sync with the arbitrary classes below

const Layout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  return (
    <div className="flex flex-col min-h-screen lg:pl-[260px]"> {/* Fixed: match sidebar width */}
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="flex flex-1">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside
          className={[
            "fixed z-40 top-16 bottom-0 left-0",
            "w-[260px] bg-white border-r border-gray-200",
            "transition-transform duration-300",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:translate-x-0"
          ].join(" ")}
          aria-hidden={!isSidebarOpen && typeof window !== "undefined" && window.innerWidth < 1024}
        >
          <Sidebar />
        </aside>

        <main
          className={[
            "flex-1 mt-6",
            "pt-6",
            "transition-[padding] duration-300",
            "px-4 lg:px-6"  // Simplified padding
          ].join(" ")}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
