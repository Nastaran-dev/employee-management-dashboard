import type { Department, Employee, EmploymentStatus } from '@/features/employees/types/employee';

function seed(
  number: number,
  firstName: string,
  lastName: string,
  department: Department,
  status: EmploymentStatus,
  joined: string,
): Employee {
  const email = `${firstName}.${lastName}@roster.example`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  const timestamp = `${joined}T09:00:00.000Z`;

  return {
    id: `emp-${String(number).padStart(3, '0')}`,
    firstName,
    lastName,
    email,
    department,
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** 20 employees: 13 active, 4 on leave, 3 inactive across all six departments. */
export const SEED_EMPLOYEES: readonly Employee[] = [
  seed(1, 'Amelia', 'Hart', 'Engineering', 'Active', '2021-03-08'),
  seed(2, 'Daniel', 'Okafor', 'Engineering', 'Active', '2021-09-20'),
  seed(3, 'Priya', 'Raman', 'Engineering', 'On Leave', '2022-01-17'),
  seed(4, 'Lucas', 'Meyer', 'Engineering', 'Active', '2023-05-02'),
  seed(5, 'Hannah', 'Weiss', 'Human Resources', 'Active', '2020-11-09'),
  seed(6, 'Omar', 'Haddad', 'Human Resources', 'Inactive', '2019-06-24'),
  seed(7, 'Chloe', 'Dubois', 'Marketing', 'Active', '2022-04-11'),
  seed(8, 'Mateo', 'Silva', 'Marketing', 'On Leave', '2022-08-29'),
  seed(9, 'Yuki', 'Tanaka', 'Marketing', 'Active', '2023-02-13'),
  seed(10, 'Elena', 'Petrova', 'Finance', 'Active', '2020-02-03'),
  seed(11, 'Samuel', 'Brooks', 'Finance', 'Active', '2021-12-06'),
  seed(12, 'Aisha', 'Khan', 'Finance', 'Inactive', '2018-10-15'),
  seed(13, 'Jonas', 'Lindqvist', 'Sales', 'Active', '2022-07-04'),
  seed(14, 'Isabella', 'Rossi', 'Sales', 'Active', '2023-01-23'),
  seed(15, 'Kwame', 'Mensah', 'Sales', 'On Leave', '2021-05-31'),
  seed(16, 'Nora', 'Fischer', 'Sales', 'Inactive', '2019-09-02'),
  seed(17, 'Tomás', 'Herrera', 'Operations', 'Active', '2020-08-17'),
  seed(18, 'Leila', 'Aziz', 'Operations', 'Active', '2022-10-10'),
  seed(19, 'Ben', 'Carter', 'Operations', 'On Leave', '2023-03-27'),
  seed(20, 'Mei Lin', 'Zhang', 'Operations', 'Active', '2024-01-15'),
];
