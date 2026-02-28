import { useAppDispatch, useAppSelector } from "./useRedux";
import { setTextFieldRequired } from "@/store/slices/globalSlice";

const useGlobalHooks = () => {
  const dispatch = useAppDispatch();

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

  return {
    validateField,
  };
};

export default useGlobalHooks;
