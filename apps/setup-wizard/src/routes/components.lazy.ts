/**
 * @file src/routes/setup/components.lazy.ts
 * @description Lazy-loaded setup wizard components
 *
 * Setup wizard is used ONLY ONCE during initial installation.
 * By lazy-loading all setup components, we keep them out of the main bundle
 * and only load them when the setup route is accessed.
 *
 * @optimization Bundle size: ~50-80 KB of setup code lazy-loaded
 */

/**
 * Lazy load all setup wizard components dynamically
 * Only called when user navigates to /setup route
 */
export async function loadSetupComponents() {
	const [WelcomeModal, DatabaseConfig, AdminConfig, EmailConfig, SystemConfig, ReviewConfig, ConnectionStatus] = await Promise.all([
		import('./WelcomeModal.svelte').then((m) => m.default),
		import('./DatabaseConfig.svelte').then((m) => m.default),
		import('./AdminConfig.svelte').then((m) => m.default),
		import('./EmailConfig.svelte').then((m) => m.default),
		import('./SystemConfig.svelte').then((m) => m.default),
		import('./ReviewConfig.svelte').then((m) => m.default),
		import('./ConnectionStatus.svelte').then((m) => m.default)
	]);

	return {
		WelcomeModal,
		DatabaseConfig,
		AdminConfig,
		EmailConfig,
		SystemConfig,
		ReviewConfig,
		ConnectionStatus
	};
}

/**
 * Type exports for backwards compatibility
 */
export type SetupComponents = Awaited<ReturnType<typeof loadSetupComponents>>;
