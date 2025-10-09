import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersManagement } from "@/components/admin/UsersManagement";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <UsersManagement />
      </div>
    </AdminLayout>
  );
}
