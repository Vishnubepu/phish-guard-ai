import { useState } from "react";
import { EmailInput } from "@/components/EmailInput";
import { ThreatMeter } from "@/components/ThreatMeter";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { analyzeEmail } from "@/lib/emailAnalyzer";
import { Shield, Zap, Eye, Lock } from "lucide-react";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (email: string) => {
    setIsAnalyzing(true);
    setResults(null);

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResults = analyzeEmail(email);
    setResults(analysisResults);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Ambient glow effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center pulse-glow">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground tracking-tight">
                    PhishGuard<span className="text-primary">AI</span>
                  </h1>
                  <p className="text-xs font-mono text-muted-foreground">
                    THREAT DETECTION SYSTEM
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  SYSTEM ACTIVE
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">AI-Powered Analysis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Detect Phishing Emails
            <br />
            <span className="text-gradient-cyber">Before They Strike</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Paste any suspicious email to instantly analyze threat indicators, 
            validate sender authenticity, and protect yourself from cyber attacks.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { icon: Eye, label: "Content Analysis" },
              { icon: Lock, label: "Header Verification" },
              { icon: Shield, label: "Link Scanner" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <main className="container max-w-6xl mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Input */}
            <div className="space-y-6">
              <EmailInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ThreatMeter 
                score={results?.overallScore ?? null} 
                isAnalyzing={isAnalyzing} 
              />
              <AnalysisResults results={results} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground font-mono">
              PhishGuard AI • Email Threat Detection System
            </p>
            <p className="text-xs text-muted-foreground/50 mt-2">
              For educational purposes. Always verify suspicious emails through official channels.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
