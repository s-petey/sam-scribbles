# Sam Scribbles - Agent Guidelines

## Build/Test/Lint Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Type check with svelte-check
- `npm run test` - Run all tests with Vitest
- `npm run test:unit` - Run tests in watch mode
- `npm run lint` - ESLint + Prettier check
- `npm run fix` - Auto-fix ESLint + Prettier issues

## Code Style

- Use single quotes, 100 char line width (Prettier config)
- TypeScript strict mode with consistent type imports (`import type { ... }`)
- Svelte 5 runes syntax (`$state`, `$props`, `$derived`)
- Component props destructuring: `let { prop }: { prop: Type } = $props()`
- Database: Drizzle ORM with PostgreSQL, prefixed tables (`scribbles_`)
- File naming: kebab-case for routes, PascalCase for components
- Imports: `~icons/` for icons, `$lib/` for internal modules

## Component System - Skeleton UI

- Uses Skeleton v3.1.5 design system with Tailwind CSS v4.1.11
- Framework: Utility-first, semantic HTML with native browser APIs
- Additional Tailwind plugins: @tailwindcss/forms, @tailwindcss/typography
- Component categories:
  - **Tailwind Components**: Badges, Buttons, Cards, Chips, Dividers, Forms/Inputs, Tables
  - **Functional Components**: Accordion, App Bar, Avatar, Navigation, Pagination, Progress, Tabs, Toast, etc.
  - **Headless Components**: Integration with Bits UI, Melt UI, Radix UI
- Theme system: Adaptive themes via [Skeleton theme generator](https://themes.skeleton.dev/)
- Philosophy: Native-first, opt-in by default, framework agnostic core
- Documentation: https://www.skeleton.dev/docs/get-started/introduction

## Error Handling

- Use Zod schemas for validation
- Database operations should handle errors gracefully
- Client-side validation with SvelteKit forms and superforms
