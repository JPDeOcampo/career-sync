import { useState, ReactNode, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./Label";
import { UploadCloud } from "lucide-react";
import useDocumentsHooks from "@/hooks/useDocuments";

interface DropdownProps {
  label?: string;
  value: string;
  children: ReactNode;
  isViewOnly?: boolean;
  showAfterLabel?: boolean;
  isRequired?: boolean;
  align?: "left" | "right";
  url?: string;
  className?: string;
  containerClassName?: string;
  isDisabled?: boolean;
  onClick?: () => void;
}

const DropdownContext = createContext<{ closeDropdown: () => void } | null>(
  null,
);

const useDropdown = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error("useDropdown must be used within <Dropdown />");
  }
  return ctx;
};

export const Dropdown = ({
  label,
  value,
  isViewOnly = false,
  isRequired = false,
  showAfterLabel = true,
  children,
  align = "left",
  url,
  className,
  containerClassName = "max-h-40 overflow-auto px-1.5",
  isDisabled = false,
  onClick,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick(() => setIsOpen(false));
  const { viewDocument } = useDocumentsHooks();

  const closeDropdown = () => setIsOpen(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
    onClick?.();
  };

  const alignment = align === "right" ? "right-0" : "left-0";

  return (
    <DropdownContext.Provider value={{ closeDropdown }}>
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <FieldLabel
            label={label}
            isViewOnly={isViewOnly}
            showAfterLabel={showAfterLabel}
            isRequired={isRequired}
          />
        )}

        {/* VIEW ONLY MODE */}
        {isViewOnly &&
          (url ? (
            <button
              type="button"
              onClick={() => viewDocument({ id: "", url })}
              className="text-job-value w-fit underline hover:opacity-70"
            >
              {value || "-"}
            </button>
          ) : (
            <p className="text-job-value">{value || "-"}</p>
          ))}

        {!isViewOnly && (
          <div className="relative w-full" ref={ref}>
            {/* Trigger */}
            <button
              onClick={toggle}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
                "bg-white dark:bg-gray-700 text-default",
                "flex justify-between items-center h-10.5",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                className,
              )}
              disabled={isDisabled}
            >
              <span className="text-sm font-medium">{value}</span>

              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {/* Menu */}
            {isOpen && (
              <div
                className={cn(
                  "absolute z-50 mt-2 w-full bg-white dark:bg-gray-700",
                  "rounded-lg shadow-xl border py-2 overflow-hidden",
                  alignment,
                )}
              >
                <ul className={cn(containerClassName)}>{children}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownUpload = ({
  onFileSelect,
  accept = ".pdf",
}: {
  onFileSelect: (file: File) => void;
  accept?: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <label
      className={cn(
        "flex items-center justify-center gap-2 w-full px-3 py-2",
        "text-sm font-medium cursor-pointer",
        "bg-blue-50 text-blue-600 hover:bg-blue-100",
        "dark:bg-gray-800 dark:text-gray-400",
        "absolute bottom-0",
      )}
    >
      <input type="file" hidden accept={accept} onChange={handleChange} />
      <UploadCloud size={18} />
      Upload File
    </label>
  );
};

export const DropdownItem = ({
  icon,
  item,
  selectedItem,
  onSelect,
}: {
  icon?: ReactNode;
  item?: string;
  selectedItem?: string;
  onSelect?: (value?: string) => void;
}) => {
  const { closeDropdown } = useDropdown();

  const handleSelect = () => {
    onSelect?.(item);
    closeDropdown();
  };

  const isActive = item === selectedItem;

  return (
    <li>
      <button
        type="button"
        onClick={handleSelect}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 text-sm rounded-md",
          "transition-colors text-default",
          !isActive &&
            "hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100",
          isActive &&
            "bg-blue-600 dark:bg-gray-100 text-white dark:text-gray-900",
        )}
      >
        {icon}
        {item}
      </button>
    </li>
  );
};
