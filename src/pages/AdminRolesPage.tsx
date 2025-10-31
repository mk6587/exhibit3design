import { AdminLayout } from "@/components/admin/AdminLayout";
import { RoleManagement } from "@/components/admin/RoleManagement";

export default function AdminRolesPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <RoleManagement />
      </div>
    </AdminLayout>
  );
}
