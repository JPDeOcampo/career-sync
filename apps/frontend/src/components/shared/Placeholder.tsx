import React from "react";
import { CircleAlert, Briefcase } from "lucide-react";

const containerClass =
  "px-6 py-12 text-center text-gray-500 dark:text-gray-400";
const iconClass = "w-12 h-12 mx-auto mb-3 opacity-50";
const descriptionClass = "text-sm mt-1";
const childrenClass = "text-sm mt-1";

export const ErrorState = ({
  icon = <CircleAlert className={iconClass} />,
  text = "Something went wrong. Please try again later.",
}: {
  icon?: React.ReactNode;
  text?: string;
}) => {
  return (
    <div className={containerClass}>
      {icon}
      <p>{text}</p>
    </div>
  );
};

export const EmptyState = ({
  icon = <Briefcase className={iconClass} />,
  title = "No job applications yet.",
  description,
  children,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className={containerClass}>
      {icon}
      <p>{title}</p>
      {description && <p className={descriptionClass}>{description}</p>}
      {children && <div className={childrenClass}>{children}</div>}
    </div>
  );
};
