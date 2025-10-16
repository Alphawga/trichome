# Coding Rules and Standards

This document outlines the coding standards and rules that must be followed throughout the project to ensure code quality, maintainability, and consistency.

## Core Rules

### 1. Type Safety
- **No use of `any` type** - Always use proper TypeScript types
- Use strict type checking and enable all TypeScript strict flags
- Prefer interfaces over types for object definitions
- Use utility types (Pick, Omit, Partial) when appropriate

### 2. DRY Principle (Don't Repeat Yourself)
- Extract common functionality into reusable utilities
- Create shared components for repeated UI patterns
- Use custom hooks for repeated logic in React components
- Centralize configuration and constants

### 3. Server-Side Rendering (SSR)
- Use SSR for pages that benefit from SEO and initial load performance
- Implement proper data fetching patterns for SSR
- Ensure components are SSR-compatible (no client-only code in render)
- Use dynamic imports for client-only components when necessary

### 4. Code Modularization
- Break down complex components into smaller, focused components
- Organize code into logical modules and directories
- Keep functions small and focused on a single responsibility
- Use proper separation of concerns (UI, business logic, data access)

### 5. Shared Schema Synchronization
- Backend and frontend must share the same API schema
- Use tRPC or similar tools to ensure type safety across the stack
- **All types must be generated from Prisma schema** - Prisma is the single source of truth for data models
- Use Prisma-generated types throughout the application (frontend and backend)
- Validate data at API boundaries using shared validation schemas (Zod with Prisma types)
- Keep API contracts in sync between client and server

## Additional Best Practices

### 6. Error Handling
- Implement proper error boundaries in React components
- Use consistent error handling patterns across the application
- Provide meaningful error messages to users
- Log errors appropriately for debugging

### 7. Performance
- Implement proper loading states and skeleton screens
- Use React.memo, useMemo, and useCallback appropriately
- Optimize bundle size with proper code splitting
- Implement proper caching strategies

### 8. Security
- Validate all user inputs on both client and server
- Implement proper authentication and authorization
- Never expose sensitive data in client-side code
- Use environment variables for configuration secrets

### 9. Testing
- Write unit tests for utility functions and hooks
- Implement integration tests for critical user flows
- Use proper mocking for external dependencies
- Maintain good test coverage

### 10. Code Style and Formatting
- Use consistent naming conventions:
  - camelCase for variables and functions
  - PascalCase for components and classes
  - kebab-case for file names (e.g., `page-name.tsx`, `user-profile.ts`)
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add JSDoc comments for public APIs

### 11. Database and API Design
- Use consistent naming conventions for database tables and columns
- Implement proper database migrations
- Design RESTful or GraphQL APIs with clear contracts
- Use proper HTTP status codes

### 12. State Management
- Use appropriate state management solutions (React state, Zustand, etc.)
- Keep global state minimal and focused
- Implement proper state normalization for complex data
- Avoid prop drilling with proper state architecture

## Enforcement

These rules should be enforced through:
- TypeScript compiler settings
- ESLint rules configuration
- Code review process
- Automated testing
- Pre-commit hooks

## Exceptions

Any exceptions to these rules must be:
- Documented with clear reasoning
- Approved through code review
- Marked with TODO comments for future refactoring if temporary