import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";

interface ThreatMeterProps {
  score: number | null;
  isAnalyzing: boolean;
}

export const ThreatMeter = ({ score, isAnalyzing }: ThreatMeterProps) => {
  const getThreatLevel = () => {
    if (score === null) return { label: "Awaiting Analysis", color: "muted", isThreat: null };
    if (score <= 50) return { label: "No Threat Detected", color: "success", isThreat: false };
    return { label: "Threat Detected", color: "destructive", isThreat: true };
  };

  const { label, color, isThreat } = getThreatLevel();

  const getIcon = () => {
    if (isAnalyzing) return <ShieldQuestion className="w-8 h-8 animate-pulse" />;
    if (score === null) return <Shield className="w-8 h-8" />;
    if (score <= 50) return <ShieldCheck className="w-8 h-8" />;
    return <ShieldAlert className="w-8 h-8" />;
  };

  const getGradientStyle = () => {
    if (score === null) return "bg-muted";
    if (score <= 50) return "bg-success";
    return "bg-destructive";
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground font-mono tracking-wide">
          THREAT LEVEL
        </h3>
        <div className={cn(
          "transition-colors duration-500",
          color === "success" && "text-success",
          color === "destructive" && "text-destructive",
          color === "muted" && "text-muted-foreground"
        )}>
          {getIcon()}
        </div>
      </div>

      {/* YES/NO Display */}
      <div className="text-center mb-6">
        <div className={cn(
          "text-6xl font-bold font-mono transition-all duration-500",
          isAnalyzing && "animate-pulse text-primary",
          !isAnalyzing && color === "success" && "text-success",
          !isAnalyzing && color === "destructive" && "text-destructive threat-pulse",
          !isAnalyzing && color === "muted" && "text-muted-foreground"
        )}>
          {isAnalyzing ? "..." : isThreat === null ? "--" : isThreat ? "YES" : "NO"}
        </div>
        <p className={cn(
          "text-sm font-mono uppercase tracking-wider mt-2 transition-colors duration-500",
          color === "success" && "text-success",
          color === "destructive" && "text-destructive",
          color === "muted" && "text-muted-foreground"
        )}>
          {isAnalyzing ? "Scanning..." : label}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full meter-fill rounded-full",
            getGradientStyle(),
            isAnalyzing && "animate-pulse"
          )}
          style={{ width: isAnalyzing ? "60%" : `${score ?? 0}%` }}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 scan-line" />
        )}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-2 text-xs font-mono text-muted-foreground">
        <span>SAFE</span>
        <span>THREAT</span>
      </div>
    </div>
  );
};
