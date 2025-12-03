<!--
@file: src/components/imageEditor/toolbars/AnnotateControls.svelte
@component
Controls for the Annotate tool: tool selection (text, arrow, shapes) and styling (colors).
-->
<script lang="ts">
	type ToolType = 'text' | 'arrow' | 'rectangle' | 'circle' | null;

	let {
		currentTool,
		strokeColor,
		fillColor,
		onSetTool,
		onStrokeColorChange,
		onFillColorChange,
		onDelete,
		onApply
	}: {
		currentTool: ToolType;
		strokeColor: string;
		fillColor: string;
		onSetTool: (tool: ToolType) => void;
		onStrokeColorChange: (color: string) => void;
		onFillColorChange: (color: string) => void;
		onDelete: () => void;
		onApply: () => void;
	} = $props();
</script>

<div class="flex w-full items-center gap-4">
	<!-- Tool Selection -->
	<div class="btn-group variant-ghost-surface">
		<button
			class="btn btn-sm"
			class:active={currentTool === 'text'}
			onclick={() => onSetTool(currentTool === 'text' ? null : 'text')}
			title="Add Text"
		>
			<iconify-icon icon="mdi:format-text" />
		</button>
		<button
			class="btn btn-sm"
			class:active={currentTool === 'arrow'}
			onclick={() => onSetTool(currentTool === 'arrow' ? null : 'arrow')}
			title="Draw Arrow"
		>
			<iconify-icon icon="mdi:arrow-top-right" />
		</button>
		<button
			class="btn btn-sm"
			class:active={currentTool === 'rectangle'}
			onclick={() => onSetTool(currentTool === 'rectangle' ? null : 'rectangle')}
			title="Draw Rectangle"
		>
			<iconify-icon icon="mdi:rectangle-outline" />
		</button>
		<button
			class="btn btn-sm"
			class:active={currentTool === 'circle'}
			onclick={() => onSetTool(currentTool === 'circle' ? null : 'circle')}
			title="Draw Circle"
		>
			<iconify-icon icon="mdi:circle-outline" />
		</button>
	</div>

	<div class="h-6 w-px bg-surface-300 dark:bg-surface-600" />

	<!-- Color Pickers -->
	<label class="flex items-center gap-2 text-sm" title="Stroke Color">
		<iconify-icon icon="mdi:water-opacity" />
		<input type="color" class="input-color" oninput={(e) => onStrokeColorChange(e.currentTarget.value)} value={strokeColor} />
	</label>
	<label class="flex items-center gap-2 text-sm" title="Fill Color">
		<iconify-icon icon="mdi:format-color-fill" />
		<input type="color" class="input-color" oninput={(e) => onFillColorChange(e.currentTarget.value)} value={fillColor} />
	</label>

	<div class="flex-grow" />

	<!-- Actions -->
	<button onclick={onDelete} class="btn variant-ghost-error">
		<iconify-icon icon="mdi:delete-outline" />
		<span>Delete</span>
	</button>
	<button class="btn variant-filled-success" onclick={onApply}>
		<iconify-icon icon="mdi:check" />
		<span>Done</span>
	</button>
</div>

<style lang="postcss">
	.input-color {
		@apply h-8 w-8 cursor-pointer appearance-none rounded-md border-none bg-transparent p-0;
	}
	.input-color::-webkit-color-swatch-wrapper {
		@apply p-0;
	}
	.input-color::-webkit-color-swatch {
		@apply rounded-md border border-surface-400;
	}
</style>
