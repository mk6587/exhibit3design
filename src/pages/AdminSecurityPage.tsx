import { AdminLayout } from "@/components/admin/AdminLayout";
import { IPWhitelistManagement } from "@/components/admin/IPWhitelistManagement";

export default function AdminSecurityPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage admin access controls and security features
          </p>
        </div>

        <IPWhitelistManagement />
      </div>
    </AdminLayout>
  );
}
