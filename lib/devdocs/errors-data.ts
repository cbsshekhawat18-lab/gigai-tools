/**
 * Error-code reference data - one source for the errors page and docs search.
 */

export const REQUEST_ERRORS: [string, string, string][] = [
  ["invalid_request", "400", "The job graph or a field is malformed. The message names the exact task or field, and param carries it. Fix the request, don't retry as-is."],
  ["invalid_option", "400", "A task option failed its schema: unknown name, wrong type, out of range, or a required option is missing. GET /v1/tools shows each tool's schema."],
  ["bad_credentials", "401", "Email and password do not match an account."],
  ["unauthorized", "401", "The API key or session token is missing, unknown, revoked, or expired. Keys start gk_live_ or gk_test_ and go in the Authorization header as a bearer token."],
  ["bad_signature", "403", "A download link's signature is invalid or the link expired. Fetch the file over GET /v1/files/{id} for a fresh URL while the file exists."],
  ["email_unverified", "403", "The account exists but the email is not verified yet. Click the link in the verification mail, then log in again."],
  ["ip_not_allowed", "403", "This key carries an IP allowlist and the request came from elsewhere. Use a key without an allowlist or add the caller's IP."],
  ["missing_scope", "403", "The key is valid but lacks the scope this endpoint needs. Create a key with the default scopes or the one named in param."],
  ["invalid_token", "404", "The email verification link is invalid or expired. Sign up again to get a fresh one."],
  ["not_found", "404", "Nothing with that id on this account. Ids are account-scoped: another account's job or file answers 404, not 403."],
  ["concurrent_limit", "409", "Too many jobs running at once (5 on the free plan). Wait for one to settle, or cancel one."],
  ["email_taken", "409", "An account with this email already exists. Log in instead."],
  ["too_many_keys", "409", "The account has 20 keys. Revoke ones you no longer use."],
  ["webhook_limit", "409", "The plan's webhook endpoint cap is reached (10 on the free plan). Delete an endpoint first."],
  ["file_too_large", "413", "An imported file exceeds the plan's byte limit (100 MB free, 10 MB sandbox) or the tool's own limit. Also appears as a task error on import/url fetches."],
  ["invalid_email", "422", "That does not look like an email address."],
  ["weak_password", "422", "Passwords need at least 10 characters."],
  ["quota_exceeded", "429", "The monthly task quota is used up (1,000 tool tasks on the free plan). It resets on the first of the month. Sandbox keys never consume it."],
  ["rate_limited", "429", "Too many requests. Honor Retry-After and the X-RateLimit-* headers and slow down."],
  ["audit_quota", "429", "The daily Site Audit limit is reached (3/day anonymously, 10/day with a free key). Resets at midnight UTC."],
  ["agent_quota", "429", "The daily agent planning limit is reached (10 plans/day per account). Resets at midnight UTC. On-device planning in /ask keeps working."],
  ["audit_busy", "503", "The audit queue is full. Retry in about a minute."],
  ["planning_unavailable", "503", "POST /v1/agent/plan has no free-tier model capacity right now. Plan locally instead: the /ask page and the MCP tool list both work without it."],
];

export const TASK_ERRORS: [string, string][] = [
  ["invalid_input", "An input file is not what the tool needs: wrong format (checked by content, not extension), corrupt, or password-protected. The message names the file."],
  ["needs_two_inputs", "merge-pdf got fewer than two inputs."],
  ["input_missing", "The tasks feeding this one produced no files."],
  ["download_failed", "An import/url could not be fetched: unreachable, a non-2xx answer, too many redirects, or slower than the 60 second budget."],
  ["download_blocked", "The import URL resolves to a private or internal address (localhost, LAN ranges, cloud metadata). Only public URLs are fetched, and every redirect hop is checked."],
  ["target_unreachable", "compress-image cannot reach target_kb even at the lowest quality. The message says what the floor is. Resize smaller or raise the target."],
  ["timeout", "The engine ran past its time limit for this tool. Try a smaller input."],
  ["engine_unavailable", "The tool exists in the catalog but this worker build cannot run it right now. Retry later."],
  ["engine_failed", "The engine failed in a way it could not explain. Retrying is safe. If it repeats with the same file, the file is triggering a bug - tell us."],
];
