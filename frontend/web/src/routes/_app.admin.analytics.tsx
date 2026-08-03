import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/analytics')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/settings' });
  },
  component: () => null,
});
