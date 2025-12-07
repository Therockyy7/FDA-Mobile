// Email validation utilities

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

// Common email domains for suggestions
const COMMON_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
  'qq.com',
  '163.com',
  'yandex.com',
];

// Common Vietnamese email domains
const VIETNAMESE_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'fpt.edu.vn',
  'hust.edu.vn',
  'uit.edu.vn',
  'vnu.edu.vn',
];

export function validateEmail(email: string): EmailValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email là bắt buộc',
    };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Định dạng email không hợp lệ',
      suggestions: [
        'Đảm bảo email có định dạng: user@domain.com',
        'Kiểm tra không có khoảng trắng thừa',
        'Sử dụng ký tự hợp lệ (chữ, số, dấu chấm, gạch dưới)',
      ],
    };
  }

  // Check for common mistakes
  const [localPart, domain] = trimmedEmail.split('@');
  
  // Local part validation
  if (localPart.length === 0) {
    return {
      isValid: false,
      error: 'Phần tên người dùng không được để trống',
    };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Phần tên người dùng quá dài (tối đa 64 ký tự)',
    };
  }

  // Domain validation
  if (domain.length === 0) {
    return {
      isValid: false,
      error: 'Tên miền không được để trống',
    };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'Tên miền phải có phần mở rộng (ví dụ: .com)',
    };
  }

  // Check for typos in common domains
  const domainSuggestion = suggestDomain(domain);
  if (domainSuggestion && domainSuggestion !== domain) {
    return {
      isValid: false,
      error: 'Có thể bạn đã nhập sai tên miền',
      suggestions: [
        `Bạn có ý muốn nhập: ${localPart}@${domainSuggestion}?`,
        'Kiểm tra lại tên miền email',
      ],
    };
  }

  // Check for multiple @ symbols
  if (email.split('@').length > 2) {
    return {
      isValid: false,
      error: 'Email chỉ được chứa một ký tự @',
    };
  }

  // Check for consecutive dots
  if (domain.includes('..')) {
    return {
      isValid: false,
      error: 'Tên miền không được có hai dấu chấm liên tiếp',
    };
  }

  // All checks passed
  return {
    isValid: true,
  };
}

// Suggest correct domain for common typos
function suggestDomain(domain: string): string | null {
  const typoMap: Record<string, string> = {
    // Gmail typos
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gmailcom': 'gmail.com',
    
    // Yahoo typos
    'yaho.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'yahoocom': 'yahoo.com',
    
    // Hotmail typos
    'hotmai.com': 'hotmail.com',
    'hotmal.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'hotmailcom': 'hotmail.com',
    
    // Outlook typos
    'outlook.co': 'outlook.com',
    'outlook.cm': 'outlook.com',
    'outlok.com': 'outlook.com',
    'outlookcom': 'outlook.com',
  };

  return typoMap[domain] || null;
}

// Real-time email validation (for onChange events)
export function validateEmailRealtime(email: string): string | null {
  if (!email) return null;

  const trimmedEmail = email.trim();
  
  // Don't show errors while user is still typing
  if (trimmedEmail.length < 3) return null;
  
  // Check for basic structure
  if (!trimmedEmail.includes('@') && trimmedEmail.length > 5) {
    return 'Email phải chứa ký tự @';
  }
  
  // Check for multiple @ symbols
  if (trimmedEmail.split('@').length > 2) {
    return 'Email chỉ được chứa một ký tự @';
  }
  
  // If user has typed @ but no domain
  const parts = trimmedEmail.split('@');
  if (parts.length === 2 && parts[1].length === 0 && trimmedEmail.endsWith('@')) {
    return null; // Don't show error immediately after typing @
  }
  
  return null;
}

// Generate email suggestions based on partial input
export function generateEmailSuggestions(partialEmail: string): string[] {
  if (!partialEmail.includes('@')) {
    return [];
  }

  const [localPart] = partialEmail.split('@');
  if (!localPart) return [];

  return VIETNAMESE_DOMAINS.slice(0, 3).map(domain => `${localPart}@${domain}`);
}