import {
  FormProvider,
  UseFormReturn,
  FieldValues,
  SubmitHandler,
} from "react-hook-form";

type FormWrapperProps<T extends FieldValues = FieldValues> = {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  className?: string;
  children: React.ReactNode;
};

const FormWrapper = <T extends FieldValues>({
  methods,
  onSubmit,
  className,
  children,
}: FormWrapperProps<T>) => (
  <FormProvider {...methods}>
    <form
      onSubmit={methods.handleSubmit(onSubmit)}
      //   onSubmit={methods.handleSubmit(
      //     (data) => {
      //       console.log("VALID SUBMIT", data);
      //     },
      //     (errors) => {
      //       console.log("FORM ERRORS", errors);
      //     },
      //   )}
      className={className}
    >
      {children}
    </form>
  </FormProvider>
);

export default FormWrapper;
