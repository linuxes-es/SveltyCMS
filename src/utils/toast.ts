/**
 * @file src/utils/toast.ts
 * Centralized toast utility for consistent notifications across modals/components.
 */

import { createToaster } from '@skeletonlabs/skeleton-svelte';
import { get } from 'svelte/store';

// Create global toaster instance
export const toaster = createToaster();

export type ToastSettings = {
	message: string;
	background?: string;
	classes?: string;
	timeout?: number;
};

// Shim to replace old ToastStore
export function showToast(messageOrSettings: string | ToastSettings, style?: string, _customDuration?: number) {
	let message = '';
	let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	// Note: customDuration parameter kept for backward compatibility but not used
	// Skeleton v4 toaster doesn't support per-toast duration configuration

	if (typeof messageOrSettings === 'string') {
		message = messageOrSettings;
		if (style === 'error' || style?.includes('error')) type = 'error';
		if (style === 'success' || style?.includes('success')) type = 'success';
		if (style === 'warning' || style?.includes('warning')) type = 'warning';
	} else {
		message = messageOrSettings.message;
		if (messageOrSettings.background?.includes('error') || messageOrSettings.classes?.includes('error')) type = 'error';
		// messageOrSettings.timeout is also ignored in v4
	}

	// Skeleton v4 toaster - cast to writable to access set method
	const currentToasts = get(toaster);
	(toaster as any).set([...currentToasts, { id: Date.now().toString(), type, message }]);
}

// Minimal compat export - no longer used by layout but kept for other legacy usages if any
export const toastStore = {
	trigger: (t: ToastSettings) => showToast(t)
};
