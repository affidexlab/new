import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Sparkles, Info } from "lucide-react";

type SlippageMode = "smart" | "custom";

export interface SlippageConfig {
  mode: SlippageMode;
  customValue: number;
}

interface SlippageSettingsProps {
  value: SlippageConfig;
  onChange: (config: SlippageConfig) => void;
}

export function SlippageSettings({ value, onChange }: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(value.customValue.toString());

  const handleModeChange = (mode: SlippageMode) => {
    onChange({ ...value, mode });
  };

  const handleCustomValueChange = (val: string) => {
    setCustomInput(val);
    const numVal = parseFloat(val);
    if (!isNaN(numVal) && numVal > 0 && numVal <= 50) {
      onChange({ mode: "custom", customValue: numVal });
    }
  };

  const getSlippageValue = () => {
    if (value.mode === "smart") {
      return 0.5;
    }
    return value.customValue;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3396FF]/20 border border-[#3396FF]/50 hover:bg-[#3396FF]/30 transition">
          {value.mode === "smart" ? (
            <>
              <Sparkles size={14} className="text-[#47A1FF]" />
              <span className="text-sm font-medium text-[#47A1FF]">Smart</span>
            </>
          ) : (
            <>
              <Settings size={14} className="text-[#47A1FF]" />
              <span className="text-sm font-medium text-[#47A1FF]">Custom</span>
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#0B1221] border border-[#1E2940] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Slippage Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start gap-2 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Smart slippage is to reduce chances of swap failing, however it can lead to higher price impact. 
              Custom slippage is so the user can choose specific slippage they want to use themselves.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400">Slippage Mode</label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleModeChange("smart")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  value.mode === "smart"
                    ? "border-[#3396FF] bg-[#3396FF]/10"
                    : "border-[#1E2940] bg-[#0D1624] hover:border-[#3396FF]/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles size={20} className={value.mode === "smart" ? "text-[#47A1FF]" : "text-gray-500"} />
                </div>
                <div className="text-center">
                  <div className="font-semibold mb-1">Smart</div>
                  <div className="text-xs text-gray-400">Auto (0.5%)</div>
                </div>
              </button>

              <button
                onClick={() => handleModeChange("custom")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  value.mode === "custom"
                    ? "border-[#3396FF] bg-[#3396FF]/10"
                    : "border-[#1E2940] bg-[#0D1624] hover:border-[#3396FF]/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Settings size={20} className={value.mode === "custom" ? "text-[#47A1FF]" : "text-gray-500"} />
                </div>
                <div className="text-center">
                  <div className="font-semibold mb-1">Custom</div>
                  <div className="text-xs text-gray-400">Set manually</div>
                </div>
              </button>
            </div>
          </div>

          {value.mode === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Custom Slippage (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={customInput}
                  onChange={(e) => handleCustomValueChange(e.target.value)}
                  placeholder="0.5"
                  min="0.1"
                  max="50"
                  step="0.1"
                  className="flex-1 bg-[#0D1624] border-[#1E2940] text-white"
                />
                <span className="text-gray-400">%</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCustomValueChange("0.5")}
                  className="flex-1 border-[#1E2940] hover:bg-[#3396FF]/10"
                >
                  0.5%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCustomValueChange("1.0")}
                  className="flex-1 border-[#1E2940] hover:bg-[#3396FF]/10"
                >
                  1%
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCustomValueChange("2.0")}
                  className="flex-1 border-[#1E2940] hover:bg-[#3396FF]/10"
                >
                  2%
                </Button>
              </div>
              {parseFloat(customInput) > 5 && (
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <Info size={12} />
                  High slippage may result in unfavorable trades
                </p>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#1E2940]">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Slippage</span>
              <span className="font-semibold text-[#47A1FF]">{getSlippageValue()}%</span>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-gradient-to-r from-[#3396FF] to-[#47A1FF] hover:opacity-90"
          >
            Apply Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getSlippagePercentage(config: SlippageConfig): number {
  if (config.mode === "smart") {
    return 0.5;
  }
  return config.customValue;
}
