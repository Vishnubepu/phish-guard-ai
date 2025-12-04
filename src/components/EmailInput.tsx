import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Scan, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailInputProps {
  onAnalyze: (email: string) => void;
  isAnalyzing: boolean;
}

export const EmailInput = ({ onAnalyze, isAnalyzing }: EmailInputProps) => {
  const [email, setEmail] = useState("");

  const handleAnalyze = () => {
    if (email.trim()) {
      onAnalyze(email);
    }
  };

  const handleClear = () => {
    setEmail("");
  };

  const loadSampleEmail = () => {
    const samplePhishing = `From: security-alert@bankofamerica-secure.net
To: customer@email.com
Subject: URGENT: Your Account Has Been Compromised - Immediate Action Required!
Date: Mon, 15 Jan 2024 03:42:17 -0500
X-Mailer: PHP/7.4.3
Received: from unknown (HELO mail.suspicious-server.ru) (185.234.xx.xx)

Dear Valued Customer,

We have detected UNUSUAL ACTIVITY on your Bank of America account. Your account has been TEMPORARILY SUSPENDED due to suspicious login attempts.

⚠️ IMMEDIATE ACTION REQUIRED ⚠️

Click the link below within 24 HOURS or your account will be PERMANENTLY LOCKED:

https://bankofamerica-verify-account.suspicious-domain.com/verify?id=abc123

You must verify your:
- Social Security Number
- Account Password  
- Credit Card Details
- Mother's Maiden Name

This is an automated security measure. Failure to comply will result in account termination.

Sincerely,
Bank of America Security Team
DO NOT REPLY TO THIS EMAIL`;
    setEmail(samplePhishing);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive/70" />
          <div className="w-3 h-3 rounded-full bg-warning/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
        </div>
        <span className="text-xs font-mono text-muted-foreground tracking-wider">
          EMAIL_ANALYZER.exe
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSampleEmail}
            className="text-xs font-mono"
          >
            <FileText className="w-3 h-3 mr-1" />
            Sample
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!email}
            className="text-xs font-mono"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`Paste suspicious email content here...

Include headers if available for better analysis:
- From, To, Subject
- Received headers
- X-Mailer, Return-Path
- Email body content`}
          className={cn(
            "w-full h-80 p-4 bg-transparent text-foreground font-mono text-sm",
            "placeholder:text-muted-foreground/50 resize-none",
            "focus:outline-none focus:ring-0 border-0",
            "leading-relaxed"
          )}
          disabled={isAnalyzing}
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-primary font-mono text-sm animate-pulse">
                SCANNING EMAIL...
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4 bg-secondary/30 border-t border-border">
        <Button
          variant="scan"
          size="lg"
          onClick={handleAnalyze}
          disabled={!email.trim() || isAnalyzing}
          className="w-full"
        >
          <Scan className="w-5 h-5" />
          {isAnalyzing ? "ANALYZING..." : "SCAN FOR THREATS"}
        </Button>
      </div>
    </div>
  );
};
