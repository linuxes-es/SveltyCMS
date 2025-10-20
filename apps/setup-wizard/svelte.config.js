import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build'
		}),
		alias: {
			'@setup': './src',
			'@setup-components': './src/components',
			'@setup-stores': './src/stores',
			'@setup-utils': './src/utils',
			'@sveltycms/types': '../../packages/types/src',
			'@sveltycms/ui': '../../packages/ui/src',
			'@sveltycms/utils': '../../packages/utils/src',
			'@src': '../../src',
			'@root': '../../',
			'@utils': '../../src/utils',
			'@databases': '../../src/databases'
		}
	}
};

export default config;
