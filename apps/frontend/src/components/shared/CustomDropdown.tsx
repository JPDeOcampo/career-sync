import { useState, ReactNode, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/utils/cn";

interface DropdownProps {
  label: string;
  children: ReactNode;
  align?: "left" | "right";
}

interface DropdownContextType {
  closeDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("DropdownItem must be used inside Dropdown");
  }
  return context;
};

export const Dropdown = ({
  label,
  children,
  align = "left",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick(() => setIsOpen(false));

  const alignmentClass = align === "right" ? "right-0" : "left-0";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      {" "}
      <div className="relative inline-block w-full" ref={dropdownRef}>
        {/* Trigger */}
        <button
          onClick={handleClick}
          className={cn(
            "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-default",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "flex justify-between items-center h-10.5 outline-none transition-[color,box-shadow]",
          )}
        >
          {" "}
          <span className="text-sm font-medium">{label}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Menu */}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 mt-2 w-full origin-top bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600",
              alignmentClass,
            )}
          >
            <div className="py-2 px-1">{children}</div>
          </div>
        )}
      </div>
    </DropdownContext.Provider>
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
}) => {
  const { closeDropdown } = useDropdown();

  const handleClick = () => {
    onSelect?.(label);
    closeDropdown();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md transition-colors text-default hover:bg-gray-100 dark:hover:text-gray-900"
    >
      {icon}
      {label}{" "}
    </button>
  );
};
