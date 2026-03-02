import { useAppDispatch } from "./useRedux";
import { setTextFieldRequired } from "@/store/slices/globalSlice";

const useTextFieldHooks = () => {
  const dispatch = useAppDispatch();

  const handleClearError = () => dispatch(setTextFieldRequired({}));

  const validateField = (id: string, value: string) => {
    if (!value) {
      dispatch(
        setTextFieldRequired({
          [id]: `${id.charAt(0).toUpperCase() + id.slice(1)} is required.`,
        }),
      );
      return false;
    }

    dispatch(
      setTextFieldRequired({
        [id]: "",
      }),
    );

    return true;
  };

  const handleValidateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { id, value } = e.target;
    validateField(id, value);
  };

  return {
    handleClearError,
    validateField,
    handleValidateInputChange,
  };
};

export default useTextFieldHooks;
