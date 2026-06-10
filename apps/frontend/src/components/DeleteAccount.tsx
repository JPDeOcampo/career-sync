import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { InputPassword } from "@/components/shared/CustomUserInput";
import { LoadingSpinner } from "@/components/shared/Loading";
import Button from "@/components/shared/Button";
import { passwordSchema, OAuthProviderDTO } from "@career-sync/shared";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomTooltip from "./shared/CustomTooltip";
import { Trash2, TriangleAlert } from "lucide-react";
import {
  useDeleteLocalAccountMutation,
  useDeleteAccountOAuthMutation,
} from "@/store/api/authApi";
import useAuthHooks from "@/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/router";
import Modal from "./shared/Modal";
import { cn } from "@/utils/cn";
import OAuthButton from "@/components/shared/OAuthButton";
import { handleApiResponse, handleApiError } from "@/utils/handleApi";
import { usePasswordVisibility } from "@/hooks/usePassword";
import { redirectWithCountdown } from "@/utils/redirect";

type DeleteAccountFormData = z.infer<typeof passwordSchema>;

const DeleteAccount = () => {
  const router = useRouter();
  const [isShowForm, setIsShowForm] = useState(false);
  const [isShowConfirm, setIsShowConfirm] = useState(false);

  const currentPassword = usePasswordVisibility();

  const { user, oAuth } = useAuthHooks();
  const hasLocalAccount = user?.accounts?.some(
    (acc) => acc.provider === "LOCAL",
  );
  const [deleteLocalAccount, { isLoading: isDeletingLocal }] =
    useDeleteLocalAccountMutation();

  const [deleteAccountOAuth, { isLoading: isDeletingOAuth }] =
    useDeleteAccountOAuthMutation();

  const methods = useForm<DeleteAccountFormData>({
    resolver: zodResolver(passwordSchema),
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const handleDeleteAccount =
    ({
      password,
      provider,
    }: {
      password?: string;
      provider?: OAuthProviderDTO;
    }) =>
    async () => {
      if (isDeletingLocal || isDeletingOAuth) return;

      if (!user?.id) {
        toast.error("User not found");
        return;
      }

      let response: string | { message: string } = "";

      try {
        if (password) {
          response = await deleteLocalAccount({
            id: user.id,
            password,
          }).unwrap();
        } else {
          if (!provider) {
            toast.error("OAuth provider is required");
            return;
          }

          const token = await oAuth(provider);

          if (!token) {
            toast.error("Missing OAuth token");
            return;
          }

          response = await deleteAccountOAuth({
            id: user.id,
            idToken: token,
          }).unwrap();
        }

        handleApiResponse(response, () => {
          redirectWithCountdown({
            router,
          });
        });
      } catch (error) {
        toast.error(handleApiError(error));
      }
    };

  const onSubmit = (data: { password: string }) => {
    const { password } = data;
    handleDeleteAccount({ password })();
  };

  const handleCloseModal = () => {
    currentPassword.toggle();
    setIsShowForm(false);
    setIsShowConfirm(false);
  };

  return (
    <div className="border border-red-400 bg-red-300/10 rounded-md p-4">
      <div className="space-y-4">
        <div>
          <h3 className="flex gap-2 items-center text-lg font-semibold text-red-400">
            <span>
              <TriangleAlert />
            </span>
            Danger Zone
          </h3>
        </div>

        <div className="flex justify-between items-center gap-6">
          <p className="text-sm text-foreground">
            <span className="font-semibold"> Delete this account</span>
            <br />
            <span>
              Once you delete a account all your data will be permanently
              deleted, there is no going back. Please be certain.
            </span>
          </p>
          <CustomTooltip label="Delete Account" position="bottom">
            <Button
              type="submit"
              variant="destructive"
              className="w-10 h-10 p-0 shrink-0"
              onClick={() => setIsShowConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CustomTooltip>
        </div>
      </div>
      {isShowConfirm && (
        <Modal
          headerText="Delete Account"
          headerClassName="text-md font-semibold text-default"
          containerClassName={cn(
            "w-full flex flex-col h-auto",
            isShowForm ? "max-w-md max-h-[55vh]" : "max-w-2xl max-h-[40vh]",
          )}
          onClose={handleCloseModal}
        >
          <div className="flex-1 overflow-y-auto px-6 my-6">
            {!isShowForm && (
              <div className="flex flex-col h-full justify-between gap-6">
                <div className="flex flex-col items-center justify-center gap-4 flex-1">
                  <span className="text-center text-9xl">
                    <TriangleAlert className="h-16 w-16 text-red-400" />
                  </span>

                  <p className="text-center">
                    Are you sure you want to delete your account{" "}
                    <b>{user?.email}</b>?
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full h-10 shrink-0"
                  onClick={() => setIsShowForm(true)}
                >
                  Yes, delete my account
                </Button>
              </div>
            )}

            {isShowForm && (
              <>
                {user?.accounts?.length && user?.accounts?.length > 1 && (
                  <p className="mb-4 text-sm text-foreground">
                    This account is linked with <b>{user?.accounts?.length}</b>{" "}
                    provider(s). Once you delete your account, all linked
                    accounts will also be deleted.
                  </p>
                )}

                {!hasLocalAccount && (
                  <div>
                    <p className="mb-4 text-sm text-foreground">
                      You don&apos;t have a local account linked to this
                      account. Please sign in to confirm and to proceed with
                      deleting your account. Action cannot be undone.
                    </p>
                    <OAuthButton
                      oauthType="Google"
                      buttonText="Confirm with"
                      onClick={() => {
                        handleDeleteAccount({
                          password: undefined,
                          provider: "GOOGLE",
                        })();
                      }}
                      isLoading={isDeletingLocal || isDeletingOAuth}
                    />
                  </div>
                )}

                {hasLocalAccount && (
                  <FormProvider {...methods}>
                    <div className="flex flex-col h-full">
                      <p className="mb-4 text-sm text-foreground">
                        You have a local account linked to this account. Please
                        confirm your password to proceed with deleting your
                        account. Action cannot be undone.
                      </p>

                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        // onSubmit={handleSubmit(
                        //   (data) => {
                        //     console.log("VALID SUBMIT", data);
                        //   },
                        //   (errors) => {
                        //     console.log("FORM ERRORS", errors);
                        //   },
                        // )}
                        className="flex flex-col flex-1 justify-between gap-5"
                      >
                        <InputPassword
                          {...register("password")}
                          label="Password"
                          showPassword={currentPassword.visible}
                          setShowPassword={currentPassword.toggle}
                          error={errors.password?.message}
                          isRequired
                        />

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            className="w-full h-10"
                            onClick={handleCloseModal}
                            disabled={isDeletingLocal || isSubmitting}
                            variant="secondary"
                          >
                            Cancel
                          </Button>

                          <Button
                            type="submit"
                            variant="destructive"
                            className="w-full h-10"
                            disabled={isDeletingLocal || isSubmitting}
                          >
                            Delete Account
                            {isDeletingLocal && <LoadingSpinner />}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </FormProvider>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DeleteAccount;
