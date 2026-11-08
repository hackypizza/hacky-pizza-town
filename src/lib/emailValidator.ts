const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'dispostable.com',
  'getairmail.com',
  'dropmail.me',
  'trashmail.com',
  'temp-mail.org',
  'sharklasers.com',
  'guerrillamailblock.com',
  'spam4.me',
  'mytemp.email',
  'tempail.com',
  'mohmal.com',
  'fakemailgenerator.com',
  'emailondeck.com',
  'burnermail.io',
  'trashmail.net',
  'disposablemail.com',
]);

const BANNED_SUBSTRINGS = ['temp', 'disposable', 'throwaway', 'trash', 'fake'];

export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Kripya ek valid email address enter karein.' };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Invalid email format. Sahi email dalein.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email address.' };
  }

  const domain = parts[1];

  // Check known disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: 'Temporary ya disposable email allowed nahi hai. Kripya apna permanent email use karein (jaise Gmail, Yahoo, etc.).',
    };
  }

  // Check banned substrings in domain
  for (const sub of BANNED_SUBSTRINGS) {
    if (domain.includes(sub)) {
      return {
        isValid: false,
        message: 'Spam/temporary email domains are blocked. Kripya apna genuine email dalein.',
      };
    }
  }
  return { isValid: true };
}

export function isDisposableEmail(email: string): { isValid: boolean; message?: string } {
  return validateEmail(email);
}
