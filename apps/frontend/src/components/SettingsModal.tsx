import { useState } from "react";
import Modal from "@/components/shared/Modal";
import AccountSetting from "./AccountSetting";
import DocumentSetting from "./DocumentSetting";
import { cn } from "@/utils/cn";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";

const settingsOptions = [
  { label: "Account Setting", value: "account" },
  { label: "File Setting", value: "files" },
];

const DesktopSettings = ({
  activeTab,
  handleTabChange,
  content,
}: {
  activeTab: string;
  handleTabChange: (tab: string) => void;
  content: React.ReactNode;
}) => {
  const buttonClass = "text-md text-start py-2 px-4 rounded-md mb-0";
  const hoverButtonClass = "hover:bg-gray-100 dark:hover:bg-gray-700";
  const activeButtonClass = "bg-gray-100 dark:text-gray-900";

  return (
    <div className="hidden md:grid grid-cols-6 h-full">
      {/* Left Column */}
      <div className="flex flex-col justify-start text-start gap-1 space-y-4 col-span-2 border-r border-r-gray-200 dark:border-gray-700 pl-6 py-6 pr-4">
        <button
          className={cn(
            buttonClass,
            activeTab === "account" && activeButtonClass,
            activeTab !== "account" && hoverButtonClass,
          )}
          onClick={() => handleTabChange("account")}
        >
          Account Setting
        </button>

        <button
          className={cn(
            buttonClass,
            activeTab === "documents" && activeButtonClass,
            activeTab !== "documents" && hoverButtonClass,
          )}
          onClick={() => handleTabChange("documents")}
        >
          Documents Setting
        </button>
      </div>

      {/* Right Column */}
      <div className={cn("col-span-4 max-h-[75vh] mb-23", "overflow-y-auto")}>
        {content}
      </div>
    </div>
  );
};

export const MobileSettings = ({
  activeTab,
  handleTabChange,
  content,
}: {
  activeTab: string;
  handleTabChange: (tab: string) => void;
  content: React.ReactNode;
}) => {
  const activeTabLabel =
    settingsOptions.find((s) => s.value === activeTab)?.label || "";

  return (
    <>
      <div className="block md:hidden p-4">
        <Dropdown value={activeTabLabel} align="left">
          {settingsOptions.map((s) => (
            <DropdownItem
              key={s.value}
              item={s.label}
              selectedItem={activeTabLabel}
              onSelect={() => handleTabChange(s.value)}
            />
          ))}
        </Dropdown>
      </div>
      <div className="block md:hidden mb-4 h-full overflow-y-auto">
        {content}
      </div>
    </>
  );
};

const SettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState("account");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderActiveTabContent = () => {
    return (
      <>
        {activeTab === "account" && <AccountSetting />}
        {activeTab === "documents" && <DocumentSetting />}
      </>
    );
  };

  return (
    <Modal
      headerText="Settings"
      onClose={onClose}
      containerClassName="max-w-5xl h-[80vh]"
    >
      {/* Desktop View */}
      <DesktopSettings
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        content={renderActiveTabContent()}
      />

      {/* Mobile View */}
      <MobileSettings
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        content={renderActiveTabContent()}
      />
    </Modal>
  );
};

export default SettingsModal;
