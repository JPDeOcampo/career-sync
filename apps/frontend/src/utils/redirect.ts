import { NextRouter } from "next/router";
import { toast } from "sonner";

type RedirectOptions = {
  router: NextRouter;
  path?: string;
  countdown?: number;
  delay?: number;
};

export const redirectWithCountdown = ({
  router,
  path = "/login",
  countdown = 3,
  delay = 1200,
}: RedirectOptions) => {
  setTimeout(() => {
    let seconds = countdown;

    const toastId = toast(`Redirecting in ${seconds}...`);

    const interval = setInterval(() => {
      seconds--;

      if (seconds > 0) {
        toast.loading(`Redirecting in ${seconds}...`, {
          id: toastId,
        });
      } else {
        clearInterval(interval);
        toast.dismiss(toastId);
        router.push(path);
      }
    }, 1000);
  }, delay);
};
