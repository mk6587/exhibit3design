import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LayoutDashboard, Crown, Users } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your business operations and monitor key metrics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats />
          </TabsContent>

          <TabsContent value="subscriptions">
            <SubscriptionsManagement />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
