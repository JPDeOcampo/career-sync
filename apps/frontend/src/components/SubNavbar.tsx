import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import useGlobalHooks from "@/hooks/useGlobal";
import { useEffect, useRef, useState } from "react";

const SubNavbar = () => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<HTMLButtonElement[]>([]);

  const { navigate, pathname } = useGlobalHooks();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/jobs", icon: Briefcase, label: "Jobs" },
    { path: "/kanban", icon: KanbanSquare, label: "Kanban" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
  ];

  const centerItem = (index: number) => {
    const container = stripRef.current;
    const item = thumbRefs.current[index];

    if (!container || !item) return;

    const containerWidth = container.clientWidth;
    const itemLeft = item.offsetLeft;
    const itemWidth = item.offsetWidth;

    const targetScroll = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const updateArrows = () => {
    const el = stripRef.current;
    if (!el) return;

    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const getStepSize = () => {
    const items = thumbRefs.current;

    if (items.length === 0) return 0;
    if (items.length === 1) return items[0].offsetWidth;

    const first = items[0];
    const second = items[1];

    return second.offsetLeft - first.offsetLeft;
  };

  const scrollByStep = (dir: "left" | "right", steps = 2) => {
    const el = stripRef.current;
    if (!el) return;

    const stepSize = getStepSize();

    const scrollAmount = stepSize > 0 ? stepSize * steps : el.clientWidth * 0.7;

    el.scrollBy({
      left: dir === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    updateArrows();

    el.addEventListener("scroll", updateArrows);
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  return (
    <nav className="surface px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* LEFT ARROW */}
          {showLeft && (
            <button
              onClick={() => scrollByStep("left", 2)}
              className="md:hidden absolute -left-2 top-1/2 -translate-y-1/2 z-20
              bg-background/80 backdrop-blur-md rounded-full p-1.5 shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* SCROLL STRIP */}
          <div
            ref={stripRef}
            className="flex items-center gap-4 sm:gap-2 whitespace-nowrap overflow-x-auto no-scrollbar scroll-smooth"
          >
            {navItems.map((item, i) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  ref={(el) => {
                    if (el) thumbRefs.current[i] = el;
                  }}
                  onClick={() => {
                    navigate(item.path);
                    centerItem(i);
                  }}
                  className="relative px-3 sm:px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors shrink-0"
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
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

          {/* RIGHT ARROW */}
          {showRight && (
            <button
              onClick={() => scrollByStep("right", 2)}
              className="md:hidden absolute -right-2 top-1/2 -translate-y-1/2 z-20
              bg-background/80 backdrop-blur-md rounded-full p-1.5 shadow-md"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SubNavbar;
