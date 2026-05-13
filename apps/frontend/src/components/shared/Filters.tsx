import { Search, Trash2 } from "lucide-react";
import { Dropdown, DropdownItem } from "./CustomDropdown";
import { Checkbox } from "./Checkbox";

export const SearchFilter = ({
  filters,
  onSearch,
}: {
  filters: string;
  onSearch: (value: string) => void;
}) => {
  return (
    <div className="flex w-full gap-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company, role, or location..."
          value={filters}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export const DropdownFilters = ({
  valueLabel,
  value,
  filterList,
  handleFilterChange,
}: {
  valueLabel: string;
  value: string;
  filterList: { label: string; value: string }[];
  handleFilterChange: (filter: string) => void;
}) => {
  return (
    <div className="min-w-45 flex items-center gap-4">
      <Dropdown value={`${valueLabel}: ${value}`} align="left">
        {filterList.map((s) => (
          <DropdownItem
            key={s.label}
            item={s.label}
            selectedItem={value}
            onSelect={() => handleFilterChange(s.value)}
          />
        ))}
      </Dropdown>
    </div>
  );
};

export const ActionFilters = ({
  items,
  selectedItems,
  isLoading,
  onSelectionChange,
  onDelete,
}: {
  items: { id: string }[];
  selectedItems: string[];
  isLoading: boolean;
  onSelectionChange: (ids: string[], selected: boolean) => void;
  onDelete: (ids: string[]) => void;
}) => {
  const total = items.length;

  const filteredItems = selectedItems.filter((id) =>
    items.some((item) => item.id === id),
  );

  const checkboxState =
    filteredItems.length === 0
      ? "unchecked"
      : filteredItems.length === total
        ? "checked"
        : "indeterminate";

  const isDisabled = checkboxState === "unchecked" || isLoading;

  return (
    <div className="flex items-center gap-4 justify-between w-full">
      <Checkbox
        name="selectAll"
        label={checkboxState === "checked" ? "Deselect All" : "Select All"}
        labelClassName={`text-md font-semibold text-foreground/90    ${
          isLoading || items?.length === 0
            ? "text-foreground/40 cursor-not-allowed opacity-60"
            : " text-foreground/90 hover:text-foreground"
        }`}
        variantSize="lg"
        className="w-44"
        state={checkboxState}
        checked={
          (checkboxState === "checked" || checkboxState === "indeterminate") &&
          !isLoading
        }
        disabled={isLoading || items?.length === 0}
        onChange={(e) => {
          const ids = items.map((item) => item.id);
          const shouldSelectAll =
            checkboxState === "indeterminate" || e.target.checked;

          onSelectionChange(ids, shouldSelectAll);
        }}
      />

      <button
        disabled={isDisabled}
        className={`flex gap-2 items-center font-semibold transition-colors
              ${
                isDisabled
                  ? "text-foreground/40 cursor-not-allowed opacity-60"
                  : "text-foreground/90 hover:text-red-500 cursor-pointer"
              }`}
        onClick={() => onDelete(filteredItems)}
      >
        <Trash2 className={`w-6 h-6 ${isDisabled ? "opacity-60" : ""}`} />
        <span className="hidden md:block">Delete</span>
      </button>
    </div>
  );
};
