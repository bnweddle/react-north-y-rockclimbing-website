import {
  BottomNavigation,
  BottomNavigationItem,
  BottomNavigationItemIcon,
  BottomNavigationItemLabel,
  BottomNavigationList,
} from "@/components/ui/bottom-navigation"

import { navItems } from "@/nav/navigation"

export function MobileBottomNav({ currentPath }) {
  return (
    <BottomNavigation
      value={currentPath}
      activationMode="manual"
      onValueChange={({ value }) => {
        if (value !== currentPath) window.location.assign(value)
      }}
    >
      
      <BottomNavigationList>

        {navItems.map((item) => (
          <BottomNavigationItem
            key={item.url}
            value={item.url}
          >

            <BottomNavigationItemIcon>
              <item.icon />
            </BottomNavigationItemIcon>

            <BottomNavigationItemLabel>
              {item.title}
            </BottomNavigationItemLabel>

          </BottomNavigationItem>
        ))}

      </BottomNavigationList>

    </BottomNavigation>
  )
}