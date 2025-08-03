/** @type {import('lint-staged').Configuration} */
const config = {
  '*.{mjs,cjs,js,ts,svelte}': (filenames) => [
    filenames.length > 5
      ? 'eslint --fix --max-warnings=0'
      : `eslint --fix --max-warnings=0 ${filenames.join(' ')}`,
    'prettier --write .',
  ],
  '*.{md,json,yaml,yml}': 'prettier --write .',
};

export default config;
