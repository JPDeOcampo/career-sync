/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/dateHelper";
import { FieldLabel } from "@/components/shared/Label";

type Props = {
  label?: string;
  value?: Date | string | null;
  isViewOnly?: boolean;
  onChange: (date: string) => void;
};

// Safe date parser
const toDate = (val: Date | string | null | undefined): Date => {
  if (!val) return new Date();
  return val instanceof Date ? val : new Date(val);
};

const CustomDatePicker = ({
  label = "Date",
  value,
  isViewOnly,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(toDate(value));

  // Normalize selected date
  const selectedDate = value ? toDate(value) : undefined;

  // Sync when parent value changes
  useEffect(() => {
    if (value) {
      setViewDate(toDate(value));
    }
  }, [value]);

  const handlePrevMonth = () => setViewDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setViewDate((prev) => addMonths(prev, 1));

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = getDay(startOfMonth(viewDate));

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(formatDate(newDate, "yyyy/MM/dd"));
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <FieldLabel label={label} isViewOnly={isViewOnly} />}

      {isViewOnly && (
        <p className="text-job-value">
          {(value && formatDate(value, "MMM dd, yyyy")) || "-"}
        </p>
      )}

      {!isViewOnly && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-default",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "flex items-center h-10.5 outline-none transition-[color,box-shadow]",
                !selectedDate && "text-slate-400",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate
                ? formatDate(selectedDate, "MMM dd, yyyy")
                : "Pick a date"}
            </button>
          </Popover.Trigger>

          <Popover.Content
            align="start"
            className="z-50 mt-2 p-4 w-full origin-top bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-default">
                {format(viewDate, "MMMM yyyy")}
              </span>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:text-gray-900 rounded-md"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:text-gray-900 rounded-md"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* WEEKDAYS */}
            <div className="grid grid-cols-7 text-center text-xs mb-2 text-default font-bold">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* DAYS */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Actual days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;

                const date = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth(),
                  day,
                );

                const isSelected =
                  selectedDate && isSameDay(selectedDate, date);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-sm transition-all",
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-md"
                        : "text-default hover:bg-gray-100 dark:hover:text-gray-900",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const formattedDate = format(today, "yyyy/MM/dd");
                  onChange(formattedDate);
                  setViewDate(today);
                  setOpen(false);
                }}
                className="text-xs font-bold text-default hover:text-white/80"
              >
                Today
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  );
};

export default CustomDatePicker;
