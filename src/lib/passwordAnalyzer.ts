export interface PasswordAnalysisResult {
  score: number;
  strength: "very-weak" | "weak" | "fair" | "strong" | "very-strong";
  checks: {
    length: { passed: boolean; message: string };
    uppercase: { passed: boolean; message: string };
    lowercase: { passed: boolean; message: string };
    numbers: { passed: boolean; message: string };
    special: { passed: boolean; message: string };
    noCommon: { passed: boolean; message: string };
    noRepeating: { passed: boolean; message: string };
  };
  suggestions: string[];
  crackTime: string;
}

const COMMON_PASSWORDS = [
  "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
  "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
  "ashley", "bailey", "shadow", "123123", "654321", "superman", "qazwsx",
  "michael", "football", "password1", "password123", "welcome", "jesus", "ninja",
  "mustang", "password1234", "admin", "admin123", "root", "toor", "pass", "test"
];

export const analyzePassword = (password: string): PasswordAnalysisResult => {
  let score = 0;
  const suggestions: string[] = [];

  // Length check
  const lengthCheck = password.length >= 12;
  if (lengthCheck) score += 20;
  else if (password.length >= 8) score += 10;

  // Uppercase check
  const uppercaseCheck = /[A-Z]/.test(password);
  if (uppercaseCheck) score += 15;

  // Lowercase check
  const lowercaseCheck = /[a-z]/.test(password);
  if (lowercaseCheck) score += 15;

  // Numbers check
  const numbersCheck = /\d/.test(password);
  if (numbersCheck) score += 15;

  // Special characters check
  const specialCheck = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  if (specialCheck) score += 20;

  // Common password check
  const isCommon = COMMON_PASSWORDS.some(
    (common) => password.toLowerCase().includes(common)
  );
  const noCommonCheck = !isCommon;
  if (noCommonCheck) score += 10;
  else score -= 30;

  // Repeating characters check
  const hasRepeating = /(.)\1{2,}/.test(password);
  const noRepeatingCheck = !hasRepeating;
  if (noRepeatingCheck) score += 5;
  else score -= 10;

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Generate suggestions
  if (!lengthCheck) {
    suggestions.push("Use at least 12 characters for better security");
  }
  if (!uppercaseCheck) {
    suggestions.push("Add uppercase letters (A-Z)");
  }
  if (!lowercaseCheck) {
    suggestions.push("Add lowercase letters (a-z)");
  }
  if (!numbersCheck) {
    suggestions.push("Include numbers (0-9)");
  }
  if (!specialCheck) {
    suggestions.push("Add special characters (!@#$%^&*)");
  }
  if (!noCommonCheck) {
    suggestions.push("Avoid common passwords and dictionary words");
  }
  if (!noRepeatingCheck) {
    suggestions.push("Avoid repeating characters (aaa, 111)");
  }

  // Determine strength
  let strength: PasswordAnalysisResult["strength"];
  if (score >= 85) strength = "very-strong";
  else if (score >= 70) strength = "strong";
  else if (score >= 50) strength = "fair";
  else if (score >= 30) strength = "weak";
  else strength = "very-weak";

  // Estimate crack time
  const crackTime = estimateCrackTime(password);

  return {
    score,
    strength,
    checks: {
      length: {
        passed: lengthCheck,
        message: lengthCheck ? "12+ characters" : "Less than 12 characters",
      },
      uppercase: {
        passed: uppercaseCheck,
        message: uppercaseCheck ? "Has uppercase letters" : "No uppercase letters",
      },
      lowercase: {
        passed: lowercaseCheck,
        message: lowercaseCheck ? "Has lowercase letters" : "No lowercase letters",
      },
      numbers: {
        passed: numbersCheck,
        message: numbersCheck ? "Contains numbers" : "No numbers",
      },
      special: {
        passed: specialCheck,
        message: specialCheck ? "Has special characters" : "No special characters",
      },
      noCommon: {
        passed: noCommonCheck,
        message: noCommonCheck ? "Not a common password" : "Contains common password pattern",
      },
      noRepeating: {
        passed: noRepeatingCheck,
        message: noRepeatingCheck ? "No repeating characters" : "Has repeating characters",
      },
    },
    suggestions,
    crackTime,
  };
};

const estimateCrackTime = (password: string): string => {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) charsetSize += 32;

  if (charsetSize === 0) return "Instantly";

  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSecond = 1e10; // 10 billion guesses per second
  const seconds = combinations / guessesPerSecond / 2;

  if (seconds < 1) return "Instantly";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1000000) return `${Math.round(seconds / 31536000 / 1000)} thousand years`;
  return "Millions of years";
};
