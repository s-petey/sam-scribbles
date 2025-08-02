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

## Error Handling

- Use Zod schemas for validation
- Database operations should handle errors gracefully
- Client-side validation with SvelteKit forms and superforms
