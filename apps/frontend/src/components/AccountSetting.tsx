import { useState } from "react";

import PersonalInformation from "@/components/PersonalInformation";
import EmailInformation from "@/components/EmailInformation";
import UpdatePassword from "@/components/UpdatePassword";
import DeleteAccount from "@/components/DeleteAccount";

type SectionId = "personal-information" | "email" | "password";

interface SectionProps {
  isViewOnly: boolean;
  onViewOnly: () => void;
}

const AccountSetting = () => {
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  const sections: {
    id: SectionId;
    Component: React.ComponentType<SectionProps>;
  }[] = [
    {
      id: "personal-information",
      Component: PersonalInformation,
    },
    {
      id: "email",
      Component: EmailInformation,
    },
    {
      id: "password",
      Component: UpdatePassword,
    },
  ];

  const toggleSection = (section: SectionId) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  return (
    <div className="h-full space-y-10 px-4 md:pt-6">
      {sections.map(({ id, Component }) => {
        const visible = activeSection === null || activeSection === id;

        if (!visible) return null;

        return (
          <Component
            key={id}
            isViewOnly={activeSection !== id}
            onViewOnly={() => toggleSection(id)}
          />
        );
      })}

      {!activeSection && (
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <DeleteAccount />
        </div>
      )}
    </div>
  );
};

export default AccountSetting;
