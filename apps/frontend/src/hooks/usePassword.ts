import { useState } from "react";

export const usePasswordVisibility = () => {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible((prev) => !prev);

  return {
    visible,
    toggle,
  };
};
