import { Controller, useFormContext, useFieldArray } from "react-hook-form";
import { DefaultField } from "@/components/shared/JobField";
import { Dropdown, DropdownItem } from "@/components/shared/CustomDropdown";
import { Checkbox } from "@/components/shared/Checkbox";
import { interviewTypes } from "@/constant/jobSelectList";
import { cn } from "@/utils/cn";
import { Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CustomTooltip from "@/components/shared/CustomTooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { selectGlobal } from "@/store/selectors";
import { setIsShowModal } from "@/store/slices/globalSlice";
import ConfirmActionModal from "@/components/shared/ConfirmActionModal";
import { v4 as uuidv4 } from "uuid";
import Card from "@/components/shared/Card";
import { getTodayString } from "@/utils/dateHelper";
import { InterviewInfo } from "@/@types/jobTypes";

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
  const dispatch = useAppDispatch();
  const { isShowModal } = useAppSelector(selectGlobal);

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
              onClick={() => dispatch(setIsShowModal(true))}
              className="text-background bg-red-500 hover:bg-red-400 rounded-full p-1 cursor-pointer"
            >
              <Minus size={16} />
            </button>
          </CustomTooltip>
          <ConfirmActionModal
            isShow={isShowModal}
            description={`Are you sure you want to delete this <b>${title} ${orderId}</b>? This action cannot be undone.`}
            onConfirm={removedItem}
          />
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
      interviewID: uuidv4(),
      interviewType: "",
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
        <Card
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
            <div>
              <label className="block text-sm font-medium mb-1 text-left">
                Type
              </label>
              <Controller
                name={`interviewStages.${index}.interviewType`}
                control={control}
                render={({ field: controllerField }) =>
                  isViewOnly ? (
                    <p className="text-sm font-medium">
                      {controllerField.value}
                    </p>
                  ) : (
                    <Dropdown
                      label={controllerField.value || interviewTypes[0]}
                      align="left"
                    >
                      {interviewTypes.map((s) => (
                        <DropdownItem
                          key={s}
                          label={s}
                          onSelect={controllerField.onChange}
                        />
                      ))}
                    </Dropdown>
                  )
                }
              />
            </div>

            <DefaultField
              label="Interviewer"
              {...register(`interviewStages.${index}.interviewerName`)}
            />

            <DefaultField
              type="date"
              label="Date"
              {...register(`interviewStages.${index}.interviewDate`)}
            />

            <DefaultField
              type="time"
              label="Time"
              {...register(`interviewStages.${index}.interviewTime`)}
            />

            <div className="md:col-span-2">
              <DefaultField
                label="Comment"
                as="textarea"
                rows={3}
                {...register("interviewComment")}
              />
            </div>
          </div>
        </Card>
      ))}

      {!isViewOnly && fields.length <= 4 && (
        <AddButton label="Add new Interview" onClick={handleAdd} />
      )}

      <Checkbox
        label="Received Offer"
        disabled={isViewOnly}
        {...register("offer")}
      />
    </div>
  );
};

export default JobInterviewSection;
