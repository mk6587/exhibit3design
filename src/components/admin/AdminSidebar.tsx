import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Crown,
  Users,
  Package,
  Sparkles,
  Settings,
  LogOut,
  FileText,
  Shield,
  MonitorPlay,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Newspaper,
  Image,
  Eraser,
  Mail,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdmin } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const menuStructure = [
  {
    title: "Main",
    icon: LayoutDashboard,
    children: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard, requiredRole: ['super_admin', 'operator'] },
      { title: "Products", url: "/admin/products", icon: Package, requiredRole: ['operator', 'content_creator'] },
      { title: "File Requests", url: "/admin/file-requests", icon: FileText, requiredRole: 'operator' },
      { title: "Career Applications", url: "/admin/career-applications", icon: Briefcase, requiredRole: ['super_admin', 'operator'] },
      { title: "Subscriptions", url: "/admin/subscriptions", icon: Crown, requiredRole: 'super_admin' },
      { title: "Users", url: "/admin/users", icon: Users, requiredRole: 'super_admin' },
    ],
    requiredRole: null
  },
  {
    title: "Blog Academy",
    icon: Newspaper,
    children: [
      { title: "Blog Generator", url: "/admin/blog-generator", icon: Sparkles, requiredRole: 'content_creator' },
      { title: "Blog Posts", url: "/admin/blog-posts", icon: FileText, requiredRole: 'content_creator' },
      { title: "Quick Generate", url: "/admin/blog-sample", icon: FileCheck, requiredRole: 'content_creator' },
      { title: "Generate Images", url: "/admin/generate-blog-images", icon: Image, requiredRole: 'content_creator' },
      { title: "Cleanup Content", url: "/admin/blog-cleanup", icon: Eraser, requiredRole: 'content_creator' },
      { title: "Categories", url: "/admin/blog-categories", icon: FileText, requiredRole: 'content_creator' },
      { title: "Settings", url: "/admin/blog-settings", icon: Settings, requiredRole: 'content_creator' },
    ],
    requiredRole: 'content_creator'
  },
  {
    title: "Settings",
    icon: Settings,
    children: [
      { title: "Plans", url: "/admin/plans", icon: Settings, requiredRole: 'super_admin' },
      { title: "AI Samples", url: "/admin/ai-samples", icon: Sparkles, requiredRole: 'super_admin' },
      { title: "AI Demo Config", url: "/admin/ai-demo-config", icon: MonitorPlay, requiredRole: 'super_admin' },
      { title: "Role Management", url: "/admin/roles", icon: Shield, requiredRole: 'super_admin' },
      { title: "Activity Log", url: "/admin/activity-log", icon: FileCheck, requiredRole: 'super_admin' },
      { title: "Security", url: "/admin/security", icon: Shield, requiredRole: 'super_admin' },
      { title: "Bulk Email", url: "/admin/bulk-email", icon: Mail, requiredRole: 'super_admin' },
    ],
    requiredRole: 'super_admin'
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout, hasPermission } = useAdmin();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // State to track which parent sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Initialize with the section that contains the current route open
    const initial: Record<string, boolean> = {};
    menuStructure.forEach(section => {
      const hasActiveChild = section.children.some(child => 
        child.url === currentPath || (child.url === "/admin" && currentPath === "/admin")
      );
      initial[section.title] = hasActiveChild || section.title === "Main";
    });
    return initial;
  });

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath === path;
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/20"
      : "hover:bg-muted/50";

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className={`p-4 border-b ${collapsed ? 'px-2' : ''}`}>
          {!collapsed ? (
            <h2 className="text-lg font-bold text-primary">Admin Panel</h2>
          ) : (
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
              <Settings className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {/* Hierarchical Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuStructure.map((section) => {
                // Filter children based on individual item permissions
                const visibleChildren = section.children.filter(item => {
                  if (!item.requiredRole) return true;
                  
                  // Handle array of roles
                  if (Array.isArray(item.requiredRole)) {
                    return item.requiredRole.some(role => hasPermission(role as any));
                  }
                  
                  return hasPermission(item.requiredRole as any);
                });

                // Don't show section if no children are visible
                if (visibleChildren.length === 0) {
                  return null;
                }
                
                const isOpen = openSections[section.title];
                const hasActiveChild = visibleChildren.some(child => isActive(child.url));

                return (
                  <Collapsible
                    key={section.title}
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.title)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`w-full justify-between ${
                            hasActiveChild ? 'bg-primary/5 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <section.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
                            {!collapsed && <span>{section.title}</span>}
                          </div>
                          {!collapsed && (
                            isOpen ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <SidebarMenu className="ml-4 border-l border-border">
                          {visibleChildren.map((item) => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton asChild>
                                <NavLink 
                                  to={item.url} 
                                  end={item.url === "/admin"}
                                  className={getNavCls}
                                >
                                  <item.icon className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
                                  {!collapsed && <span>{item.title}</span>}
                                </NavLink>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
