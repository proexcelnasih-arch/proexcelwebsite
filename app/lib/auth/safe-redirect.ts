/**
 * Validates and sanitizes a redirect target URL to prevent Open Redirect attacks.
 * Enforces internal relative paths matching `^\/(?!\/)` (single leading slash,
 * not protocol-relative `//`), disallows backslashes, colons (schemes), control characters,
 * and encoded bypass variants.
 */
export function getSafeRedirectUrl(target: string | null | undefined, fallback = "/account"): string {
  if (!target || typeof target !== "string") {
    return fallback
  }

  const trimmed = target.trim()
  if (!trimmed) {
    return fallback
  }

  // Must start with exactly one leading slash, not protocol-relative `//`
  if (!/^\/(?!\/)/.test(trimmed)) {
    return fallback
  }

  // Reject any backslashes (Windows path navigation / browser quirks like /\evil.com)
  if (trimmed.includes("\\")) {
    return fallback
  }

  // Reject control characters, CR, LF, tabs
  if (/[\u0000-\u001f\u007f-\u009f]/.test(trimmed)) {
    return fallback
  }

  // Separate path from query/hash to check path portion for schemes or encoded colons
  const pathPortion = trimmed.split("?")[0].split("#")[0]

  // Disallow colons in the path portion (e.g. /javascript:..., /http:...)
  if (pathPortion.includes(":")) {
    return fallback
  }

  // Check for URL-encoded evasion attempts (e.g. %2f, %5c, %00)
  try {
    const decoded = decodeURIComponent(trimmed)
    if (
      !/^\/(?!\/)/.test(decoded) ||
      decoded.includes("\\") ||
      /[\u0000-\u001f\u007f-\u009f]/.test(decoded)
    ) {
      return fallback
    }
    const decodedPath = decoded.split("?")[0].split("#")[0]
    if (decodedPath.includes(":")) {
      return fallback
    }
  } catch {
    // Malformed URI sequence
    return fallback
  }

  return trimmed
}
