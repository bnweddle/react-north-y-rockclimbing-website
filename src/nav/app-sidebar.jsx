import { navItems } from "@/nav/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupContent>

            <SidebarMenu>

              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>

                    <SidebarMenuButton
                    isActive={
                      window.location.pathname === item.url ||
                      (item.url === "/routes" && window.location.pathname.startsWith("/routes/"))
                    }
                    render={<a href={item.url} />}
                    >
                    <item.icon />
                    <span>{item.title}</span>
                    </SidebarMenuButton>

                </SidebarMenuItem>
              ))}

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}