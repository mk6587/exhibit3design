import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ApplicationStatus = "pending" | "reviewed" | "rejected" | "accepted";

interface Application {
  id: string;
  user_id: string;
  job_slug: string;
  full_name: string;
  email: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  portfolio_url_2: string | null;
  cover_note: string | null;
  resume_url: string;
  status: ApplicationStatus;
  admin_notes: string | null;
  token_usage_snapshot: number;
  created_at: string;
  updated_at: string;
}

export function CareerApplicationsManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["career-applications", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Application[];
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: ApplicationStatus;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("career_applications")
        .update({
          status,
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-applications"] });
      toast.success("Application updated successfully");
      setDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update application");
    },
  });

  const handleDownloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(resumeUrl.replace("resumes/", ""));

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${applicantName.replace(/\s+/g, "_")}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Resume downloaded");
    } catch (error) {
      toast.error("Failed to download resume");
      console.error("Download error:", error);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setAdminNotes(application.admin_notes || "");
    setDialogOpen(true);
  };

  const handleUpdateApplication = () => {
    if (!selectedApplication) return;

    updateApplicationMutation.mutate({
      id: selectedApplication.id,
      status: newStatus,
      notes: adminNotes,
    });
  };

  const getStatusColor = (status: ApplicationStatus) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      accepted: "bg-green-500/10 text-green-500 border-green-500/20",
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Career Applications</h2>
          <p className="text-muted-foreground">Manage job applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading applications...</div>
      ) : applications && applications.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Tokens Used</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">{application.full_name}</TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell className="capitalize">
                    {application.job_slug.replace(/-/g, " ")}
                  </TableCell>
                  <TableCell>{application.token_usage_snapshot}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(application.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(application)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResume(application.resume_url, application.full_name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No applications found</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground">{selectedApplication.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedApplication.job_slug.replace(/-/g, " ")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tokens Used</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplication.token_usage_snapshot}
                  </p>
                </div>
              </div>

              {selectedApplication.linkedin_url && (
                <div>
                  <label className="text-sm font-medium">LinkedIn</label>
                  <a
                    href={selectedApplication.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    {selectedApplication.linkedin_url}
                  </a>
                </div>
              )}

              {selectedApplication.portfolio_url && (
                <div>
                  <label className="text-sm font-medium">Portfolio</label>
                  <a
                    href={selectedApplication.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    {selectedApplication.portfolio_url}
                  </a>
                </div>
              )}

              {selectedApplication.portfolio_url_2 && (
                <div>
                  <label className="text-sm font-medium">Additional Portfolio</label>
                  <a
                    href={selectedApplication.portfolio_url_2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block"
                  >
                    {selectedApplication.portfolio_url_2}
                  </a>
                </div>
              )}

              {selectedApplication.cover_note && (
                <div>
                  <label className="text-sm font-medium">Cover Note</label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.cover_note}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium block mb-2">Update Status</label>
                <Select value={newStatus} onValueChange={(value: ApplicationStatus) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this application..."
                  rows={4}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Applied: {format(new Date(selectedApplication.created_at), "PPpp")}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateApplication} disabled={updateApplicationMutation.isPending}>
              {updateApplicationMutation.isPending ? "Updating..." : "Update Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
