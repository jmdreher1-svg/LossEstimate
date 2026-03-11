# CLAUDE.md — LossEstimate

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Project Overview

**LossEstimate** is a project in early initialization. No implementation code exists yet beyond this file and a README. This document should be updated as the project evolves to reflect its actual architecture, stack, and conventions.

> When significant code is added, update this file to reflect the current state of the project.

## Repository State

| Item | Status |
|------|--------|
| Implementation code | Not yet added |
| Build system | Not configured |
| Test infrastructure | Not configured |
| CI/CD | Not configured |
| Documentation | Minimal |

## Git Workflow

### Branches

- `master` — stable, production-ready code
- `claude/<session-id>` — AI-assisted development branches (auto-created per session)

### Commit Conventions

Use conventional commit format:

```
<type>(<scope>): <short description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`

Examples:
```
feat(estimator): add loss calculation engine
fix(api): handle null input in estimate endpoint
docs: update CLAUDE.md with project architecture
```

### Branch Naming

- Features: `feat/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI sessions: `claude/<session-id>` (auto-managed)

## Development Guidelines for AI Assistants

### General Principles

- **Read before editing**: Always read a file before modifying it.
- **Minimal changes**: Only make changes directly requested or clearly necessary.
- **No over-engineering**: Avoid adding abstractions, helpers, or error handling for hypothetical future needs.
- **No unnecessary files**: Prefer editing existing files over creating new ones.
- **No unsolicited refactors**: Don't clean up surrounding code unless asked.
- **No comments on unchanged code**: Don't add docstrings or comments to code you didn't write or change.

### Security

- Never introduce command injection, SQL injection, XSS, or other OWASP Top 10 vulnerabilities.
- Validate input at system boundaries (user input, external APIs); trust internal code.
- Never commit secrets, credentials, or `.env` files.

### Workflow

1. Check current branch before making changes.
2. Make focused, well-scoped commits.
3. Push to the designated feature branch — never push to `master` directly.
4. Update this `CLAUDE.md` when the project structure changes significantly.

## Suggested Next Steps

As the project is built out, document the following here:

- [ ] Technology stack (language, frameworks, libraries)
- [ ] Directory structure and module responsibilities
- [ ] How to install dependencies
- [ ] How to run the application
- [ ] How to run tests
- [ ] Environment variables and configuration
- [ ] Database schema and migrations (if applicable)
- [ ] API surface (endpoints, request/response formats)
- [ ] Deployment process

## Updating This File

When you add meaningful code to this repository, update this file to reflect:

1. The actual tech stack and why it was chosen
2. Real commands for building, testing, and running the project
3. Actual directory structure with module descriptions
4. Any conventions specific to this codebase
