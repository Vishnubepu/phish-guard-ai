import { cn } from "@/lib/utils";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Link,
  Clock,
  DollarSign,
  UserX,
  Mail,
  Shield
} from "lucide-react";

export interface AnalysisResult {
  textAnalysis: {
    urgencyScore: number;
    fraudTone: number;
    suspiciousPatterns: string[];
    legitimateIndicators: string[];
  };
  headerAnalysis: {
    spf: "pass" | "fail" | "none";
    dkim: "pass" | "fail" | "none";
    dmarc: "pass" | "fail" | "none";
    suspiciousSender: boolean;
    headerWarnings: string[];
  };
  links: {
    total: number;
    suspicious: number;
    urls: string[];
  };
  overallScore: number;
}

interface AnalysisResultsProps {
  results: AnalysisResult | null;
}

export const AnalysisResults = ({ results }: AnalysisResultsProps) => {
  if (!results) {
    return (
      <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No Analysis Yet
        </h3>
        <p className="text-sm text-muted-foreground/70">
          Paste an email and click scan to analyze for phishing indicators
        </p>
      </div>
    );
  }

  const getStatusIcon = (status: "pass" | "fail" | "none") => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: "pass" | "fail" | "none") => {
    switch (status) {
      case "pass":
        return "text-success";
      case "fail":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Analysis Section */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in">
        <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Content Analysis
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs font-mono text-muted-foreground">URGENCY</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-warning rounded-full transition-all duration-500"
                  style={{ width: `${results.textAnalysis.urgencyScore}%` }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-warning">
                {results.textAnalysis.urgencyScore}%
              </span>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-destructive" />
              <span className="text-xs font-mono text-muted-foreground">FRAUD TONE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive rounded-full transition-all duration-500"
                  style={{ width: `${results.textAnalysis.fraudTone}%` }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-destructive">
                {results.textAnalysis.fraudTone}%
              </span>
            </div>
          </div>
        </div>

        {results.textAnalysis.suspiciousPatterns.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-mono text-destructive mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SUSPICIOUS PATTERNS DETECTED
            </h4>
            <div className="flex flex-wrap gap-2">
              {results.textAnalysis.suspiciousPatterns.map((pattern, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-destructive/10 border border-destructive/30 rounded text-xs font-mono text-destructive"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        {results.textAnalysis.legitimateIndicators.length > 0 && (
          <div>
            <h4 className="text-xs font-mono text-success mb-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              LEGITIMATE INDICATORS
            </h4>
            <div className="flex flex-wrap gap-2">
              {results.textAnalysis.legitimateIndicators.map((indicator, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-success/10 border border-success/30 rounded text-xs font-mono text-success"
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Header Analysis Section */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
          <UserX className="w-4 h-4" />
          Header Analysis
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "SPF", status: results.headerAnalysis.spf },
            { label: "DKIM", status: results.headerAnalysis.dkim },
            { label: "DMARC", status: results.headerAnalysis.dmarc },
          ].map(({ label, status }) => (
            <div 
              key={label}
              className={cn(
                "bg-secondary/50 rounded-lg p-3 text-center border",
                status === "pass" && "border-success/30",
                status === "fail" && "border-destructive/30",
                status === "none" && "border-border"
              )}
            >
              <div className="flex justify-center mb-1">
                {getStatusIcon(status)}
              </div>
              <span className="text-xs font-mono font-bold">{label}</span>
              <p className={cn("text-xs font-mono uppercase", getStatusColor(status))}>
                {status}
              </p>
            </div>
          ))}
        </div>

        {results.headerAnalysis.headerWarnings.length > 0 && (
          <div className="space-y-2">
            {results.headerAnalysis.headerWarnings.map((warning, i) => (
              <div 
                key={i}
                className="flex items-start gap-2 p-2 bg-destructive/5 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-xs text-destructive/90">{warning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links Analysis Section */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
          <Link className="w-4 h-4" />
          Link Analysis
        </h3>

        <div className="flex gap-4 mb-4">
          <div className="bg-secondary/50 rounded-lg px-4 py-2">
            <span className="text-2xl font-mono font-bold text-foreground">
              {results.links.total}
            </span>
            <p className="text-xs font-mono text-muted-foreground">TOTAL</p>
          </div>
          <div className={cn(
            "rounded-lg px-4 py-2",
            results.links.suspicious > 0 ? "bg-destructive/10" : "bg-success/10"
          )}>
            <span className={cn(
              "text-2xl font-mono font-bold",
              results.links.suspicious > 0 ? "text-destructive" : "text-success"
            )}>
              {results.links.suspicious}
            </span>
            <p className={cn(
              "text-xs font-mono",
              results.links.suspicious > 0 ? "text-destructive/70" : "text-success/70"
            )}>
              SUSPICIOUS
            </p>
          </div>
        </div>

        {results.links.urls.length > 0 && (
          <div className="space-y-2">
            {results.links.urls.slice(0, 3).map((url, i) => (
              <div 
                key={i}
                className="flex items-center gap-2 p-2 bg-secondary/30 rounded font-mono text-xs overflow-hidden"
              >
                <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
                <span className="truncate text-muted-foreground">{url}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
