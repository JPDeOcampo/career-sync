/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { FieldLabel } from "./Label";

type Props = {
  label?: string;
  value?: string | null;
  isViewOnly?: boolean;
  showAfterLabel?: boolean;
  isRequired?: boolean;
  onChange: (time: string) => void;
};

const parseTime = (val?: string | null) => {
  if (!val) return { hour: 12, minute: 0, period: "AM" };

  if (val.includes("AM") || val.includes("PM")) {
    const [time, period] = val.split(" ");
    const [h, m] = time.split(":").map(Number);
    return { hour: h, minute: m, period };
  }

  const [h, m] = val.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;

  return { hour, minute: m, period };
};

const CustomTimePicker = ({
  label = "Time",
  value,
  isViewOnly,
  showAfterLabel = true,
  isRequired,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false);

  const parsed = parseTime(value);

  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  const handleApply = () => {
    const formatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
    onChange(formatted);
    setOpen(false);
  };

  const getNowTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const p = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;

    const formatted = `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${p}`;

    return formatted;
  };

  useEffect(() => {
    const parsed = parseTime(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);

    if (!value) {
      const nowTime = getNowTime();
      onChange(nowTime);
    }
  }, [value]);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <FieldLabel
          label={label}
          isViewOnly={isViewOnly}
          showAfterLabel={showAfterLabel}
          isRequired={isRequired}
        />
      )}

      {isViewOnly && <p className="text-job-value">{value || "-"}</p>}

      {!isViewOnly && (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-default",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "flex items-center h-10.5 outline-none transition-[color,box-shadow]",
                !value && "text-slate-400",
              )}
            >
              <Clock className="mr-2 h-4 w-4" />
              {value || (getNowTime() as unknown as string)}
            </button>
          </Popover.Trigger>

          <Popover.Content
            align="start"
            className="z-50 mt-2 p-4 w-full origin-top bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-default">
                Select Time
              </span>
            </div>

            {/* PICKER */}
            <div className="flex justify-center gap-2">
              {/* HOURS */}
              <div className="flex flex-col max-h-40 overflow-auto">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setHour(h)}
                    className={cn(
                      "px-2 py-1 rounded text-sm transition-all",
                      hour === h
                        ? "bg-blue-600 text-white font-bold shadow-md"
                        : "text-default hover:bg-gray-100 dark:hover:text-gray-900",
                    )}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                ))}
              </div>

              {/* MINUTES */}
              <div className="flex flex-col max-h-40 overflow-auto">
                {Array.from({ length: 60 }, (_, i) => i)
                  .filter((m) => m % 5 === 0)
                  .map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMinute(m)}
                      className={cn(
                        "px-2 py-1 rounded text-sm transition-all",
                        minute === m
                          ? "bg-blue-600 text-white font-bold shadow-md"
                          : "text-default hover:bg-gray-100 dark:hover:text-gray-900",
                      )}
                    >
                      {String(m).padStart(2, "0")}
                    </button>
                  ))}
              </div>

              {/* AM / PM */}
              <div className="flex flex-col">
                {["AM", "PM"].map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      "px-2 py-1 rounded text-sm transition-all",
                      period === p
                        ? "bg-blue-600 text-white font-bold shadow-md"
                        : "text-default hover:bg-gray-100 dark:hover:text-gray-900",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => {
                  getNowTime();
                  setOpen(false);
                }}
                className="text-xs font-bold text-default hover:text-white/80"
              >
                Now
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="text-xs font-bold text-default hover:text-white/80"
              >
                Apply
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      )}
    </div>
  );
};

export default CustomTimePicker;
