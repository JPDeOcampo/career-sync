import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import useGlobalHooks from "@/hooks/useGlobal";
const SubNavbar = () => {
  const { navigate, pathname } = useGlobalHooks();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/jobs", icon: Briefcase, label: "Jobs" },
    { path: "/kanban", icon: KanbanSquare, label: "Kanban" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
  ];

  return (
    <nav className="surface overflow-x-auto no-scrollbar px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-1 whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative px-3 sm:px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}
                />
                <span
                  className={
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SubNavbar;
