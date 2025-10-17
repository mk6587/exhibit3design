import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Coins, Crown, UserX, UserCheck, Activity } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { AdjustTokensDialog } from "./AdjustTokensDialog";
import { ChangeSubscriptionDialog } from "./ChangeSubscriptionDialog";
import { ToggleUserStatusDialog } from "./ToggleUserStatusDialog";
import { UserActivityDialog } from "./UserActivityDialog";

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  ai_tokens_balance: number;
  video_results_balance: number;
  created_at: string;
  has_subscription: boolean;
  is_active?: boolean;
}

interface UserActionsMenuProps {
  user: UserData;
  onUpdate: () => void;
}

export function UserActionsMenu({ user, onUpdate }: UserActionsMenuProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tokensDialogOpen, setTokensDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>User Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Info
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setTokensDialogOpen(true)}>
            <Coins className="mr-2 h-4 w-4" />
            Adjust Tokens
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setSubscriptionDialogOpen(true)}>
            <Crown className="mr-2 h-4 w-4" />
            Change Plan
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setActivityDialogOpen(true)}>
            <Activity className="mr-2 h-4 w-4" />
            View Activity
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setStatusDialogOpen(true)}
            className={user.is_active !== false ? "text-destructive" : "text-green-600"}
          >
            {user.is_active !== false ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate User
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate User
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
        onUpdate={onUpdate}
      />

      <AdjustTokensDialog
        open={tokensDialogOpen}
        onOpenChange={setTokensDialogOpen}
        user={user}
        onUpdate={onUpdate}
      />

      <ChangeSubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        user={user}
        onUpdate={onUpdate}
      />

      <ToggleUserStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        user={user}
        onUpdate={onUpdate}
      />

      <UserActivityDialog
        open={activityDialogOpen}
        onOpenChange={setActivityDialogOpen}
        userId={user.user_id}
      />
    </>
  );
}
