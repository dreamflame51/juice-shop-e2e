# Healed tests log

A record of every test failure diagnosed and fixed via the `playwright-cli`
heal workflow (see the skill's
[test-generation.md § 3](../../.claude/skills/playwright-cli/references/test-generation.md#3-heal)).
Purely mechanical reruns of already-passing tests don't belong here — only
failures that needed a real diagnosis and a code/spec change.

Entries live in [`log.json`](log.json), newest last:

```json
{
  "date": "YYYY-MM-DD",
  "spec": "tests/path/to.spec.ts",
  "tests": ["<test name that failed>"],
  "symptom": "What was actually observed (error message, flake pattern).",
  "rootCause": "Why it happened.",
  "fix": "What changed and where.",
  "files": ["src/or/tests/files/touched.ts"]
}
```

Append a new entry whenever you heal a test — it's the project's memory of
flaky or surprising failures, so the same root cause doesn't get
rediscovered from scratch next time.
