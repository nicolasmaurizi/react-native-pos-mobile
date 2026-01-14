export function normalizeCuit(v: string) {
  return (v || "").replace(/\D/g, "");
}

// Algoritmo CUIT con dígito verificador
export function isValidCuit(raw: string) {
  const cuit = normalizeCuit(raw);
  if (cuit.length !== 11) return false;

  const digits = cuit.split("").map(Number);
  const weights = [5,4,3,2,7,6,5,4,3,2];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * weights[i];

  const mod = sum % 11;
  const check = mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod;
  return digits[10] === check;
}
