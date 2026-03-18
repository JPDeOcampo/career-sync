import React from "react";
import { CircleAlert } from "lucide-react";

const Error = ({
  errorIcon = <CircleAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />,
  errorText = "Something went wrong. Please try again later.",
}: {
  errorIcon?: React.ReactNode;
  errorText?: string;
}) => {
  return (
    <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
      {errorIcon}
      <p>{errorText}</p>
    </div>
  );
};

export default Error;
