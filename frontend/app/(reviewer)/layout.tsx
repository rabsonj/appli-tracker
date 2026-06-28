import AppLayout from '@/components/app-layout';

/**
 * Renders the layout for the reviewer pages.
 * @param children - The children to render.
 * @returns The reviewer layout.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      breadcrumb="Applications"
      navDescription="Review and Manage Applications"
      navItems={[
        {
          title: 'Applications',
          url: '/queue',
        },
      ]}
    >
      {children}
    </AppLayout>
  );
}
