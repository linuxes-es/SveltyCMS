<!--
@file: src/components/imageEditor/toolbars/BlurControls.svelte
@component
Controls for the Blur tool, including strength slider and pattern/shape selectors.
-->
<script lang="ts">
	import type { BlurPattern, BlurShape } from '@src/components/imageEditor/widgets/Blur/regions';

	let {
		blurStrength,
		shape,
		pattern,
		onStrengthChange,
		onShapeChange,
		onPatternChange,
		onAddRegion,
		onReset
	}: {
		blurStrength: number;
		shape: BlurShape;
		pattern: BlurPattern;
		onStrengthChange: (value: number) => void;
		onShapeChange: (value: BlurShape) => void;
		onPatternChange: (value: BlurPattern) => void;
		onAddRegion: () => void;
		onReset: () => void;
	} = $props();

	function handleStrengthInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		onStrengthChange(parseInt(target.value, 10));
	}
</script>

<div class="flex w-full items-center gap-4">
	<button onclick={onAddRegion} class="btn variant-ghost-surface" title="Add new blur region">
		<iconify-icon icon="mdi:plus-circle-outline" />
		<span>Add Region</span>
	</button>
	<div class="h-6 w-px bg-surface-300 dark:bg-surface-600" />

	<span class="text-sm">Shape:</span>
	<div class="btn-group variant-ghost-surface">
		<button
			class="btn btn-sm"
			class:active={shape === 'rectangle'}
			onclick={() => onShapeChange('rectangle')}
			title="Rectangle"
		>
			<iconify-icon icon="mdi:crop-square" />
		</button>
		<button class="btn btn-sm" class:active={shape === 'ellipse'} onclick={() => onShapeChange('ellipse')} title="Ellipse">
			<iconify-icon icon="mdi:circle-outline" />
		</button>
	</div>

	<div class="h-6 w-px bg-surface-300 dark:bg-surface-600" />

	<span class="text-sm">Pattern:</span>
	<div class="btn-group variant-ghost-surface">
		<button class="btn btn-sm" class:active={pattern === 'blur'} onclick={() => onPatternChange('blur')} title="Blur">
			<iconify-icon icon="mdi:blur" />
		</button>
		<button
			class="btn btn-sm"
			class:active={pattern === 'pixelate'}
			onclick={() => onPatternChange('pixelate')}
			title="Pixelate"
		>
			<iconify-icon icon="mdi:grid" />
		</button>
	</div>

	<div class="h-6 w-px bg-surface-300 dark:bg-surface-600" />

	<label class="flex items-center gap-2 text-sm">
		<span>{pattern === 'pixelate' ? 'Size:' : 'Strength:'}</span>
		<input
			type="range"
			min="5"
			max={pattern === 'pixelate' ? 50 : 100}
			step="1"
			value={blurStrength}
			oninput={handleStrengthInput}
			class="range range-primary w-32"
		/>
		<span class="w-8 text-right">{blurStrength}</span>
	</label>

	<div class="flex-grow" />

	<button onclick={onReset} class="btn variant-ghost-surface">
		<iconify-icon icon="mdi:restore" />
		<span>Reset All</span>
	</button>
</div>
