# AGENTS.md

This file provides guidelines for AI agents working in this repository.

## Build, Test, and Lint Commands

### Common Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Run Prettier
- `npm run typecheck` - TypeScript type checking

### Testing Commands
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with Vitest UI

**Running a Single Test:**
```bash
# Vitest
npx vitest run src/components/Button.test.ts
npx vitest run --reporter=verbose src/utils/helpers.test.ts

# Jest
npx jest src/components/Button.test.ts
npx jest --testNamePattern="should handle click"

# Playwright
npx playwright test tests/login.spec.ts
npx playwright test --grep "checkout flow"
```

## Code Style Guidelines

### TypeScript
- Enable strict mode in `tsconfig.json`
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public APIs
- Avoid `any` - use `unknown` with type guards
- Use `satisfies` operator for type-safe object literals

### Imports
```typescript
// Order: Built-in → External → Internal → Relative
import fs from 'node:fs';                    // Node built-ins
import React from 'react';                   // External packages
import { Button } from '@/components';       // Absolute aliases (@/*)
import { helper } from '../utils';           // Relative imports

// Use named exports over default exports
export function Component() {}
export const utils = { ... };
```

### Naming Conventions
- `PascalCase` for components, types, interfaces, enums
- `camelCase` for variables, functions, methods, properties
- `kebab-case` for file names, CSS classes, URLs
- `UPPER_SNAKE_CASE` for constants, environment variables
- Prefix boolean variables with `is`, `has`, `should`: `isLoading`, `hasError`

### Formatting
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
- Trailing commas in multi-line objects/arrays

### Error Handling
```typescript
// Prefer explicit error types over catch (e)
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle specific error
  }
  throw error; // Re-throw if not handled
}

// Use Result/Option pattern for expected failures
function parseData(input: string): Result<Data, ParseError> {
  // ...
}
```

### Component Patterns (React/Vue)
```typescript
// Server Component (default in Next.js App Router)
async function Page() {
  const data = await fetchData();
  return <View data={data} />;
}

// Client Component (when interactivity needed)
'use client';
function InteractiveButton({ onClick }: Props) {
  const [count, setCount] = useState(0);
  return <button onClick={onClick}>{count}</button>;
}
```

## Project Structure

```
.
├── src/
│   ├── app/              # App Router routes (Next.js)
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utility functions, configs
│   ├── hooks/            # Custom React/Vue hooks
│   ├── types/            # Shared TypeScript types
│   ├── styles/           # Global styles, themes
│   └── api/              # API routes/clients
├── public/               # Static assets
├── tests/                # Test files
├── e2e/                  # End-to-end tests
└── docs/                 # Documentation
```

## Git Workflow

### Commits
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Keep commits atomic and focused
- Write commit messages in present tense: "Add feature" not "Added feature"

### Before Committing
1. Run linting: `npm run lint`
2. Run type check: `npm run typecheck`
3. Run tests: `npm test`
4. Stage changes: `git add`
5. Commit: `git commit -m "feat: add new feature"`

## AI Agent Instructions

When implementing features:
1. Check existing patterns in the codebase first
2. Follow established file naming and folder structure
3. Write tests for new functionality
4. Ensure TypeScript types are complete
5. Add error handling for async operations
6. Use existing utility functions when available
7. Respect the design system (check `design-system/` if exists)

When debugging:
1. Read relevant files before making changes
2. Check for existing error handling patterns
3. Use `console.log` or debugger for investigation
4. Remove debug code before committing
5. Consider edge cases and error scenarios

## Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Never commit `.env.local` or any file with real secrets.
