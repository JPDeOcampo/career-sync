import { useFormContext } from "react-hook-form";
import { DefaultField } from "@/components/shared/JobField";

const JobInterviewSection = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-4">
      <DefaultField
        label="Notes"
        rows={5}
        as="textarea"
        {...register("notes")}
      />
    </div>
  );
};

export default JobInterviewSection;
