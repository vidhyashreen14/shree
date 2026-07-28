import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/superadmin/audit')({
  beforeLoad: () => {
    throw redirect({ to: '/superadmin/hospitals' });
  },
  component: () => null,
});
