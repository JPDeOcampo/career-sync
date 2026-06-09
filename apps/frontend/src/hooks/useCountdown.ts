import { useEffect, useState } from "react";

type CountdownMode = "full" | "hours" | "minutes" | "seconds";

export const useCountdown = (
  target: string | Date | null,
  mode: CountdownMode = "full",
) => {
  const [timeLeft, setTimeLeft] = useState<Record<
    string,
    number | boolean
  > | null>(null);

  useEffect(() => {
    if (!target) return;

    const targetTime = target instanceof Date ? target : new Date(target);

    const update = () => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ expired: true, total: 0 });
        return;
      }

      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (mode === "seconds") {
        setTimeLeft({ seconds: Math.floor(diff / 1000), total: diff });
      } else if (mode === "minutes") {
        setTimeLeft({
          minutes: Math.floor(diff / 60000),
          seconds,
          total: diff,
        });
      } else if (mode === "hours") {
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes,
          seconds,
          total: diff,
        });
      } else {
        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          total: diff,
        });
      }
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [target, mode]);

  return timeLeft;
};
