import AppLayout from "@/components/app-layout";

/**
 * Renders the layout for the reviewer pages.
 * @param children - The children to render.
 * @returns The reviewer layout.
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
          title: "Applications",
          url: "/queue",
        },
      ]}
      navDescription="Review and Manage Applications"
      breadcrumb="Applications"
    >
      {children}
    </AppLayout>
  );
}
