import { AdminLayout } from "@/components/admin/AdminLayout";
import { CareerApplicationsManagement } from "@/components/admin/CareerApplicationsManagement";

export default function AdminCareerApplicationsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <CareerApplicationsManagement />
      </div>
    </AdminLayout>
  );
}
