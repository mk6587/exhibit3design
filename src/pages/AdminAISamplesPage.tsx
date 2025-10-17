import { AdminLayout } from "@/components/admin/AdminLayout";
import { AISamplesManagement } from "@/components/admin/AISamplesManagement";

export default function AdminAISamplesPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <AISamplesManagement />
      </div>
    </AdminLayout>
  );
}
