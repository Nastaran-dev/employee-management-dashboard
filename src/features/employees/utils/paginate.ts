export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  from: number;
  to: number;
}


export function paginate<T>(items: readonly T[], requestedPage: number, pageSize: number): Page<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    items: pageItems,
    page,
    pageSize,
    totalItems,
    totalPages,
    from: totalItems === 0 ? 0 : start + 1,
    to: totalItems === 0 ? 0 : start + pageItems.length,
  };
}
