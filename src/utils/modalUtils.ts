import { dialogState } from './dialogState.svelte';
import type { Component } from 'svelte';

export type ModalSettings = {
	type: 'alert' | 'confirm' | 'component';
	title?: string;
	body?: string;
	component?: {
		ref: Component;
		props?: Record<string, any>;
	};
	response?: (r: any) => void;
	image?: string; // Legacy support
};

export type ModalComponent = {
	ref: Component;
	props?: Record<string, any>;
};

// Shim for getModalStore
export function getModalStore() {
	return {
		trigger: (settings: ModalSettings) => {
			if (settings.type === 'confirm') {
				dialogState.showConfirm({
					title: settings.title || '',
					body: settings.body || '',
					onConfirm: settings.response || (() => {})
				});
			} else if (settings.type === 'component' && settings.component) {
				dialogState.showComponent({
					component: settings.component.ref,
					props: settings.component.props,
					response: settings.response
				});
			} else if (settings.image) {
				// Legacy image modal support if needed, map to image type
				dialogState.showImage(settings.image, settings.title || '');
			} else {
				dialogState.showAlert(settings.title || '', settings.body || '');
			}
		},
		close: () => {
			dialogState.close();
		},
		clear: () => {
			dialogState.close();
		}
	};
}
