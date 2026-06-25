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
      breadcrumb="Applications"
    >
      {children}
    </AppLayout>
  );
}
