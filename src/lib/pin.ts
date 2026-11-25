export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyPin(pin: string, expectedHash: string): Promise<boolean> {
  const actual = await sha256Hex(pin);
  return actual.toLowerCase() === expectedHash.trim().toLowerCase();
}
