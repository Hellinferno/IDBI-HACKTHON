---
name: security-review
description: Review code changes for security vulnerabilities. Scans diffs for hardcoded secrets, injection risks, auth bypasses, and dangerous patterns. Trigger when user asks for security review, vulnerability scan, or mentions "review this change for security".
---

# Security Review

Systematic security audit of code changes. Analyzes diffs and changed files for vulnerabilities, hardcoded secrets, injection risks, and authentication bypasses.

## When to use

- User requests security review of code changes
- Pre-commit or pre-merge security audit
- Vulnerability scanning after refactoring
- Triggered by phrases like "review for security", "check for vulnerabilities", "security audit"

## Workflow

### Step 1 - Identify changed files

If the user provides a diff or PR, use that. Otherwise:
1. Run `git diff --name-only HEAD~1` or `git diff --name-only main` to find changed files
2. If no git history, ask user which files changed
3. Categorize files: source code, config, tests, infrastructure

### Step 2 - Read changed files

Read each changed file fully. Focus on:
- API endpoints and route handlers
- Authentication/authorization logic
- Database queries
- File operations
- External API calls
- Configuration and environment handling

### Step 3 - Scan for vulnerability patterns

Use Grep to search for these patterns across changed files:

**Hardcoded secrets:**
```
password|secret|api_key|apikey|token|credential|private_key
```
Exclude test files and example/mock values.

**Injection risks:**
```
eval\(|exec\(|innerHTML|dangerouslySetInnerHTML|__html|subprocess|os\.system|shell=True|child_process|template literal.*\$\{
```

**Auth bypasses:**
```
bypass|skip.*auth|no.*verify|ignore.*token|cors.*\*|Access-Control-Allow-Origin.*\*
```

**SQL injection:**
```
f".*SELECT|f".*INSERT|f".*UPDATE|f".*DELETE|string.*query.*\+|\.format\(.*query
```

**Path traversal:**
```
\.\.\/|path\.join\(.*req|readFile\(.*req|sendFile\(.*req
```

**Unsafe deserialization:**
```
pickle\.loads|yaml\.load|JSON\.parse\(.*req|deserialize
```

### Step 4 - Analyze findings

For each finding, classify severity:

| Severity | Criteria |
|----------|----------|
| CRITICAL | Hardcoded secret in production code, SQL injection, RCE |
| HIGH | Auth bypass, path traversal, unsafe deserialization |
| MEDIUM | CORS misconfiguration, missing input validation |
| LOW | Verbose error messages, missing rate limiting |

### Step 5 - Generate report

Structure output as:

```
## Security Review Summary

**Files reviewed:** N files
**Findings:** X critical, Y high, Z medium, W low

### Critical Findings

1. **[CRITICAL] Hardcoded API key in `path/to/file.ts:42`**
   - Pattern: `GEMINI_API_KEY = "sk-..."`
   - Risk: Secret exposed in client-side code
   - Fix: Move to environment variable, use build-time injection
   - Evidence: `grep -n "GEMINI_API_KEY" path/to/file.ts`

### High Findings
...

### Recommendations
1. Add secrets to .gitignore and use env vars
2. Implement input validation middleware
3. Add rate limiting to API endpoints
```

### Step 6 - Verify and iterate

If critical findings exist:
1. Show the exact vulnerable code snippet
2. Suggest the minimal fix (not a full refactor)
3. Offer to implement the fix

If no findings, confirm the scan was thorough by listing the patterns checked.

## Example output format

```json
{
  "summary": "Found 3 issues across 2 files",
  "files_reviewed": 5,
  "findings": [
    {
      "severity": "CRITICAL",
      "file": "src/api/config.ts",
      "line": 12,
      "pattern": "Hardcoded API key",
      "evidence": "export const API_KEY = 'sk-abc123...'",
      "fix": "Use process.env.API_KEY with build-time injection"
    }
  ]
}
```

## Important notes

- Never skip files because they "look safe"
- Check both source and test files (tests sometimes expose real secrets)
- Verify findings against the actual code context (avoid false positives)
- Report what was checked, not just what was found
