import { Calendar, ClipboardPen, Clock, Search, Settings } from "lucide-react"
import { SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, Sidebar } from "~/components/ui/sidebar"



// Menu items.
const items = [
  {
    title: "Pencatatan",
    url: "#",
    icon: ClipboardPen,
    submenus: [
      {
        title: "Kedatangan Susu",
        url: "/kedatangan",
      },
      {
        title: "Perebusan Manual",
        url: "/manual",
      },
      {
        title: "Hasil Perebusan",
        url: "/hasilperebusan",
      },
      {
        title: "Grinding",
        url: "/grinding",
      },{
        title: "Penimbangan Akhir",
        url: "/penimbanganakhir",
      }
    ]
  },
  {
    title: "Performance",
    url: "/performance",
    icon: Clock,
  },
  {
    title: "Monitoring",
    url: "/monitoring",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]


export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  {
                    <SidebarMenuSub>
                      {
                        item.submenus?.map(
                          (subitem) => (
                            <SidebarMenuSubItem key={subitem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subitem.url}>
                                  <span>{subitem.title}</span>
                                </a>

                              </SidebarMenuSubButton>

                            </SidebarMenuSubItem>
                          )
                        )
                      }
                    </SidebarMenuSub>

                  }

                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
