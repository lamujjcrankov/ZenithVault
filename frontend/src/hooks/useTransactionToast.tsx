import { useEffect, useRef } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast, type ToasterToast } from "@/hooks/useToast";
import { TransactionToastContent, getExplorerUrl } from "@/components/ui/toast";

interface UseTransactionToastOptions {
  pendingTitle?: string;
  pendingDescription?: string;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
  chainId?: number;
}

const defaultOptions: UseTransactionToastOptions = {
  pendingTitle: "Transaction Pending",
  pendingDescription: "Waiting for confirmation...",
  successTitle: "Transaction Confirmed",
  successDescription: "Your transaction was successful",
  errorTitle: "Transaction Failed",
  errorDescription: "Something went wrong",
  chainId: 11155111, // Sepolia
};

export function useTransactionToast(
  hash: `0x${string}` | undefined,
  options: UseTransactionToastOptions = {}
) {
  const opts = { ...defaultOptions, ...options };
  const toastRef = useRef<{ id: string; dismiss: () => void; update: (props: Partial<ToasterToast>) => void } | null>(null);
  const hasShownPending = useRef(false);
  const hasShownResult = useRef(false);
  const previousHash = useRef<string | undefined>(undefined);

  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Reset refs when hash changes
  useEffect(() => {
    if (hash !== previousHash.current) {
      hasShownPending.current = false;
      hasShownResult.current = false;
      toastRef.current = null;
      previousHash.current = hash;
    }
  }, [hash]);

  // Show pending toast when hash first appears
  useEffect(() => {
    if (hash && !hasShownPending.current) {
      hasShownPending.current = true;

      toastRef.current = toast({
        variant: "pending",
        description: (
          <TransactionToastContent
            status="pending"
            title={opts.pendingTitle!}
            description={opts.pendingDescription}
            hash={hash}
            chainId={opts.chainId}
          />
        ),
        duration: Infinity, // Keep open until updated
      });
    }
  }, [hash, opts.pendingTitle, opts.pendingDescription, opts.chainId]);

  // Update toast on success
  useEffect(() => {
    if (isSuccess && hash && !hasShownResult.current) {
      hasShownResult.current = true;

      const content = (
        <TransactionToastContent
          status="success"
          title={opts.successTitle!}
          description={opts.successDescription}
          hash={hash}
          chainId={opts.chainId}
        />
      );

      if (toastRef.current) {
        toastRef.current.update({
          variant: "success",
          description: content,
          duration: 8000,
        });
      } else {
        toast({
          variant: "success",
          description: content,
          duration: 8000,
        });
      }
    }
  }, [isSuccess, hash, opts.successTitle, opts.successDescription, opts.chainId]);

  // Update toast on error
  useEffect(() => {
    if (isError && hash && !hasShownResult.current) {
      hasShownResult.current = true;

      const errorMessage = error?.message?.includes("reverted")
        ? "Transaction reverted by contract"
        : error?.message || opts.errorDescription;

      const content = (
        <TransactionToastContent
          status="error"
          title={opts.errorTitle!}
          description={errorMessage}
          hash={hash}
          chainId={opts.chainId}
        />
      );

      if (toastRef.current) {
        toastRef.current.update({
          variant: "error",
          description: content,
          duration: 10000,
        });
      } else {
        toast({
          variant: "error",
          description: content,
          duration: 10000,
        });
      }
    }
  }, [isError, error, hash, opts.errorTitle, opts.errorDescription, opts.chainId]);

  return {
    isLoading,
    isSuccess,
    isError,
    error,
  };
}

// Helper function to show a quick toast for wallet interactions
export function showWalletToast(type: "connect" | "sign" | "reject") {
  const messages = {
    connect: { title: "Wallet Connected", description: "Successfully connected to wallet" },
    sign: { title: "Signature Required", description: "Please sign in your wallet" },
    reject: { title: "Transaction Rejected", description: "You cancelled the transaction" },
  };

  const variants = {
    connect: "success" as const,
    sign: "info" as const,
    reject: "error" as const,
  };

  const statuses = {
    connect: "success" as const,
    sign: "pending" as const,
    reject: "error" as const,
  };

  toast({
    variant: variants[type],
    description: (
      <TransactionToastContent
        status={statuses[type]}
        title={messages[type].title}
        description={messages[type].description}
      />
    ) as unknown as string,
    duration: 4000,
  });
}

// Function to show custom transaction toast with explorer link
export function showTransactionToast(
  status: "pending" | "success" | "error",
  title: string,
  description?: string,
  hash?: string,
  chainId: number = 11155111
) {
  const variants = {
    pending: "pending" as const,
    success: "success" as const,
    error: "error" as const,
  };

  const durations = {
    pending: Infinity,
    success: 8000,
    error: 10000,
  };

  return toast({
    variant: variants[status],
    description: (
      <TransactionToastContent
        status={status}
        title={title}
        description={description}
        hash={hash}
        chainId={chainId}
      />
    ) as unknown as string,
    duration: durations[status],
  });
}

export { getExplorerUrl };
