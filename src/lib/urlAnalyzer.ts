export interface UrlAnalysisResult {
  url: string;
  domain: string;
  overallScore: number;
  checks: {
    name: string;
    status: "safe" | "warning" | "danger";
    description: string;
  }[];
  warnings: string[];
  details: {
    protocol: string;
    isHttps: boolean;
    hasIpAddress: boolean;
    isUrlShortener: boolean;
    suspiciousTld: boolean;
    typosquatting: string | null;
    excessiveSubdomains: boolean;
    suspiciousKeywords: string[];
    encodedCharacters: boolean;
    unusualPort: boolean;
  };
}

// Known URL shorteners
const URL_SHORTENERS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly',
  'adf.ly', 'j.mp', 'tr.im', 'cli.gs', 'short.to', 'budurl.com', 'ping.fm',
  'post.ly', 'just.as', 'bkite.com', 'snipr.com', 'fic.kr', 'loopt.us',
  'doiop.com', 'twitthis.com', 'htxt.it', 'ak.im', 'yep.it', 'posted.at',
  'bit.do', 'cutt.ly', 'rb.gy', 'shorturl.at'
];

// Suspicious/free TLDs often used in phishing
const SUSPICIOUS_TLDS = [
  '.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.work', '.click',
  '.link', '.info', '.online', '.site', '.website', '.space', '.pw',
  '.cc', '.buzz', '.rest', '.fit', '.life', '.live', '.mom', '.lol',
  '.surf', '.icu', '.monster', '.cam'
];

// Legitimate brands often targeted by typosquatting
const TARGET_BRANDS: { [key: string]: string[] } = {
  'google': ['g00gle', 'googl', 'gooogle', 'googie', 'g0ogle', 'qoogle'],
  'facebook': ['faceb00k', 'facebok', 'faceboook', 'fecebook', 'facbook'],
  'amazon': ['amaz0n', 'amazn', 'amazone', 'amazonn', 'arnazon'],
  'paypal': ['paypa1', 'paypai', 'paypol', 'paypaI', 'poypal'],
  'microsoft': ['micros0ft', 'microsofl', 'mircosoft', 'microsft'],
  'apple': ['app1e', 'appie', 'applle', 'aple', 'aaple'],
  'netflix': ['netf1ix', 'netfIix', 'netfiix', 'nettflix'],
  'instagram': ['1nstagram', 'instagran', 'instgram', 'lnstagram'],
  'twitter': ['tw1tter', 'twtter', 'tvvitter', 'twltter'],
  'linkedin': ['linked1n', 'linkdin', 'linkedln', 'linkeden'],
  'dropbox': ['dr0pbox', 'dropb0x', 'drpbox', 'dropbax'],
  'chase': ['chas3', 'chasse', 'chasee', 'chace'],
  'wellsfargo': ['we11sfargo', 'wellsfarg0', 'welsfargo'],
  'bankofamerica': ['bank0famerica', 'bankofamer1ca', 'bankofamerlca'],
  'citibank': ['c1tibank', 'citibenk', 'citlbank'],
};

// Phishing keywords in URLs
const PHISHING_KEYWORDS = [
  'login', 'signin', 'sign-in', 'account', 'verify', 'verification',
  'secure', 'security', 'update', 'confirm', 'password', 'credential',
  'banking', 'wallet', 'suspend', 'locked', 'urgent', 'alert',
  'authenticate', 'validation', 'recover', 'restore', 'unlock',
  'webscr', 'customer', 'client', 'support', 'service', 'helpdesk'
];

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function hasIpAddress(url: string): boolean {
  const ipPattern = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  return ipPattern.test(url);
}

function isUrlShortener(domain: string): boolean {
  return URL_SHORTENERS.some(shortener => 
    domain === shortener || domain.endsWith('.' + shortener)
  );
}

function hasSuspiciousTld(domain: string): boolean {
  return SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld));
}

function detectTyposquatting(domain: string): string | null {
  const domainLower = domain.toLowerCase();
  
  for (const [brand, typos] of Object.entries(TARGET_BRANDS)) {
    // Check if domain contains a typosquatted version
    for (const typo of typos) {
      if (domainLower.includes(typo)) {
        return `Possible typosquatting of "${brand}"`;
      }
    }
    
    // Check for brand name with suspicious additions
    if (domainLower.includes(brand) && !domainLower.endsWith(`.${brand}.com`)) {
      const suspiciousPatterns = [
        `${brand}-secure`, `${brand}-login`, `${brand}-verify`,
        `${brand}security`, `${brand}support`, `secure${brand}`,
        `login${brand}`, `my${brand}`, `${brand}account`
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (domainLower.includes(pattern)) {
          return `Suspicious use of "${brand}" brand name`;
        }
      }
    }
  }
  
  return null;
}

function hasExcessiveSubdomains(domain: string): boolean {
  const parts = domain.split('.');
  return parts.length > 4;
}

function findSuspiciousKeywords(url: string): string[] {
  const urlLower = url.toLowerCase();
  return PHISHING_KEYWORDS.filter(keyword => urlLower.includes(keyword));
}

function hasEncodedCharacters(url: string): boolean {
  // Check for excessive URL encoding that might hide malicious content
  const encodedPattern = /%[0-9a-fA-F]{2}/g;
  const matches = url.match(encodedPattern);
  return matches !== null && matches.length > 3;
}

function hasUnusualPort(url: string): boolean {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const port = urlObj.port;
    if (!port) return false;
    const normalPorts = ['80', '443', '8080', '8443'];
    return !normalPorts.includes(port);
  } catch {
    return false;
  }
}

export function analyzeUrl(inputUrl: string): UrlAnalysisResult {
  // Normalize URL
  const url = inputUrl.trim();
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  
  let protocol = 'unknown';
  let isHttps = false;
  
  try {
    const urlObj = new URL(fullUrl);
    protocol = urlObj.protocol.replace(':', '');
    isHttps = protocol === 'https';
  } catch {
    // Invalid URL
  }
  
  const domain = extractDomain(url);
  const checks: UrlAnalysisResult['checks'] = [];
  const warnings: string[] = [];
  let score = 0;
  
  // Check 1: HTTPS
  if (isHttps) {
    checks.push({
      name: "HTTPS Protocol",
      status: "safe",
      description: "Uses secure HTTPS connection"
    });
  } else {
    checks.push({
      name: "HTTPS Protocol",
      status: "danger",
      description: "Not using secure HTTPS connection"
    });
    score += 15;
    warnings.push("Website does not use HTTPS encryption");
  }
  
  // Check 2: IP Address
  const hasIp = hasIpAddress(url);
  if (hasIp) {
    checks.push({
      name: "IP Address URL",
      status: "danger",
      description: "URL contains IP address instead of domain"
    });
    score += 25;
    warnings.push("Legitimate sites rarely use IP addresses in URLs");
  } else {
    checks.push({
      name: "IP Address URL",
      status: "safe",
      description: "Uses proper domain name"
    });
  }
  
  // Check 3: URL Shortener
  const isShortener = isUrlShortener(domain);
  if (isShortener) {
    checks.push({
      name: "URL Shortener",
      status: "warning",
      description: "Uses URL shortening service"
    });
    score += 20;
    warnings.push("URL shorteners can hide malicious destinations");
  } else {
    checks.push({
      name: "URL Shortener",
      status: "safe",
      description: "Not a shortened URL"
    });
  }
  
  // Check 4: Suspicious TLD
  const suspiciousTld = hasSuspiciousTld(domain);
  if (suspiciousTld) {
    checks.push({
      name: "Domain Extension",
      status: "warning",
      description: "Uses suspicious top-level domain"
    });
    score += 15;
    warnings.push("This domain extension is commonly used in phishing");
  } else {
    checks.push({
      name: "Domain Extension",
      status: "safe",
      description: "Uses common top-level domain"
    });
  }
  
  // Check 5: Typosquatting
  const typosquatResult = detectTyposquatting(domain);
  if (typosquatResult) {
    checks.push({
      name: "Brand Impersonation",
      status: "danger",
      description: typosquatResult
    });
    score += 30;
    warnings.push(typosquatResult);
  } else {
    checks.push({
      name: "Brand Impersonation",
      status: "safe",
      description: "No obvious brand impersonation detected"
    });
  }
  
  // Check 6: Excessive Subdomains
  const excessiveSubs = hasExcessiveSubdomains(domain);
  if (excessiveSubs) {
    checks.push({
      name: "Subdomain Structure",
      status: "warning",
      description: "Excessive subdomains detected"
    });
    score += 10;
    warnings.push("Too many subdomains can indicate phishing");
  } else {
    checks.push({
      name: "Subdomain Structure",
      status: "safe",
      description: "Normal subdomain structure"
    });
  }
  
  // Check 7: Phishing Keywords
  const keywords = findSuspiciousKeywords(url);
  if (keywords.length > 0) {
    checks.push({
      name: "Suspicious Keywords",
      status: keywords.length >= 2 ? "danger" : "warning",
      description: `Found: ${keywords.slice(0, 3).join(', ')}`
    });
    score += keywords.length * 8;
    warnings.push(`URL contains phishing-related keywords: ${keywords.join(', ')}`);
  } else {
    checks.push({
      name: "Suspicious Keywords",
      status: "safe",
      description: "No phishing keywords detected"
    });
  }
  
  // Check 8: Encoded Characters
  const hasEncoded = hasEncodedCharacters(url);
  if (hasEncoded) {
    checks.push({
      name: "URL Encoding",
      status: "warning",
      description: "Excessive URL encoding detected"
    });
    score += 10;
    warnings.push("Excessive encoding may hide malicious content");
  } else {
    checks.push({
      name: "URL Encoding",
      status: "safe",
      description: "Normal URL encoding"
    });
  }
  
  // Check 9: Unusual Port
  const unusualPort = hasUnusualPort(url);
  if (unusualPort) {
    checks.push({
      name: "Port Number",
      status: "warning",
      description: "Uses unusual port number"
    });
    score += 10;
    warnings.push("Unusual port numbers can indicate phishing");
  }
  
  // Clamp score
  const overallScore = Math.min(100, Math.max(0, score));
  
  return {
    url: fullUrl,
    domain,
    overallScore,
    checks,
    warnings,
    details: {
      protocol,
      isHttps,
      hasIpAddress: hasIp,
      isUrlShortener: isShortener,
      suspiciousTld,
      typosquatting: typosquatResult,
      excessiveSubdomains: excessiveSubs,
      suspiciousKeywords: keywords,
      encodedCharacters: hasEncoded,
      unusualPort,
    }
  };
}
