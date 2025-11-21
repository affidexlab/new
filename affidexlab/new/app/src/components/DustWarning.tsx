import { AlertTriangle } from "lucide-react";
import { SECURITY_SETTINGS } from "@/lib/constants";

interface DustWarningProps {
  valueUSD: number;
  estimatedGasCostUSD: number;
}

export function DustWarning({ valueUSD, estimatedGasCostUSD }: DustWarningProps) {
  const isDust = valueUSD < SECURITY_SETTINGS.DUST_THRESHOLD_USD;
  const gasExceedsValue = estimatedGasCostUSD > valueUSD;

  if (!isDust && !gasExceedsValue) return null;

  return (
    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex gap-3">
      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-medium text-amber-400 text-sm mb-1">
          {isDust ? "Dust Amount Warning" : "High Gas Cost Warning"}
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          {isDust && (
            <p>
              This transaction value (${valueUSD.toFixed(4)}) is very small and may not be economical.
            </p>
          )}
          {gasExceedsValue && (
            <p>
              Estimated gas cost (${estimatedGasCostUSD.toFixed(2)}) exceeds transaction value (${valueUSD.toFixed(2)}).
            </p>
          )}
          <p className="text-amber-400/80 font-medium">
            Consider increasing the swap amount or waiting for lower gas prices.
          </p>
        </div>
      </div>
    </div>
  );
}

interface TransactionTimeoutSettingsProps {
  timeoutMinutes: number;
  onChange: (minutes: number) => void;
}

export function TransactionTimeoutSettings({ timeoutMinutes, onChange }: TransactionTimeoutSettingsProps) {
  const presets = [5, 10, 20, 30, 60];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-400">Transaction Timeout</label>
        <span className="text-sm text-[#47A1FF] font-medium">{timeoutMinutes} min</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {presets.map((minutes) => (
          <button
            key={minutes}
            onClick={() => onChange(minutes)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              timeoutMinutes === minutes
                ? "bg-[#3396FF] text-white"
                : "bg-[#1A2332] text-gray-400 hover:bg-[#1E2940] border border-[#2A3644]"
            }`}
          >
            {minutes}m
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Maximum time to wait for transaction confirmation before timing out
      </p>
    </div>
  );
}
