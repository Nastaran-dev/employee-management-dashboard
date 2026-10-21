import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { EmployeeApi } from '../api';
import { buildManyEmployees } from '@/test/fixtures';
import { createTestApi, renderWithProviders } from '@/test/renderWithProviders';
import { EmployeesPage } from './EmployeesPage';

async function renderLoaded(api: EmployeeApi = createTestApi()) {
  const utils = renderWithProviders(<EmployeesPage />, api);
  await screen.findByText('Ada Lovelace');
  return utils;
}

async function openCreateDialog(user: ReturnType<typeof renderWithProviders>['user']) {
  await user.click(screen.getByRole('button', { name: 'Add employee' }));
  return screen.findByRole('dialog');
}

describe('EmployeesPage: loading, empty and error states', () => {
  it('shows a loading skeleton while the request is pending', () => {
    const pendingApi: EmployeeApi = {
      list: () => new Promise(() => undefined),
      create: () => new Promise(() => undefined),
      update: () => new Promise(() => undefined),
    };
    renderWithProviders(<EmployeesPage />, pendingApi);

    expect(screen.getByText('Loading employees')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add employee' })).toBeDisabled();
  });

  it('shows an empty state when there are no employees', async () => {
    renderWithProviders(<EmployeesPage />, createTestApi({ seed: [] }));

    expect(await screen.findByText('No employees yet')).toBeInTheDocument();
  });

  it('shows an error state and recovers with retry', async () => {
    const { user } = renderWithProviders(<EmployeesPage />, createTestApi({ failures: { list: 1 } }));

    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText('We couldn’t load employees')).toBeInTheDocument();

    await user.click(within(alert).getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('EmployeesPage: list and summary', () => {
  it('renders every employee and stats derived from the data', async () => {
    await renderLoaded();

    expect(screen.getAllByRole('row')).toHaveLength(8); // header + 7
    expect(screen.getByText('7 employees')).toBeInTheDocument();

    const summary = screen.getByRole('region', { name: 'Employee summary' });
    expect(within(summary).getByText('Total employees').nextElementSibling).toHaveTextContent('7');
    expect(within(summary).getByText('Active').nextElementSibling).toHaveTextContent('4');
    expect(within(summary).getByText('On leave').nextElementSibling).toHaveTextContent('2');
    expect(within(summary).getByText('Inactive').nextElementSibling).toHaveTextContent('1');
  });
});

describe('EmployeesPage: search and filters', () => {
  it('searches by name', async () => {
    const { user } = await renderLoaded();

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'lovelace');

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
    expect(screen.getByText('1 of 7 employees')).toBeInTheDocument();
  });

  it('searches by email', async () => {
    const { user } = await renderLoaded();

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'NOAH@example');

    expect(screen.getByText('Noah Kim')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });

  it('filters by department and by status, and combines them', async () => {
    const { user } = await renderLoaded();

    await user.selectOptions(screen.getByLabelText('Filter by department'), 'Engineering');
    expect(screen.getByText('2 of 7 employees')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'On Leave');
    expect(screen.getByText('1 of 7 employees')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
  });

  it('clears all filters', async () => {
    const { user } = await renderLoaded();
    const clear = screen.getByRole('button', { name: 'Clear filters' });
    expect(clear).toBeDisabled();

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'ada');
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'Active');
    expect(clear).toBeEnabled();

    await user.click(clear);

    expect(screen.getByText('7 employees')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search employees' })).toHaveValue('');
    expect(screen.getByLabelText('Filter by status')).toHaveValue('all');
  });

  it('shows a helpful empty state when nothing matches and lets you reset', async () => {
    const { user } = await renderLoaded();

    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'zzzzz');
    expect(await screen.findByText('No employees match your filters')).toBeInTheDocument();

  
    const clearButtons = screen.getAllByRole('button', { name: 'Clear filters' });
    expect(clearButtons).toHaveLength(2);
    await user.click(clearButtons[1]);
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  });
});

describe('EmployeesPage: sorting and pagination', () => {
  it('sorts by a column when its header is clicked', async () => {
    const { user } = await renderLoaded();

    const names = () => screen.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0]?.textContent);
    expect(names()[0]).toContain('Liam Chen');

    await user.click(screen.getByRole('button', { name: 'Employee' }));
    expect(names()[0]).toContain('Sofia Rossi');
  });

  it('paginates and returns to page 1 when the result set changes', async () => {
    const { user } = renderWithProviders(<EmployeesPage />, createTestApi({ seed: buildManyEmployees(12) }));
    await screen.findByText('Test User 01');

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(screen.queryByText('Test User 01')).not.toBeInTheDocument();

    
    await user.type(screen.getByRole('searchbox', { name: 'Search employees' }), 'user 1');

    expect(screen.getByText('Test User 01')).toBeInTheDocument();
    expect(screen.queryByText(/Page \d+ of/)).not.toBeInTheDocument();
  });

  it('changes the page size', async () => {
    const { user } = renderWithProviders(<EmployeesPage />, createTestApi({ seed: buildManyEmployees(12) }));
    await screen.findByText('Test User 01');

    await user.selectOptions(screen.getByLabelText('Rows per page'), '20');

    expect(screen.getAllByRole('row')).toHaveLength(13);
    expect(screen.queryByText(/Page \d+ of/)).not.toBeInTheDocument();
  });
});

describe('EmployeesPage: create', () => {
  it('shows validation errors for required fields and an invalid email', async () => {
    const { user } = await renderLoaded();
    const dialog = await openCreateDialog(user);

    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));

    expect(await within(dialog).findByText('First name is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Last name is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Email is required')).toBeInTheDocument();
    expect(within(dialog).getByText('Select a department')).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText('Email'), 'not-an-email');
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));

    expect(await within(dialog).findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('creates an employee, closes the dialog and shows the new row', async () => {
    const { user } = await renderLoaded();
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText('First name'), '  Jamie ');
    await user.type(within(dialog).getByLabelText('Last name'), 'Rivera');
    await user.type(within(dialog).getByLabelText('Email'), 'jamie@example.com');
    await user.selectOptions(within(dialog).getByLabelText('Department'), 'Finance');
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Jamie Rivera')).toBeInTheDocument();
    expect(screen.getByText('8 employees')).toBeInTheDocument();
    expect(await screen.findByText('Employee added')).toBeInTheDocument();
  });

  it('prevents a duplicate email, ignoring case', async () => {
    const { user } = await renderLoaded();
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText('First name'), 'Jamie');
    await user.type(within(dialog).getByLabelText('Last name'), 'Rivera');
    await user.type(within(dialog).getByLabelText('Email'), 'ADA@Example.com');
    await user.selectOptions(within(dialog).getByLabelText('Department'), 'Finance');
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));

    expect(await within(dialog).findByText('Another employee already uses this email address')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('7 employees')).toBeInTheDocument();
  });

  it('keeps the dialog open and reports an error when the request fails', async () => {
    const { user } = await renderLoaded(createTestApi({ failures: { create: 1 } }));
    const dialog = await openCreateDialog(user);

    await user.type(within(dialog).getByLabelText('First name'), 'Jamie');
    await user.type(within(dialog).getByLabelText('Last name'), 'Rivera');
    await user.type(within(dialog).getByLabelText('Email'), 'jamie@example.com');
    await user.selectOptions(within(dialog).getByLabelText('Department'), 'Finance');
    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));

    expect(await screen.findByText('Couldn’t add employee')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('First name')).toHaveValue('Jamie');


    await user.click(within(dialog).getByRole('button', { name: 'Add employee' }));
    expect(await screen.findByText('Jamie Rivera')).toBeInTheDocument();
  });
});

describe('EmployeesPage: edit', () => {
  it('prefills the form, saves changes and keeps the same employee', async () => {
    const { user } = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByLabelText('First name')).toHaveValue('Ada');
    expect(within(dialog).getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(within(dialog).getByLabelText('Department')).toHaveValue('Engineering');

    const lastName = within(dialog).getByLabelText('Last name');
    await user.clear(lastName);
    await user.type(lastName, 'King');
    await user.selectOptions(within(dialog).getByLabelText('Status'), 'On Leave');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('Ada King')).toBeInTheDocument();
    expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    expect(screen.getByText('7 employees')).toBeInTheDocument();
    expect(await screen.findByText('Changes saved')).toBeInTheDocument();
  });

  it('allows keeping the same email but blocks another employee’s email', async () => {
    const { user } = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    const dialog = await screen.findByRole('dialog');

    const email = within(dialog).getByLabelText('Email');
    await user.clear(email);
    await user.type(email, 'GRACE@example.com');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await within(dialog).findByText('Another employee already uses this email address')).toBeInTheDocument();
  });

  it('does not leak values between edit and create', async () => {
    const { user } = await renderLoaded();

    await user.click(screen.getByRole('button', { name: 'Edit Ada Lovelace' }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const dialog = await openCreateDialog(user);
    expect(within(dialog).getByLabelText('First name')).toHaveValue('');
    expect(within(dialog).getByLabelText('Email')).toHaveValue('');
  });
});
