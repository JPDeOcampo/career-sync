/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { InputEmail } from "@/components/shared/CustomUserInput";
import { LoadingSpinner } from "@/components/shared/Loading";
import {
  emailSchema,
  UserDTO,
  EmailChangeRequestDTO,
} from "@career-sync/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeaderWithEdit } from "@/components/shared/SectionHeader";
import {
  useUpdateEmailMutation,
  useResendVerificationEmailMutation,
  useRemoveNewEmailMutation,
} from "@/store/api/authApi";
import useAuthHooks from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { selectAuth } from "@/store/selectors";
import {
  addEmailChangeRequest,
  clearEmailChangeRequests,
} from "@/store/slices/authSlice";
import { toast } from "sonner";
import { handleApiResponse, handleApiError } from "@/utils/handleApi";
import { Minus, Mail, AlertCircle } from "lucide-react";
import FormWrapper from "@/components/shared/FormWrapper";
import FormActionsSetting from "@/components/shared/FormActionsSetting";
import { useCountdown } from "@/hooks/useCountdown";
import { getEmailVerificationExpiresAtDate } from "@/utils/cookies";

type UpdateEmailFormData = z.infer<typeof emailSchema>;

const EmailInformation = ({
  isViewOnly,
  onViewOnly,
}: {
  isViewOnly: boolean;
  onViewOnly: () => void;
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAuthHooks();
  const hasNewEmail =
    user?.emailChangeRequests && user.emailChangeRequests.length > 0;
  const isPendingNewEmail = !hasNewEmail || isViewOnly;
  const newEmail = user?.emailChangeRequests?.[0]?.newEmail as string;

  const { sessionExpiry } = useAppSelector(selectAuth);

  const [updateEmail, { isLoading: isUpdatingProfile }] =
    useUpdateEmailMutation();

  const [resendVerificationEmail, { isLoading: isResendingVerificationEmail }] =
    useResendVerificationEmailMutation();

  const [removeNewEmail, { isLoading: isRemovingNewEmail }] =
    useRemoveNewEmailMutation();

  const methods = useForm<UpdateEmailFormData>({
    resolver: zodResolver(emailSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const expiresAt = useMemo(() => getEmailVerificationExpiresAtDate(), [user]);
  const countdown = useCountdown(expiresAt, "minutes");

  const onSubmit = async (data: UserDTO) => {
    const email = data.email;
    if (isUpdatingProfile) return;

    try {
      const response = (await updateEmail({
        id: user?.id as string,
        email: email || "",
      }).unwrap()) as unknown as {
        newEmail: EmailChangeRequestDTO;
        message: string;
      };

      handleApiResponse(response, () => {
        dispatch(addEmailChangeRequest(response.newEmail));
        onViewOnly();
      });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleResend = async (email: string) => {
    if (sessionExpiry > 0) return;
    try {
      const response = await resendVerificationEmail({
        id: user?.id as string,
        email: email,
      }).unwrap();
      handleApiResponse(response, () => {});
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleRemoveNewEmail = async (email: string) => {
    if (isRemovingNewEmail) return;
    try {
      const response = await removeNewEmail({
        id: user?.id as string,
        email,
      }).unwrap();
      handleApiResponse(response, () => {
        onViewOnly();
        dispatch(clearEmailChangeRequests([]));
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
        title="Email Information"
        isViewOnly={isViewOnly}
        onClick={onViewOnly}
      />

      <FormWrapper methods={methods} onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-3">
          {isPendingNewEmail && (
            <InputEmail
              {...register("email")}
              error={errors.email?.message}
              isViewOnly={isViewOnly}
              showIcon={{
                isVisible: true,
                status: user?.emailStatus as "VERIFIED" | "UNVERIFIED",
              }}
            />
          )}

          <div className="space-y-1">
            {hasNewEmail && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {" "}
                Account still using the old email. Please verify your new email
                before using it.
              </p>
            )}

            {hasNewEmail && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-600" />
                      <h4 className="font-medium text-sm">New Email Address</h4>
                    </div>

                    <div className="mt-3 inline-flex items-center rounded-lg bg-background border px-3 py-2">
                      <span className="text-sm font-medium">{newEmail}</span>
                    </div>
                  </div>
                  {!isViewOnly && (
                    <button
                      type="button"
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors"
                      disabled={isRemovingNewEmail}
                      onClick={() => handleRemoveNewEmail(newEmail)}
                    >
                      {isRemovingNewEmail && (
                        <LoadingSpinner className="h-4 w-4 animate-spin" />
                      )}
                      {!isRemovingNewEmail && <Minus className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />

                    <div className="flex-1">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Please verify your new email address before it can be
                        used.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleResend(newEmail)}
                        disabled={
                          isResendingVerificationEmail ||
                          countdown?.minutes != null
                        }
                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {
                          <span className="flex items-center gap-1">
                            {countdown?.minutes == null && (
                              <span> Resend verification email</span>
                            )}

                            {isResendingVerificationEmail && <LoadingSpinner />}
                            {countdown?.minutes != null && (
                              <span>
                                Resend in {countdown.minutes}m{" "}
                                {countdown.seconds}s
                              </span>
                            )}
                          </span>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {!isViewOnly && (
          <FormActionsSetting
            onCancel={() => {
              onViewOnly();
              reset();
            }}
            isLoading={isUpdatingProfile}
            isShowSubmit={isPendingNewEmail}
            isSubmitting={isSubmitting}
          />
        )}
      </FormWrapper>
    </div>
  );
};

export default EmailInformation;
