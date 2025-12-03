<!--
@file: src/routes/(app)/imageEditor/widgets/Crop/Tool.svelte
@component
**Crop Tool "Controller"**

Orchestrates the CropRegion, handles rotations/flips,
and implements the correct 'apply' logic by setting the
imageNode's 'crop' properties.
-->
<script lang="ts">
	import { imageEditorStore } from '@stores/imageEditorStore.svelte';
	import CropControls from '@src/components/imageEditor/toolbars/CropControls.svelte';
	import CropRegion, { type CropShape } from './regions';

	let cropShape = $state<CropShape>('rectangle');
	let aspectRatio = $state('free');

	// This is the *only* region. We don't use an array for crop.
	let region = $state<CropRegion | null>(null);

	// guard to avoid duplicate event bindings
	let _toolBound = $state(false);

	// bind/unbind the tool when active state changes
	$effect(() => {
		const activeState = imageEditorStore.state.activeState;
		if (activeState === 'crop') {
			bindTool();
			imageEditorStore.setToolbarControls({
				component: CropControls,
				props: {
					cropShape,
					onRotateLeft: rotateLeft,
					onFlipHorizontal: flipHorizontal,
					onCropShapeChange: (s: CropShape) => {
						cropShape = s;
						if (s === 'square' || s === 'circular') {
							aspectRatio = '1:1';
						}
						initDefaultRegion();
					},
					onAspectRatio: (r: number | null) => {
						aspectRatio = r === null ? 'free' : `${r}`;
						if (r === 1) {
							cropShape = cropShape === 'circular' ? 'circular' : 'square';
						} else {
							cropShape = 'rectangle';
						}
						initDefaultRegion();
					},
					onApply: apply
				}
			});
		} else {
			unbindTool();
			// Only clear controls if they are ours
			if (imageEditorStore.state.toolbarControls?.component === CropControls) {
				imageEditorStore.setToolbarControls(null);
			}
		}
	});

	// add stage event listeners once
	function bindTool() {
		if (_toolBound) return;
		_toolBound = true;
		// Initialize the crop region when tool is activated
		initDefaultRegion();
	}

	// remove stage event listeners once
	function unbindTool() {
		if (!_toolBound) return;
		_toolBound = false;
		cleanup(); // Destroy region when tool is deactivated
	}

	// create a new region and wire lifecycle hooks
	function initDefaultRegion() {
		const { stage, layer, imageNode, imageGroup } = imageEditorStore.state;
		if (!stage || !layer || !imageNode || !imageGroup) return;

		// Clean up old region first
		if (region) {
			region.destroy();
			region = null;
		}

		const newRegion = new CropRegion({
			id: crypto.randomUUID(),
			layer,
			imageNode,
			imageGroup,
			init: { shape: cropShape as CropShape, aspect: aspectRatio }
		});

		// Wire event to update cutout on drag/transform
		// ** FIX 1: This is the 'desync' fix **
		newRegion.onTransform(() => {
			newRegion.updateCutout(false); // fast update, no cache
		});
		newRegion.onTransformEnd(() => {
			newRegion.updateCutout(true); // slow update, with cache
		});

		newRegion.attachTransformer();
		region = newRegion;
		layer.batchDraw();
	}

	function rotateLeft() {
		const { imageGroup, layer } = imageEditorStore.state;
		if (!imageGroup || !layer) return;

		// Get current rotation and add -90
		const currentRotation = imageGroup.rotation();
		const newRotation = (currentRotation - 90) % 360;
		imageGroup.rotation(newRotation);

		// We must also re-center the crop region
		if (region) {
			region.centerIn(imageGroup.getClientRect());
			region.updateCutout(true);
		}
		layer.batchDraw();
	}

	function flipHorizontal() {
		const { imageGroup, layer } = imageEditorStore.state;
		if (!imageGroup || !layer) return;

		imageGroup.scaleX(imageGroup.scaleX() * -1);

		// We must also re-center the crop region
		if (region) {
			region.centerIn(imageGroup.getClientRect());
			region.updateCutout(true);
		}
		layer.batchDraw();
	}

	// Non-destructive apply: simply finalizes the tool
	function apply() {
		imageEditorStore.takeSnapshot();
		imageEditorStore.setActiveState('');
	}

	// cleanup invoked by parent store
	export function cleanup() {
		if (region) {
			region.destroy();
			region = null;
		}
		imageEditorStore.state.layer?.batchDraw();
	}
	export function saveState() {
		/* state captured by parent snapshots */
	}
	export function beforeExit() {
		cleanup();
	}

	// --- Expose functions for Controls ---
	// These are now part of the props passed to setToolbarControls
</script>

<!-- Controls registered to master toolbar; no DOM toolbar here -->
