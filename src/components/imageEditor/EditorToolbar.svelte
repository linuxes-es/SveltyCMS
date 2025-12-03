<!--
@file: src/components/imageEditor/EditorToolbar.svelte
@component
The new single, intelligent bottom toolbar for the image editor.
It dynamically renders controls based on the active tool.
-->
<script lang="ts">
	import { imageEditorStore } from '@stores/imageEditorStore.svelte';
	import type Editor from './Editor.svelte';

	let { editorComponent }: { editorComponent: Editor | undefined } = $props();

	const toolbarControls = $derived(imageEditorStore.state.toolbarControls);
</script>

<div class="fixed bottom-0 left-0 right-0 z-10 border-t border-surface-300 bg-surface-100 p-2 shadow-lg dark:border-surface-700 dark:bg-surface-800">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
		<!-- Left: Tool-Specific Controls (Dynamic) -->
		<div class="flex h-full flex-1 items-center gap-3">
			{#if toolbarControls?.component}
				<svelte:component this={toolbarControls.component} {...toolbarControls.props} />
			{/if}
		</div>

		<!-- Right: Global Actions -->
		<div class="flex items-center gap-2">
			<button
				onclick={() => editorComponent?.handleUndo()}
				disabled={!imageEditorStore.canUndoState}
				class="btn-icon variant-ghost-surface"
				aria-label="Undo"
			>
				<iconify-icon icon="mdi:undo" width="20" />
			</button>
			<button
				onclick={() => editorComponent?.handleRedo()}
				disabled={!imageEditorStore.canRedoState}
				class="btn-icon variant-ghost-surface"
				aria-label="Redo"
			>
				<iconify-icon icon="mdi:redo" width="20" />
			</button>
			<div class="h-8 w-px bg-surface-300 dark:bg-surface-600" />
			<button onclick={() => editorComponent?.handleCancel()} class="btn variant-ghost-surface">Cancel</button>
			<button onclick={() => editorComponent?.handleSave()} class="btn variant-filled-primary">Save</button>
		</div>
	</div>
</div>
