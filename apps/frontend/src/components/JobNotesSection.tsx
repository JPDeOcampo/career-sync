import { useFormContext } from "react-hook-form";
import { JobFormField } from "@/components/shared/JobFormField";

const JobInterviewSection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <JobFormField
        label="Notes"
        rows={5}
        as="textarea"
        {...register("notes")}
      />
    </div>
  );
};

export default JobInterviewSection;
