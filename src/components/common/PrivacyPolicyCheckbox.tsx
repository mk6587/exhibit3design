import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

interface PrivacyPolicyCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
}

const PrivacyPolicyCheckbox = ({
  checked,
  onCheckedChange,
  id = "privacy-policy-agreement",
  className = "",
}: PrivacyPolicyCheckboxProps) => {
  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={(value) => onCheckedChange(value as boolean)}
      />
      <label 
        htmlFor={id} 
        className="text-sm text-muted-foreground leading-tight cursor-pointer"
      >
        I have read and agree to the{" "}
        <Link 
          to="/privacy-policy" 
          className="text-primary hover:underline" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Privacy Policy
        </Link>
      </label>
    </div>
  );
};

export default PrivacyPolicyCheckbox;