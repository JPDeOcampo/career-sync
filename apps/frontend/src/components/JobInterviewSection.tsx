import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { JobFormField } from "@/components/shared/JobFormField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/shared/Checkbox";
import { interviewTypes } from "@/constant/jobSelectList";
import { cn } from "@/utils/cn";
import { Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CustomTooltip from "@/components/shared/CustomTooltip";
import InterviewStageCard from "@/components/shared/InterviewStageCard";
import { InterviewInfo, getTodayString } from "@career-sync/shared";
import { useGlobalModal } from "@/context/GlobalModalContext";
import CustomDatePicker from "./shared/CustomDatePicker";
import CustomTimePicker from "./shared/CustomTimePicker";

interface AddButtonProps {
  label?: string;
  onClick: () => void;
  className?: string;
}

const ItemHeader = ({
  title,
  orderId,
  index,
  moveUp,
  moveDown,
  removedItem,
  items,
  isViewOnly,
}: {
  title: string;
  orderId: number;
  index: number;
  moveUp: () => void;
  moveDown: () => void;
  removedItem: () => void;
  items: InterviewInfo[];
  isViewOnly?: boolean;
}) => {
  const { handleGlobalModal } = useGlobalModal();
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="overflow-hidden font-bold flex gap-1">
        <motion.span layout>{title}</motion.span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={orderId}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {orderId}
          </motion.span>
        </AnimatePresence>
      </div>
      {!isViewOnly && (
        <div className="flex gap-2">
          {index > 0 && (
            <CustomTooltip label="Move Up" position="bottom">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveUp();
                }}
                className="text-foreground bg-foreground/10 hover:bg-foreground/20 rounded-full p-1 cursor-pointer"
              >
                <ArrowUp size={16} />
              </button>
            </CustomTooltip>
          )}

          {index < items.length - 1 && (
            <CustomTooltip label="Move Down" position="bottom">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveDown();
                }}
                className="text-foreground bg-foreground/10 hover:bg-foreground/20 rounded-full p-1 cursor-pointer"
              >
                <ArrowDown size={16} />
              </button>
            </CustomTooltip>
          )}
          <CustomTooltip label="Remove" position="bottom">
            <button
              type="button"
              onClick={() =>
                handleGlobalModal({
                  variant: "default",
                  title: "Confirm Action",
                  description: (
                    <p>
                      Are you sure you want to delete this{" "}
                      <b>
                        {title} {orderId}
                      </b>
                      ? This action cannot be undone.
                    </p>
                  ),
                  onConfirm: () => {
                    removedItem();
                    handleGlobalModal({});
                  },
                })
              }
              className="text-background bg-red-500 hover:bg-red-400 rounded-full p-1 cursor-pointer"
            >
              <Minus size={16} />
            </button>
          </CustomTooltip>
        </div>
      )}
    </div>
  );
};

const AddButton: React.FC<AddButtonProps> = ({
  label = "Add",
  onClick,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1.5 w-full py-3 border-2 border-dashed border-foreground/20 text-foreground/40 hover:border-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg font-medium",
        className,
      )}
    >
      <span>
        <Plus size={18} />
      </span>
      <span>{label}</span>
    </button>
  );
};

const JobInterviewSection = ({
  isViewOnly = false,
}: {
  isViewOnly?: boolean;
}) => {
  const { register, control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "interviewStages",
    keyName: "id",
  });

  const hasInterviewStages = fields.length > 0;

  const handleAdd = () => {
    append({
      interviewType: interviewTypes[fields.length],
      interviewDate: getTodayString(),
      interviewTime: "",
      interviewerName: "",
      interviewComment: "",
    });
  };

  return (
    <div className="space-y-4">
      {isViewOnly && !hasInterviewStages && <p>No interviews added</p>}

      {fields.map((field, index) => (
        <InterviewStageCard
          key={field.id}
          className={!isViewOnly ? "hover:border-primary/30" : ""}
        >
          <ItemHeader
            title="Interview"
            orderId={index + 1}
            index={index}
            moveUp={() => index > 0 && move(index, index - 1)}
            moveDown={() => index < fields.length - 1 && move(index, index + 1)}
            removedItem={() => remove(index)}
            items={fields as unknown as InterviewInfo[]}
            isViewOnly={isViewOnly}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name={`interviewStages.${index}.interviewType`}
              control={control}
              render={({ field: controllerField }) => (
                <Dropdown
                  label={"Type"}
                  value={controllerField.value}
                  isViewOnly={isViewOnly}
                  align="left"
                  isRequired={true}
                >
                  {interviewTypes.map((s) => (
                    <DropdownItem
                      key={s}
                      item={s}
                      selectedItem={controllerField.value}
                      onSelect={controllerField.onChange}
                    />
                  ))}
                </Dropdown>
              )}
            />

            <JobFormField
              label="Interviewer"
              isViewOnly={isViewOnly}
              {...register(`interviewStages.${index}.interviewerName`)}
            />

            <Controller
              control={control}
              name={`interviewStages.${index}.interviewDate`}
              render={({ field }) => (
                <CustomDatePicker
                  value={field.value}
                  isViewOnly={isViewOnly}
                  onChange={field.onChange}
                  isRequired={true}
                />
              )}
            />

            <Controller
              control={control}
              name={`interviewStages.${index}.interviewTime`}
              render={({ field }) => (
                <CustomTimePicker
                  value={field.value}
                  isViewOnly={isViewOnly}
                  onChange={field.onChange}
                  isRequired={true}
                />
              )}
            />

            <div className="md:col-span-2">
              <JobFormField
                label="Comment"
                isViewOnly={isViewOnly}
                as="textarea"
                rows={3}
                {...register(`interviewStages.${index}.interviewComment`)}
              />
            </div>
          </div>
        </InterviewStageCard>
      ))}

      {!isViewOnly && fields.length <= 4 && (
        <AddButton label="Add new Interview" onClick={handleAdd} />
      )}

      {/* <Checkbox
        label="Received Offer"
        disabled={isViewOnly}
        isViewOnly={isViewOnly}
        {...register("offer")}
      /> */}
    </div>
  );
};

export default JobInterviewSection;
