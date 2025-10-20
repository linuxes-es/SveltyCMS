/**
 * @file apps/setup-wizard/vite.config.ts
 * @description Vite configuration for the SveltyCMS Setup Wizard
 *
 * This is a standalone SvelteKit application that runs ONCE during initial installation.
 * It's kept separate from the main CMS to:
 * - Reduce main CMS bundle size (~96 KB gzipped savings)
 * - Isolate setup-only dependencies
 * - Enable independent deployment/versioning
 * - Improve main CMS performance
 *
 * Responsibilities:
 * - Creates blank config/private.ts if missing (for fresh installs)
 * - Opens browser to setup wizard automatically
 * - Provides setup API endpoints for configuration
 */

import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { existsSync, promises as fs } from 'fs';
import path from 'path';
import type { Plugin } from 'vite';
import { exec } from 'node:child_process';
import { platform } from 'node:os';
import tailwindcss from '@tailwindcss/vite';

// Cross-platform open URL function
function openUrl(url: string) {
	const plat = platform();
	let cmd;
	if (plat === 'win32') {
		cmd = `start "" "${url}"`;
	} else if (plat === 'darwin') {
		cmd = `open "${url}"`;
	} else {
		cmd = `xdg-open "${url}"`;
	}
	exec(cmd);
}

const CWD = process.cwd();
const WORKSPACE_ROOT = path.resolve(CWD, '../../'); // Root of NX workspace

const paths = {
	configDir: path.resolve(WORKSPACE_ROOT, 'config'),
	privateConfig: path.resolve(WORKSPACE_ROOT, 'config/private.ts')
};

// Logging utilities
const useColor = process.stdout.isTTY;
const TAG = useColor ? `\x1b[34m[Setup Wizard]\x1b[0m` : `[Setup Wizard]`;
const log = {
	info: (message: string) => console.log(`${TAG} ${message}`),
	success: (message: string) => console.log(`${TAG} ${useColor ? `✅ \x1b[32m${message}\x1b[0m` : `✅ ${message}`}`),
	warn: (message: string) => console.warn(`${TAG} ${useColor ? `⚠️ \x1b[33m${message}\x1b[0m` : `⚠️ ${message}`}`),
	error: (message: string, error?: unknown) => console.error(`${TAG} ${useColor ? `❌ \x1b[31m${message}\x1b[0m` : `❌ ${message}`}`, error ?? '')
};

/**
 * Plugin to initialize setup wizard environment
 * - Creates blank config/private.ts if missing (for fresh installs)
 * - Opens browser to setup wizard automatically
 */
function setupInitPlugin(): Plugin {
	let wasPrivateConfigMissing = false;

	return {
		name: 'sveltycms-setup-init',
		async buildStart() {
			// Check if private config exists
			wasPrivateConfigMissing = !existsSync(paths.privateConfig);

			if (wasPrivateConfigMissing) {
				log.info('No configuration found. Creating blank config/private.ts...');

				const blankConfigContent = `
/**
 * @file config/private.ts
 * @description Private configuration file containing essential bootstrap variables.
 * These values are required for the server to start and connect to the database.
 * This file will be populated during the initial setup process.
 */
import { createPrivateConfig } from '@src/databases/schemas';

export const privateEnv = createPrivateConfig({
	// --- Core Database Connection ---
	DB_TYPE: 'mongodb',
	DB_HOST: '',
	DB_PORT: 27017,
	DB_NAME: '',
	DB_USER: '',
	DB_PASSWORD: '',

	// --- Connection Behavior ---
	DB_RETRY_ATTEMPTS: 5,
	DB_RETRY_DELAY: 3000, // 3 seconds

	// --- Core Security Keys ---
	JWT_SECRET_KEY: '',
	ENCRYPTION_KEY: '',

	// --- Fundamental Architectural Mode ---
	MULTI_TENANT: false,

	/* * NOTE: All other settings (SMTP, Google OAuth, feature flags, etc.)
	 * are loaded dynamically from the database after the application starts.
	 */
});
`;

				try {
					await fs.mkdir(paths.configDir, { recursive: true });
					await fs.writeFile(paths.privateConfig, blankConfigContent);
					log.success('Created blank config/private.ts → Ready for setup wizard');
				} catch (e) {
					log.error('Failed to create config/private.ts:', e);
				}
			} else {
				log.info('Config file exists. Setup wizard ready.');
			}
		},

		configureServer(server) {
			// Only open browser if config was missing (fresh install)
			if (!wasPrivateConfigMissing) return;

			const originalListen = server.listen;
			server.listen = function (port?: number, isRestart?: boolean) {
				const result = originalListen.apply(this, [port, isRestart]);
				result.then(() => {
					setTimeout(() => {
						const address = server.httpServer?.address();
						const resolvedPort = typeof address === 'object' && address ? address.port : 5174;
						const setupUrl = `http://localhost:${resolvedPort}/setup`;

						try {
							log.info('Opening setup wizard in your browser...');
							openUrl(setupUrl);
						} catch {
							const coloredUrl = useColor ? `\x1b[34m${setupUrl}\x1b[0m` : setupUrl;
							log.info(`Please open this URL to continue setup: ${coloredUrl}`);
						}
					}, 1000);
				});
				return result;
			};
		}
	};
}

export default defineConfig({
	plugins: [
		tailwindcss(), // Tailwind v4 Vite plugin
		setupInitPlugin(), // Create blank config and open browser if needed
		sveltekit()
	],

	server: {
		port: 5174, // Different port from main CMS (5173)
		fs: { allow: ['../../'] } // Allow access to workspace root for shared packages
	},

	resolve: {
		alias: {
			// Setup wizard aliases
			'@setup': path.resolve(CWD, './src'),
			'@setup-components': path.resolve(CWD, './src/components'),
			'@setup-stores': path.resolve(CWD, './src/stores'),
			'@setup-utils': path.resolve(CWD, './src/utils'),

			// Shared workspace packages
			'@sveltycms/types': path.resolve(CWD, '../../packages/types/src'),
			'@sveltycms/ui': path.resolve(CWD, '../../packages/ui/src'),
			'@sveltycms/utils': path.resolve(CWD, '../../packages/utils/src'),

			// Access to main CMS for database utilities (needed for setup API)
			'@src': path.resolve(CWD, '../../src'),
			'@root': path.resolve(CWD, '../../'),
			'@utils': path.resolve(CWD, '../../src/utils'),
			'@databases': path.resolve(CWD, '../../src/databases')
		}
	},

	build: {
		target: 'esnext',
		outDir: './build',
		sourcemap: true,
		rollupOptions: {
			output: {
				// Simple chunking for setup wizard (runs once, optimization less critical)
				manualChunks: (id: string) => {
					if (id.includes('node_modules')) {
						// Skeleton UI
						if (id.includes('@skeletonlabs/skeleton')) {
							return 'skeleton-ui';
						}
						// Svelte ecosystem
						if (id.includes('svelte')) {
							return 'vendor-svelte';
						}
						// Validation
						if (id.includes('valibot') || id.includes('zod')) {
							return 'vendor-validation';
						}
						// Icons
						if (id.includes('iconify')) {
							return 'vendor-icons';
						}
						// Everything else
						return 'vendor';
					}
				}
			}
		}
	},

	define: {
		__SETUP_WIZARD__: true,
		global: 'globalThis'
	}
});
