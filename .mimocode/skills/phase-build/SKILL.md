---
name: phase-build
description: Build project phases sequentially with verification. Reads project state from memory/information files, implements the next incomplete phase, verifies with tests, then updates tracking docs. Trigger when user says "complete remaining phases", "build next phase", "finish the project", or "read files/information/memory and build".
---

# Phase Build

Sequential phase-based project completion with automatic verification and documentation updates.

## When to use

- User asks to complete remaining development phases
- Building a project that follows a phase-gated approach
- Verifying and updating project status after implementation
- Triggered by phrases like "complete the phases", "build what's next", "finish remaining work"

## Workflow

### Step 1 - Read project state

Read these files to understand current status:

1. `memory/00-bootstrap.md` - 30-second project state
2. `memory/decisions.md` - Architecture decisions
3. `memory/session_log.md` - Work history
4. `information/TODO.md` - Master task list
5. `information/10-development-phases.md` - Phase definitions (if exists)

Extract:
- Which phases are complete (✅ BUILT)
- Which phase is next (📋 PLANNED)
- Current test count
- Any blockers or dependencies

### Step 2 - Identify next phase

From the phase definitions, determine:
- Phase name and scope
- Pass conditions (what must work)
- Dependencies on previous phases
- Estimated complexity

### Step 3 - Implement phase

For each phase:

1. **Plan**: List files to create/modify
2. **Implement**: Write the code following existing patterns
3. **Test**: Create tests matching the project's test framework
4. **Verify**: Run test suite until green

Implementation order within a phase:
- Core logic first
- Integration points second
- Tests third
- Documentation last

### Step 4 - Verify phase completion

Run these checks in sequence:

```bash
# Type checking (if TypeScript)
npm run typecheck

# Unit tests
npm test

# Build
npm run build

# Additional checks based on project
npm run lint
```

All must pass before marking phase complete.

### Step 5 - Update tracking documents

After verification:

1. **information/ files**: Change status headers from `📋 PLANNED` to `✅ BUILT`
2. **memory/00-bootstrap.md**: Update test count and phase status
3. **memory/session_log.md**: Append dated entry with what was done
4. **memory/decisions.md**: Add any new architectural decisions

### Step 6 - Move to next phase

Repeat Steps 2-5 for the next phase until:
- All phases are complete, OR
- A blocker is encountered, OR
- User pauses the process

## File structure conventions

```
project/
├── files/           # Frozen specs (never modify)
├── information/     # Living status docs (update as phases complete)
├── memory/          # Quick state restoration
│   ├── 00-bootstrap.md
│   ├── decisions.md
│   └── session_log.md
├── apps/            # Application code
├── packages/        # Shared libraries
└── tests/           # Test suites
```

## Status header format

```markdown
# Phase N: Phase Name
Status: ✅ BUILT
```

or

```markdown
# Phase N: Phase Name
Status: 📋 PLANNED
```

## Important notes

- Never skip verification - tests must pass before moving on
- Update docs immediately after verification, not later
- Preserve existing code patterns and conventions
- If a phase depends on infrastructure that doesn't exist, note it and move on
- Max 5 tool calls per turn to avoid overwhelming context
- Subtasks should be 3-6 items, each completable in <120 minutes
