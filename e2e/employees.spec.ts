import { expect, test } from '@playwright/test';

test.describe('Employee directory', () => {
  test('add, search and edit an employee', async ({ page }) => {
    await page.goto('/?latency=0');
    await expect(page.getByRole('heading', { name: 'Team directory' })).toBeVisible();
    await expect(page.getByText('20 employees')).toBeVisible();

    
    await page.getByRole('button', { name: 'Add employee' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('First name', { exact: true }).fill('Jamie');
    await dialog.getByLabel('Last name', { exact: true }).fill('Rivera');
    await dialog.getByLabel('Email', { exact: true }).fill('jamie.rivera@roster.example');
    await dialog.getByLabel('Department', { exact: true }).selectOption('Finance');
    await dialog.getByRole('button', { name: 'Add employee' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('21 employees')).toBeVisible();

    
    await page.getByRole('searchbox', { name: 'Search employees' }).fill('jamie');
    await expect(page.getByText('1 of 21 employees')).toBeVisible();
    await expect(page.getByText('Jamie Rivera')).toBeVisible();

    
    await page.getByRole('button', { name: 'Edit Jamie Rivera' }).click();
    await dialog.getByLabel('Last name', { exact: true }).fill('Rivers');
    await dialog.getByLabel('Status', { exact: true }).selectOption('On Leave');
    await dialog.getByRole('button', { name: 'Save changes' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Jamie Rivers')).toBeVisible();

  
    await page.reload();
    await page.getByRole('searchbox', { name: 'Search employees' }).fill('rivers');
    await expect(page.getByText('Jamie Rivers')).toBeVisible();
  });

  test('shows an error state with a retry action when loading fails', async ({ page }) => {
    await page.goto('/?latency=0&simulate=list');
    // The query client retries once automatically before surfacing the error.
    await expect(page.getByText('We couldn’t load employees')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add employee' })).toBeDisabled();
  });
});
