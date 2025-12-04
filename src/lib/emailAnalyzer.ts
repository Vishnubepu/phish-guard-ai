import { AnalysisResult } from "@/components/AnalysisResults";

// Suspicious patterns commonly found in phishing emails
const URGENCY_PATTERNS = [
  /urgent/i,
  /immediate(ly)?/i,
  /act now/i,
  /within \d+ (hour|day)/i,
  /expire/i,
  /suspend/i,
  /locked/i,
  /limited time/i,
  /don't delay/i,
  /asap/i,
  /alert/i,
  /warning/i,
  /attention/i,
];

const FRAUD_PATTERNS = [
  /verify (your )?(account|identity|password)/i,
  /confirm (your )?(account|identity|information)/i,
  /social security/i,
  /credit card/i,
  /bank account/i,
  /password/i,
  /click (here|below|this link)/i,
  /update (your )?payment/i,
  /unusual activity/i,
  /security (alert|notice|team)/i,
  /won|winner|lottery|prize/i,
  /inheritance/i,
  /million (dollar|usd)/i,
  /wire transfer/i,
];

const SUSPICIOUS_SENDER_PATTERNS = [
  /@.*\.(ru|cn|ng|in)$/i, // Common spam origins
  /noreply@/i,
  /security.*@(?!.*\.(gov|edu))/i,
  /support.*@(?!.*\.(gov|edu))/i,
  /\d{5,}@/i, // Random numbers in email
];

const LEGITIMATE_INDICATORS = [
  /unsubscribe/i,
  /privacy policy/i,
  /terms of service/i,
  /physical address/i,
  /contact us/i,
];

function extractUrls(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlPattern) || [];
  return [...new Set(matches)];
}

function isSuspiciousUrl(url: string): boolean {
  const suspiciousPatterns = [
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
    /bit\.ly|tinyurl|goo\.gl|t\.co/i, // URL shorteners
    /-.*-.*-/i, // Multiple hyphens
    /login|verify|secure|account|update/i, // Phishing keywords in URL
    /\.(xyz|tk|ml|ga|cf|gq)$/i, // Free/suspicious TLDs
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(url));
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  return patterns.filter(pattern => pattern.test(text)).length;
}

function extractPatternLabels(text: string, patterns: RegExp[]): string[] {
  return patterns
    .filter(pattern => pattern.test(text))
    .map(pattern => {
      const match = text.match(pattern);
      return match ? match[0].toUpperCase() : "";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function analyzeHeaders(email: string): AnalysisResult["headerAnalysis"] {
  const hasSpf = /spf=(pass|fail|none)/i.exec(email);
  const hasDkim = /dkim=(pass|fail|none)/i.exec(email);
  const hasDmarc = /dmarc=(pass|fail|none)/i.exec(email);
  
  const fromMatch = email.match(/from:\s*(.+)/i);
  const fromAddress = fromMatch ? fromMatch[1] : "";
  
  const suspiciousSender = SUSPICIOUS_SENDER_PATTERNS.some(p => p.test(fromAddress));
  
  const headerWarnings: string[] = [];
  
  // Check for mismatched domains
  const fromDomain = fromAddress.match(/@([^\s>]+)/)?.[1]?.toLowerCase();
  const returnPathMatch = email.match(/return-path:\s*<([^>]+)>/i);
  const returnPathDomain = returnPathMatch?.[1]?.match(/@(.+)/)?.[1]?.toLowerCase();
  
  if (fromDomain && returnPathDomain && fromDomain !== returnPathDomain) {
    headerWarnings.push(`Domain mismatch: From (${fromDomain}) differs from Return-Path (${returnPathDomain})`);
  }
  
  // Check for suspicious received headers
  if (/received:.*\.(ru|cn|ng)/i.test(email)) {
    headerWarnings.push("Email routed through potentially suspicious servers");
  }
  
  // Check for PHP mailer (common in spam)
  if (/x-mailer:.*php/i.test(email)) {
    headerWarnings.push("Sent via PHP mailer (commonly used in phishing)");
  }
  
  if (suspiciousSender) {
    headerWarnings.push("Sender address matches known suspicious patterns");
  }

  return {
    spf: hasSpf ? (hasSpf[1].toLowerCase() as "pass" | "fail" | "none") : "none",
    dkim: hasDkim ? (hasDkim[1].toLowerCase() as "pass" | "fail" | "none") : "none",
    dmarc: hasDmarc ? (hasDmarc[1].toLowerCase() as "pass" | "fail" | "none") : "none",
    suspiciousSender,
    headerWarnings,
  };
}

export function analyzeEmail(email: string): AnalysisResult {
  // Text Analysis
  const urgencyMatches = countPatternMatches(email, URGENCY_PATTERNS);
  const fraudMatches = countPatternMatches(email, FRAUD_PATTERNS);
  
  const urgencyScore = Math.min(100, urgencyMatches * 15);
  const fraudTone = Math.min(100, fraudMatches * 12);
  
  const suspiciousPatterns = [
    ...extractPatternLabels(email, URGENCY_PATTERNS).slice(0, 3),
    ...extractPatternLabels(email, FRAUD_PATTERNS).slice(0, 3),
  ];
  
  const legitimateIndicators = extractPatternLabels(email, LEGITIMATE_INDICATORS);
  
  // Header Analysis
  const headerAnalysis = analyzeHeaders(email);
  
  // Link Analysis
  const urls = extractUrls(email);
  const suspiciousUrls = urls.filter(isSuspiciousUrl);
  
  // Calculate overall score
  let overallScore = 0;
  
  // Urgency and fraud tone contribute 40%
  overallScore += (urgencyScore + fraudTone) * 0.2;
  
  // Header failures contribute 30%
  if (headerAnalysis.spf === "fail") overallScore += 10;
  if (headerAnalysis.dkim === "fail") overallScore += 10;
  if (headerAnalysis.dmarc === "fail") overallScore += 10;
  if (headerAnalysis.suspiciousSender) overallScore += 10;
  overallScore += headerAnalysis.headerWarnings.length * 5;
  
  // Suspicious links contribute 30%
  if (suspiciousUrls.length > 0) {
    overallScore += Math.min(30, suspiciousUrls.length * 15);
  }
  
  // Reduce score for legitimate indicators
  overallScore -= legitimateIndicators.length * 5;
  
  // Clamp between 0 and 100
  overallScore = Math.max(0, Math.min(100, Math.round(overallScore)));
  
  return {
    textAnalysis: {
      urgencyScore,
      fraudTone,
      suspiciousPatterns,
      legitimateIndicators,
    },
    headerAnalysis,
    links: {
      total: urls.length,
      suspicious: suspiciousUrls.length,
      urls: suspiciousUrls,
    },
    overallScore,
  };
}
