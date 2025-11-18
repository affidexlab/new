import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

interface GeoBlockModalProps {
  open: boolean;
  country?: string;
}

export function GeoBlockModal({ open, country }: GeoBlockModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-2xl">
            Access Restricted
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {country ? (
              <>
                DeFiSwap is not available in your region ({country}).
                <br />
                <br />
                The protocol is currently restricted for users in the United States
                and certain other jurisdictions due to regulatory compliance requirements.
              </>
            ) : (
              <>
                DeFiSwap is not available in your region.
                <br />
                <br />
                The protocol is restricted in certain jurisdictions due to regulatory
                compliance requirements.
              </>
            )}
            <br />
            <br />
            For more information, please review our{" "}
            <a href="#terms" className="text-primary hover:underline">
              Terms of Service
            </a>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
