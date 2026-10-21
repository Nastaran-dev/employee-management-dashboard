import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { PAGE_SIZE_OPTIONS, toPageSize, type PageSize } from '../types/table';
import type { Page } from '../utils/paginate';

interface EmployeePaginationProps {
  page: Page<unknown>;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export function EmployeePagination({ page, onPageChange, onPageSizeChange }: EmployeePaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="rows-per-page" className="text-sm text-muted">
          Rows per page
        </label>
        <Select
          id="rows-per-page"
          wrapperClassName="w-[4.75rem]"
          value={page.pageSize}
          onChange={(event) => {
            const size = toPageSize(Number(event.target.value));
            if (size) onPageSizeChange(size);
          }}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="text-sm text-muted">{`${page.from}–${page.to} of ${page.totalItems}`}</p>
        {page.totalPages > 1 ? (
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous page"
              disabled={page.page <= 1}
              onClick={() => onPageChange(page.page - 1)}
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </Button>
            <span className="min-w-20 text-center text-sm text-ink">{`Page ${page.page} of ${page.totalPages}`}</span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next page"
              disabled={page.page >= page.totalPages}
              onClick={() => onPageChange(page.page + 1)}
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
