import { getSafeRedirectUrl } from "../app/lib/auth/safe-redirect"

const attackVectors = [
  // Classic external URLs
  { input: "https://evil.com", expectSafe: false, name: "Absolute HTTPS" },
  { input: "http://evil.com", expectSafe: false, name: "Absolute HTTP" },
  { input: "//evil.com", expectSafe: false, name: "Protocol-relative //" },
  { input: "///evil.com", expectSafe: false, name: "Triple slash ///" },
  { input: "/\\evil.com", expectSafe: false, name: "Slash backslash /\\" },
  { input: "\\/evil.com", expectSafe: false, name: "Backslash slash \\/" },
  { input: "\\evil.com", expectSafe: false, name: "Single backslash \\" },

  // Schemes disguised as paths
  { input: "javascript:alert(1)", expectSafe: false, name: "javascript: scheme" },
  { input: "/javascript:alert(1)", expectSafe: false, name: "Leading slash with javascript:" },
  { input: "/http://evil.com", expectSafe: false, name: "Leading slash with http://" },
  { input: "/data:text/html,<script>alert(1)</script>", expectSafe: false, name: "Data URI" },

  // Encoded evasion vectors
  { input: "/%2f/evil.com", expectSafe: false, name: "Encoded slash %2f" },
  { input: "/%5cevil.com", expectSafe: false, name: "Encoded backslash %5c" },
  { input: "/%00/evil.com", expectSafe: false, name: "Null byte %00" },
  { input: "/\r\n/evil.com", expectSafe: false, name: "CRLF injection" },
  { input: "/\t/evil.com", expectSafe: false, name: "Tab character in path" },

  // Valid internal paths
  { input: "/admin", expectSafe: true, name: "Internal /admin" },
  { input: "/account", expectSafe: true, name: "Internal /account" },
  { input: "/boutique?category=cahiers", expectSafe: true, name: "Internal with query params" },
  { input: "/product/stylo-bille#reviews", expectSafe: true, name: "Internal with hash" },
  { input: "/", expectSafe: true, name: "Root slash /" },
]

let passed = 0
let failed = 0

console.log("=== Testing Open Redirect Validation ===")

for (const test of attackVectors) {
  const result = getSafeRedirectUrl(test.input, "/account")
  const isSafe = test.expectSafe ? result === test.input : result === "/account"

  if (isSafe) {
    console.log(`[PASS] ${test.name.padEnd(35)} -> Input: ${test.input} => Result: ${result}`)
    passed++
  } else {
    console.error(`[FAIL] ${test.name.padEnd(35)} -> Input: ${test.input} => Result: ${result} (Expected: ${test.expectSafe ? test.input : "/account"})`)
    failed++
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed.`)
if (failed > 0) process.exit(1)
