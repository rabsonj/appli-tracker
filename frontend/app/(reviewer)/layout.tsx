import AppLayout from "@/components/app-layout"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout navItems={[
        {
          title: "Applications",
          url: "/queue",
        },
      ]}
      breadcrumb='Applications'
    >
      {children}
    </AppLayout>
  )
}
