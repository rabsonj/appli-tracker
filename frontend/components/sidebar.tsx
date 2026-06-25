"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader
} from "@/components/ui/sidebar"
import { ListChecks } from "lucide-react"


export function AppSidebar({
  navItems,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  navItems?: { title: string; url: string }[];
}) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <ListChecks className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Appli Tracker</span>
            <span className="font-light text-xs">Create and Track Applications</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-5 px-1">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/")

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.url}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
