import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { gitCommitHashPlugin } from 'vite-plugin-git-commit-hash';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
      fallback: 'index.html',
    }),
    alias: {
      $components: 'src/components',
      $models: 'src/models',
      $router: 'src/routes',
      '@': 'src',
    },
	},
  env: {
    GIT_COMMIT_HASH: {
      public: true,
    },
  },
};

export default config;
