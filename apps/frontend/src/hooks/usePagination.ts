import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setJobQuery } from "@/store/slices/jobSlice";
import { setPage } from "@/store/slices/paginationSlice";
import { selectPagination } from "@/store/selectors";

interface PaginationState {
  pages: Record<string, { page: number }>;
  sort?: string;
}

const usePaginationHooks = () => {
  const dispatch = useAppDispatch();
  const { pages } = useAppSelector(selectPagination);

  const onPaginationAction = ({ pages, sort }: PaginationState) => {
    const [[key, value]] = Object.entries(pages);
    const nextPage = value.page;
    dispatch(setPage({ key, value: nextPage }));
    dispatch(
      setJobQuery({
        key,
        data: {
          page: nextPage || 1,
          sort,
        },
      }),
    );
  };

  return {
    pages,
    onPaginationAction,
  };
};

export default usePaginationHooks;
