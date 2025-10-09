import { AdminLayout } from "@/components/admin/AdminLayout";
import { SubscriptionsManagement } from "@/components/admin/SubscriptionsManagement";

export default function AdminSubscriptionsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <SubscriptionsManagement />
      </div>
    </AdminLayout>
  );
}
