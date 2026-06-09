/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { InputName } from "@/components/shared/CustomUserInput";
import { updateProfileSchema, UserDTO } from "@career-sync/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProfileMutation } from "@/store/api/userApi";
import useAuthHooks from "@/hooks/useAuth";
import { useAppDispatch } from "@/hooks/useRedux";
import { setUser } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { SectionHeaderWithEdit } from "@/components/shared/SectionHeader";
import FormWrapper from "@/components/shared/FormWrapper";
import { handleApiError, handleApiResponse } from "@/utils/handleApi";
import FormActionsSetting from "@/components/shared/FormActionsSetting";

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

const PersonalInformation = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuthHooks();

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();

  const methods = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: UserDTO) => {
    const { firstName, lastName } = data;
    if (isUpdatingProfile) return;

    try {
      const response = (await updateProfile({
        id: user?.id as string,
        firstName: firstName || "",
        lastName: lastName || "",
      }).unwrap()) as unknown as { user: UserDTO; message: string };

      handleApiResponse(response, () => {
        dispatch(setUser(response.user));
        onViewOnly();
      });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  useEffect(() => {
    reset(user as UserDTO);
  }, []);

  return (
    <div>
      <SectionHeaderWithEdit
        title="Personal Information"
        isViewOnly={isViewOnly}
        onClick={onViewOnly}
      />

      <FormWrapper methods={methods} onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <InputName
            {...register("firstName")}
            label="First Name"
            placeholder="John"
            autofocus
            error={errors.firstName?.message}
            isViewOnly={isViewOnly}
          />

          <InputName
            {...register("lastName")}
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            isViewOnly={isViewOnly}
          />
        </div>

        {!isViewOnly && (
          <FormActionsSetting
            onCancel={() => {
              onViewOnly();
              reset();
            }}
            isLoading={isUpdatingProfile}
            isSubmitting={isSubmitting}
          />
        )}
      </FormWrapper>
    </div>
  );
};

export default PersonalInformation;
