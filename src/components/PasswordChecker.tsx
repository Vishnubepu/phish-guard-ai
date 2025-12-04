import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzePassword, PasswordAnalysisResult } from "@/lib/passwordAnalyzer";
import { Eye, EyeOff, Check, X, Clock, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const PasswordChecker = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<PasswordAnalysisResult | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0) {
      setResult(analyzePassword(value));
    } else {
      setResult(null);
    }
  };

  const getStrengthColor = (strength: PasswordAnalysisResult["strength"]) => {
    switch (strength) {
      case "very-weak":
        return "bg-danger";
      case "weak":
        return "bg-warning";
      case "fair":
        return "bg-yellow-500";
      case "strong":
        return "bg-success";
      case "very-strong":
        return "bg-primary";
    }
  };

  const getStrengthLabel = (strength: PasswordAnalysisResult["strength"]) => {
    switch (strength) {
      case "very-weak":
        return "Very Weak";
      case "weak":
        return "Weak";
      case "fair":
        return "Fair";
      case "strong":
        return "Strong";
      case "very-strong":
        return "Very Strong";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="bg-secondary/30 border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-primary" />
            Password Strength Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password to check strength..."
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="pr-12 bg-background/50 border-border font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {result && (
            <>
              {/* Strength Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">
                    Strength: {getStrengthLabel(result.strength)}
                  </span>
                  <span className="text-sm font-mono text-muted-foreground">
                    {result.score}/100
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out rounded-full",
                      getStrengthColor(result.strength)
                    )}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* Crack Time */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated crack time</p>
                  <p className="font-mono font-bold text-foreground">{result.crackTime}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="bg-secondary/30 border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground text-lg">
              <Zap className="w-5 h-5 text-primary" />
              Password Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result.checks).map(([key, check]) => (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    check.passed
                      ? "bg-success/10 border-success/30"
                      : "bg-danger/10 border-danger/30"
                  )}
                >
                  {check.passed ? (
                    <Check className="w-5 h-5 text-success flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-danger flex-shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm",
                      check.passed ? "text-success" : "text-danger"
                    )}
                  >
                    {check.message}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Suggestions to improve:</h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.score >= 85 && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-primary font-medium">Excellent! Your password is very strong.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
