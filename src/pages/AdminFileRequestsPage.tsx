import { AdminLayout } from "@/components/admin/AdminLayout";
import { FileRequestsManagement } from "@/components/admin/FileRequestsManagement";

export default function AdminFileRequestsPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">File Requests</h1>
          <p className="text-muted-foreground">
            Manage user design file requests and uploads
          </p>
        </div>

        <FileRequestsManagement />
      </div>
    </AdminLayout>
  );
}
