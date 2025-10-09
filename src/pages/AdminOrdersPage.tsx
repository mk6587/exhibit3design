import { AdminLayout } from "@/components/admin/AdminLayout";
import { RecentOrders } from "@/components/admin/RecentOrders";

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <RecentOrders />
      </div>
    </AdminLayout>
  );
}
