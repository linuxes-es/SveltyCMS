import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

export type PopupSettings = {
	event: 'click' | 'hover' | 'focus-blur' | 'focus-click';
	target: string;
	placement?: 'top' | 'bottom' | 'left' | 'right';
	closeQuery?: string;
	middleware?: any;
	state?: (e: { state: boolean }) => void;
};

// Simplified popup action shim
export function popup(node: HTMLElement, args: PopupSettings) {
	const { event = 'click', target, placement = 'bottom' } = args;
	const popupElem = document.querySelector(`[data-popup="${target}"]`) as HTMLElement;

	if (!popupElem) return;

	let cleanup: (() => void) | undefined;

	function update() {
		if (!popupElem) return;
		computePosition(node, popupElem, {
			placement,
			middleware: [offset(8), flip(), shift({ padding: 5 }), arrow({ element: null })]
		}).then(({ x, y }) => {
			Object.assign(popupElem.style, {
				left: `${x}px`,
				top: `${y}px`
			});
		});
	}

	function show() {
		if (!popupElem) return;
		popupElem.style.display = 'block';
		cleanup = autoUpdate(node, popupElem, update);
	}

	function hide() {
		if (!popupElem) return;
		popupElem.style.display = 'none';
		if (cleanup) cleanup();
	}

	function toggle() {
		if (popupElem.style.display === 'block') {
			hide();
		} else {
			show();
		}
	}

	node.addEventListener('click', toggle);

	return {
		destroy() {
			node.removeEventListener('click', toggle);
			if (cleanup) cleanup();
		}
	};
}
