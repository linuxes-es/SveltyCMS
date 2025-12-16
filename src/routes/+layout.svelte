<!--
 @file src/routes/+layout.svelte
 @component
 **This Svelte component serves as the layout for the entire application**
 -->

<script lang="ts">
	// Selected theme:
	import '../app.css';
	// Register Iconify custom element globally
	import 'iconify-icon';

	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Paraglide locale bridge
	import { locales as availableLocales, getLocale, setLocale } from '@src/paraglide/runtime';
	import { systemLanguage } from '@stores/store.svelte';

	// Centralized theme management
	import { themeStore, initializeThemeStore, initializeDarkMode } from '@stores/themeStore.svelte';

	// Toast support
	import { Toast } from '@skeletonlabs/skeleton-svelte';
	import { toaster } from '@utils/toast';

	// Dialog support
	import DialogManager from '@components/system/DialogManager.svelte';
	import TokenPicker from '@components/TokenPicker.svelte';

	// Store toaster for usage in utils
	// Note: getToastContext must be called at component init.
	// But we need to pass it to the util.
	// Is getToastContext available here in root layout?
	// Usually only available UNDER the Provider.
	// So we need a component INSIDE Toast.Provider to capture the context.

	// Strategy: Create a tiny component <ToastBinder /> inside Provider?
	// OR: Just rely on importing getToastContext in components?
	// BUT we need it in async functions (utils).

	// Better: The Layout renders Toast.Provider.
	// Children can access it.
	// But showToast is imported in +page.svelte (script module code?)
	// No, +page.svelte components.

	// If I use `getToastContext` in `ModalEditForm`, it works.
	// But `showToast` is a utility function.
	// Svelte 5 context is fine in components.
	// But calling `showToast` from an async fetch handler...
	// The handler is defined inside the component, so `getToastContext` called at top level of component
	// can capture the toaster, and then the handler uses that captured toaster.

	// SO `showToast` utility needs to be passed the toaster instance?
	// OR `showToast` utility should assume it's set globally.
	// I am setting it globally in Layout but I need to be inside the Provider.

	// I'll create a component `ToastSetup.svelte` inside Provider.

	// Initialize theme and other client-side logic on mount
	onMount(() => {
		console.log('[RootLayout] Mounting...');
		initializeDarkMode();
	});

	let currentLocale = $state(getLocale());
	$effect(() => {
		const desired = systemLanguage.value;
		if (desired && availableLocales.includes(desired as any) && currentLocale !== desired) {
			setLocale(desired as any, { reload: false });
			currentLocale = desired;
		}
	});

	// Auto-refresh logic for theme
	$effect(() => {
		if (!themeStore.autoRefreshEnabled) return;

		const interval = 30 * 60 * 1000; // 30 minutes
		const intervalId = setInterval(() => {
			initializeThemeStore().catch(console.error);
		}, interval);

		return () => {
			clearInterval(intervalId);
		};
	});

	// Props
	interface Props {
		children?: import('svelte').Snippet;
	}

	const { children }: Props = $props();

	// Get the site name from data loaded in layout.server.ts
	const siteName = $derived(page.data.settings?.SITE_NAME || 'SveltyCMS');
</script>

<svelte:head>
	<title>{siteName}</title>
</svelte:head>

<!-- Toast Provider -->
<Toast.Provider {toaster}>
	{#key currentLocale}
		{@render children?.()}
	{/key}
	<TokenPicker />
	<DialogManager />
</Toast.Provider>
