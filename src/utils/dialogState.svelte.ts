import { type Component } from 'svelte';

export type DialogState = {
	open: boolean;
	title?: string;
	body?: string;
	component?: Component;
	props?: Record<string, any>;
	response?: (r: any) => void;
	image?: string;
	type: 'alert' | 'confirm' | 'component' | 'image';
};

function createDialogState() {
	let state = $state<DialogState>({
		open: false,
		title: '',
		body: '',
		type: 'alert'
	});

	function reset() {
		state.open = false;
		state.title = '';
		state.body = '';
		state.component = undefined;
		state.props = undefined;
		state.response = undefined;
		state.image = undefined;
		state.type = 'alert';
	}

	return {
		get open() {
			return state.open;
		},
		set open(v) {
			state.open = v;
		},
		get title() {
			return state.title;
		},
		get body() {
			return state.body;
		},
		get component() {
			return state.component;
		},
		get props() {
			return state.props;
		},
		get type() {
			return state.type;
		},
		get image() {
			return state.image;
		},
		showAlert(title: string, body: string) {
			state.title = title;
			state.body = body;
			state.type = 'alert';
			state.open = true;
		},
		showConfirm({ title, body, onConfirm }: { title: string; body: string; onConfirm: (r: boolean) => void }) {
			state.title = title;
			state.body = body;
			state.type = 'confirm';
			state.response = onConfirm;
			state.open = true;
		},
		showComponent({ component, props = {}, response }: { component: Component; props?: Record<string, any>; response?: (r: any) => void }) {
			state.component = component;
			state.props = props;
			state.type = 'component';
			state.response = response;
			state.open = true;
		},
		showImage(src: string, alt: string) {
			state.image = src;
			state.title = alt;
			state.type = 'image';
			state.open = true;
		},
		close() {
			state.open = false;
			setTimeout(reset, 300); // Wait for animation
		},
		submit(value: any) {
			if (state.response) {
				state.response(value);
			}
			this.close();
		}
	};
}

export const dialogState = createDialogState();
