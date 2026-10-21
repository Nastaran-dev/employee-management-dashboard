import { useState } from 'react';
import { Plus, SearchX, Users } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '../api/errors';
import { EmployeeFormDialog, type FormDialogState } from '../components/EmployeeFormDialog';
import { EmployeePagination } from '../components/EmployeePagination';
import { EmployeeTable } from '../components/EmployeeTable';
import { EmployeeTableSkeleton } from '../components/EmployeeTableSkeleton';
import { EmployeeToolbar } from '../components/EmployeeToolbar';
import { StatsCards } from '../components/StatsCards';
import { useEmployeeTableState } from '../hooks/useEmployeeTableState';
import { useEmployeesQuery } from '../hooks/useEmployees';
import { filterEmployees } from '../utils/filterEmployees';
import { paginate } from '../utils/paginate';
import { sortEmployees } from '../utils/sortEmployees';
import { getEmployeeStats } from '../utils/stats';

function formatResultCount(matching: number, total: number, isFiltered: boolean): string {
  const noun = total === 1 ? 'employee' : 'employees';
  return isFiltered ? `${matching} of ${total} ${noun}` : `${total} ${noun}`;
}

export function EmployeesPage() {
  const query = useEmployeesQuery();
  const table = useEmployeeTableState();
  const [dialog, setDialog] = useState<FormDialogState>({ mode: 'closed' });


  const employees = query.data;
  const stats = employees ? getEmployeeStats(employees) : undefined;
  const matching = employees ? sortEmployees(filterEmployees(employees, table.filters), table.sort) : [];
  const page = paginate(matching, table.page, table.pageSize);

  const closeDialog = () => setDialog({ mode: 'closed' });
  const openCreate = () => setDialog({ mode: 'create' });

  const addButton = (

    <Button onClick={openCreate} disabled={!employees}>
      <Plus aria-hidden="true" className="h-4 w-4" />
      Add employee
    </Button>
  );

  function renderBody() {
    if (query.isPending) return <EmployeeTableSkeleton />;

    if (!employees) {
      return (
        <ErrorState
          title="We couldn’t load employees"
          description={getErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      );
    }

    if (employees.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="Add your first employee to start building the directory."
          action={
            <Button onClick={openCreate}>
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add employee
            </Button>
          }
        />
      );
    }

    if (page.totalItems === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No employees match your filters"
          description="Try a different name or email, or remove a filter."
          action={
            <Button variant="outline" onClick={table.clearFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }

    return (
      <EmployeeTable
        employees={page.items}
        sort={table.sort}
        onSortChange={table.toggleSort}
        onEdit={(employee) => setDialog({ mode: 'edit', employee })}
      />
    );
  }

  return (
    <AppShell title="Employees" actions={addButton}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Team directory</h1>
          <p className="mt-1 text-sm text-muted">Search, filter and update the people in your organization.</p>
        </div>

        <StatsCards stats={stats} isLoading={query.isPending} />

        <section aria-label="Employees" className="rounded-lg border border-line bg-surface">
          <div className="border-b border-line p-4">
            <EmployeeToolbar
              filters={table.filters}
              hasActiveFilters={table.hasActiveFilters}
              disabled={!employees}
              onFiltersChange={table.updateFilters}
              onClear={table.clearFilters}
            />
          </div>

          {employees && query.isError ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-status-leave-bg px-4 py-2.5 text-sm text-status-leave">
              <span>We couldn’t refresh the list. You’re seeing the last loaded data.</span>
              <Button size="sm" variant="outline" onClick={() => void query.refetch()} disabled={query.isFetching}>
                Try again
              </Button>
            </div>
          ) : null}

          {employees && employees.length > 0 ? (
            <p role="status" className="border-b border-line px-4 py-2.5 text-sm text-muted">
              {formatResultCount(page.totalItems, employees.length, table.hasActiveFilters)}
            </p>
          ) : null}

          {renderBody()}

          {employees && page.totalItems > 0 ? (
            <EmployeePagination page={page} onPageChange={table.setPage} onPageSizeChange={table.changePageSize} />
          ) : null}
        </section>
      </div>

      <EmployeeFormDialog state={dialog} employees={employees ?? []} onClose={closeDialog} />
    </AppShell>
  );
}
