import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe, Scan, Trash2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeUrl, UrlAnalysisResult } from "@/lib/urlAnalyzer";
import { ThreatMeter } from "./ThreatMeter";

export const UrlAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<UrlAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setIsAnalyzing(true);
    setResults(null);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const analysisResults = analyzeUrl(url);
    setResults(analysisResults);
    setIsAnalyzing(false);
  };

  const loadSampleUrl = () => {
    setUrl("http://bankofamerica-secure-login.suspicious-domain.xyz/verify?id=12345&account=confirm");
  };

  const handleClear = () => {
    setUrl("");
    setResults(null);
  };

  const getStatusIcon = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "danger":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBg = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return "bg-success/10 border-success/30";
      case "warning":
        return "bg-warning/10 border-warning/30";
      case "danger":
        return "bg-destructive/10 border-destructive/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/70" />
            <div className="w-3 h-3 rounded-full bg-warning/70" />
            <div className="w-3 h-3 rounded-full bg-success/70" />
          </div>
          <span className="text-xs font-mono text-muted-foreground tracking-wider">
            URL_SCANNER.exe
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSampleUrl}
              className="text-xs font-mono"
            >
              <Globe className="w-3 h-3 mr-1" />
              Sample
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={!url}
              className="text-xs font-mono"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter suspicious URL to analyze..."
              className={cn(
                "w-full h-12 pl-10 pr-4 bg-secondary/50 text-foreground font-mono text-sm",
                "placeholder:text-muted-foreground/50 rounded-lg border border-border",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                "transition-all"
              )}
              disabled={isAnalyzing}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
          </div>
        </div>

        <div className="px-4 py-4 bg-secondary/30 border-t border-border">
          <Button
            variant="scan"
            size="lg"
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className="w-full"
          >
            <Scan className="w-5 h-5" />
            {isAnalyzing ? "ANALYZING URL..." : "SCAN URL"}
          </Button>
        </div>
      </div>

      {/* Results */}
      {(isAnalyzing || results) && (
        <ThreatMeter
          score={results?.overallScore ?? null}
          isAnalyzing={isAnalyzing}
        />
      )}

      {results && (
        <div className="space-y-4">
          {/* Domain Info */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in">
            <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Domain Analysis
            </h3>
            <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm break-all">
              <span className="text-muted-foreground">Domain: </span>
              <span className="text-foreground">{results.domain}</span>
            </div>
          </div>

          {/* Security Checks */}
          <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-sm font-mono uppercase tracking-wider text-primary mb-4">
              Security Checks
            </h3>
            <div className="space-y-2">
              {results.checks.map((check, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border",
                    getStatusBg(check.status)
                  )}
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {check.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {check.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {results.warnings.length > 0 && (
            <div className="bg-card rounded-xl border border-border shadow-card p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-sm font-mono uppercase tracking-wider text-destructive mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings ({results.warnings.length})
              </h3>
              <div className="space-y-2">
                {results.warnings.map((warning, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <span className="text-sm text-destructive/90">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!results && !isAnalyzing && (
        <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            URL Scanner Ready
          </h3>
          <p className="text-sm text-muted-foreground/70">
            Enter a suspicious URL to check for phishing indicators, typosquatting, and security issues
          </p>
        </div>
      )}
    </div>
  );
};
