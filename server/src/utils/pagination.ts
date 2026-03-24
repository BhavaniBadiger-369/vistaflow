export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export const getPagination = (page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE) => {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
    take: safePageSize,
  };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  pageSize: number,
) => ({
  page,
  pageSize,
  total,
  pageCount: Math.max(Math.ceil(total / pageSize), 1),
});

export const calculateCompletion = (doneCount: number, totalCount: number) =>
  totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);
