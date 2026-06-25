import AppLayout from "@/components/app-layout";

/**
 * Renders the layout for the applicant pages.
 * @param children - The children to render.
 * @returns The applicant layout.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout
      navItems={[
        {
          title: "My Applications",
          url: "/applications",
        },
      ]}
      breadcrumb="My Applications"
    >
      {children}
    </AppLayout>
  );
}
