export function checkPasswordStrength(password) {
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(rules).filter(Boolean).length;

  let label = "Weak";
  if (score >= 5) label = "Strong";
  else if (score >= 3) label = "Medium";

  return { rules, score, label };
}
