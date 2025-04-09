import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { execSync } from 'child_process';

const VITE_GIT_COMMIT_HASH = (() => {
  return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).toString().trim();
})();

const ENV = {
  ...loadEnv('', process.cwd()),
  VITE_GIT_COMMIT_HASH,
}

process.env = {
  ...process.env,
  ...ENV,
};

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills()]
});
