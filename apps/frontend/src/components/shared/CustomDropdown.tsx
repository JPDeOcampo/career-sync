import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/utils/cn";

interface DropdownProps {
  label: string;
  children: ReactNode;
  align?: "left" | "right";
}

export const Dropdown = ({
  label,
  children,
  align = "left",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const alignmentClass = align === "right" ? "right-0" : "left-0";
  //   const arrowAlignmentClass = align === "right" ? "right-4" : "left-4";
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleClick}
        className={cn(
          "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "flex justify-between items-center h-10.5 outline-none transition-[color,box-shadow]",
        )}
      >
        <span className="text-sm font-medium">{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${alignmentClass} z-50 mt-2 w-full origin-top bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600`}
        >
          {/* The Arrow (Pointer) */}
          {/* <div
            className={`absolute -top-2 ${arrowAlignmentClass} w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 -z-10 shadow-[-3px_-3px_3px_-1px_rgba(0,0,0,0.02)]`}
          /> */}

          <div className="py-2 px-1">{children}</div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  icon,
  label,
  onSelect,
}: {
  icon?: ReactNode;
  label: string;
  onSelect?: (value: string) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect?.(label)}
    className={`
      flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors text-gray-900 dark:text-white
       hover:bg-gray-100 dark:hover:text-gray-900
      
    `}
  >
    {icon}
    {label}
  </button>
);
