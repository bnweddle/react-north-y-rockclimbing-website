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
    <Sidebar collapsible="icon" className="app-sidebar">
      <SidebarContent>
        <div className="sidebar-brand">
          <img src="/climbing-logo.svg" alt="" />
          <div className="sidebar-brand-text">
            <span style={{ fontFamily: "BiotripCapsBold" }}>North Y</span>
            <strong style={{ fontFamily: "BiotripCapsBold" }}>Rock Climbing</strong>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>

            <SidebarMenu>

              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>

                    <SidebarMenuButton
                    className="app-sidebar-link"
                    data-nav-color={item.color}
                    isActive={
                      window.location.pathname === item.url ||
                      (item.url === "/routes" && window.location.pathname.startsWith("/routes/"))
                    }
                    render={<a href={item.url} />}
                    >
                    <item.icon />
                    <span style={{ fontFamily: "BiotripCapsBold" }}>{item.title}</span>
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