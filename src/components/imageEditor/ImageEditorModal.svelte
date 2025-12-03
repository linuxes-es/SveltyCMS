<!--
@file: src/components/imageEditor/ImageEditorModal.svelte
@component
A reusable modal that wraps the main Image Editor.
-->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { MediaImage } from '@src/utils/media/mediaModels';
	import Editor from './Editor.svelte';
	import EditorToolbar from './EditorToolbar.svelte';

	const dispatch = createEventDispatcher<{
		close: void;
		save: { dataURL: string; file: File };
	}>();

	let {
		show = $bindable(),
		image = null
	}: {
		show: boolean;
		image: MediaImage | null;
	} = $props();

	let editorComponent: Editor;

	function handleClose() {
		show = false; // Directly mutate the bindable prop
	}
</script>

{#if show && image}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-labelledby="image-editor-title"
		onkeydown={(e) => {
			if (e.key === 'Escape') handleClose();
		}}
	>
		<div class="fixed inset-0" on:click={handleClose}></div>

		<div class="relative flex h-[90vh] w-[90vw] max-w-7xl flex-col rounded-lg bg-surface-100 shadow-xl dark:bg-surface-800">
			<header class="flex items-center justify-between border-b border-surface-300 p-4 dark:border-surface-700">
				<h2 id="image-editor-title" class="text-lg font-semibold">Image Editor</h2>
				<button onclick={handleClose} class="btn-icon variant-ghost-surface" aria-label="Close">
					<iconify-icon icon="mdi:close" width="24"></iconify-icon>
				</button>
			</header>

			<main class="flex-1 overflow-auto bg-surface-50/50 dark:bg-surface-900/50">
				<Editor
					bind:this={editorComponent}
					initialImageSrc={image.url}
					mediaId={image._id}
					on:save={(e) => dispatch('save', e.detail)}
					on:cancel={handleClose}
				/>
			</main>
			<EditorToolbar {editorComponent} />
		</div>
	</div>
{/if}
