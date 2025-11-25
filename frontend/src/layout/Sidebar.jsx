import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PaymentsIcon from "@mui/icons-material/Payments";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null); // 'admin' | 'user' | 'superadmin'
  const [openSection, setOpenSection] = useState(null); // track open parent

  useEffect(() => {
    // ✅ Read user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);
      const role = (parsed.role || "").toLowerCase();
      setUserRole(role);
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  }, []);

  const isAdmin =
    userRole === "admin" ||
    userRole === "superadmin"; // adjust according to your roles

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    navigate("/login");
  };

  const toggleSection = (label) => {
    setOpenSection(openSection === label ? null : label);
  };

  // 👇 dynamic ticket path based on role
  const ticketPath = isAdmin ? "/tickets" : "/user/tickets";
  const myTicketPath=isAdmin ? "/my-tickets":"/user/my-tickets"
  // 👇 build menu based on role
  const menuSections = [
     {
      label: "Dashboard",
      icon: DashboardIcon,
      // you can also have separate dashboards if you want
      path: isAdmin ? "/dashboard" : "/user-dashboard",
    },
    {
      label: "Tickets",
      icon: PaymentsIcon,
      children: [
        {
          label: isAdmin ? "All Tickets" : "Assign Tickets",
          path: ticketPath,
        },
           {
          label: "My Ticket",
          path: myTicketPath,
        },
      ],
    },
    // You can keep settings only for admin if you want
    // isAdmin &&
    // {
    //   label: "Settings",
    //   icon: SettingsIcon,
    //   path: "/settings",
    // },
  ].filter(Boolean); // remove falsy (e.g. settings when not admin)

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200">
      <nav className="flex-1 overflow-y-auto p-3 text-sm sm:text-base">
        {menuSections.map((section) => {
          const isOpen = openSection === section.label;
          const Icon = section.icon;

          // No children = simple nav
          if (!section.children) {
            return (
              <NavLink
                key={section.label}
                to={section.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 w-full p-2 rounded-lg transition-all 
                   ${
                     isActive
                       ? "text-blue-800 font-semibold bg-blue-50"
                       : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                   }`
                }
              >
                <Icon fontSize="small" />
                <span>{section.label}</span>
              </NavLink>
            );
          }

          // Parent with children
          return (
            <div key={section.label} className="mb-2">
              <button
                onClick={() => toggleSection(section.label)}
                className={`flex items-center justify-between w-full p-2 rounded-lg font-semibold transition-all 
                ${
                  isOpen
                    ? "text-blue-800 bg-blue-50"
                    : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon fontSize="small" />
                  {section.label}
                </span>
                <ArrowDropDownIcon
                  fontSize="small"
                  className={`transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Collapsible content */}
              {isOpen && (
                <div className="mt-1">
                  {section.children.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center w-full p-2 pl-8 rounded-lg transition-all hover:bg-blue-50 ${
                          isActive
                            ? "text-blue-800 font-semibold bg-blue-50"
                            : "text-gray-700 hover:text-blue-700"
                        }`
                      }
                    >
                      <ChevronRightIcon className="mr-2" fontSize="small" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <hr className="my-4 border-gray-200" />

        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 rounded-lg transition-all hover:bg-blue-50 text-gray-700 hover:text-blue-700"
        >
          <LogoutIcon className="mr-3" fontSize="small" />
          Log Out
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
