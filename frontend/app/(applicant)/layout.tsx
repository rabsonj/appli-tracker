import AppLayout from '@/components/app-layout';

/**
 * Renders the layout for the applicant pages.
 * @param children - The children to render.
 * @returns The applicant layout.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      breadcrumb="My Applications"
      navItems={[
        {
          title: 'My Applications',
          url: '/applications',
        },
      ]}
    >
      {children}
    </AppLayout>
  );
}
