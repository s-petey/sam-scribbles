# https://sam-peterson.com

## Work in progress 30-10-2024

A blog and link sharing service made with [SvelteKit], [DrizzleORM], [zod], MDSveX, [Skeleton] (next), and Tailwind.

This site wouldn't exist without the inspiration and insight of [Sergio Xalambrí] and [Scott Spence]. Both had their own work and efforts which influenced how this site has been designed and developed.

## Details

This project leverages [Bun] as its runtime, so some of the scripts may look a little funny with the `--bun` prefix. There are your typical commands for `dev`, `build`, and `preview`. There are a few helpers for the db prefixed with `db`.

This project is intended to be deployed to a [Bun] process using docker / docker compose.

## Git Hooks (Husky + lint-staged)

This repo uses [Husky](https://typicode.github.io/husky) for Git hooks and [lint-staged](https://github.com/okonet/lint-staged) to run linters on pre-committed files.

- **Pre-commit:** Runs strict linting and prettier.
- **Pre-push:** Runs check and test.

## Works in progress

- [ ] Testing
- [ ] User access (auth / relations / interactions)
- [ ] View counts, sharing links
- [ ] Blog posts
- [ ] And more!

<!-- Links -->

[sergio xalambrí]: https://github.com/sergiodxa
[scott spence]: https://github.com/spences10
[bun]: https://bun.sh/
[sveltekit]: https://svelte.dev/
[drizzleorm]: https://orm.drizzle.team/
[zod]: https://zod.dev/
[skeleton]: https://next.skeleton.dev/
