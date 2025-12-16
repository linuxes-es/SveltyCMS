<script lang="ts">
	import { Modal } from '@skeletonlabs/skeleton-svelte';
	import { dialogState } from '@utils/dialogState.svelte';

	let open = $state(false);

	$effect(() => {
		open = dialogState.open;
	});

	function handleOpenChange(e: any) {
		dialogState.open = e.open;
	}

	function handleClose() {
		dialogState.close();
	}

	function handleConfirm() {
		dialogState.submit(true);
	}
</script>

<Modal.Root {open} onOpenChange={handleOpenChange}>
	<Modal.Content>
		<Modal.Header>
			<h2 class="h3">{dialogState.title}</h2>
		</Modal.Header>
		<Modal.Body>
			{#if dialogState.type === 'component' && dialogState.component}
				<dialogState.component {...dialogState.props} />
			{:else if dialogState.type === 'image'}
				<img src={dialogState.image} alt={dialogState.title} class="max-h-[80vh] w-auto rounded-lg" />
			{:else}
				<p>{dialogState.body}</p>
			{/if}
		</Modal.Body>
		{#if dialogState.type !== 'component' && dialogState.type !== 'image'}
			<Modal.Footer>
				<button type="button" class="btn preset-tonal" onclick={handleClose}>
					{dialogState.type === 'confirm' ? 'Cancel' : 'Close'}
				</button>
				{#if dialogState.type === 'confirm'}
					<button type="button" class="btn preset-filled-primary" onclick={handleConfirm}>Confirm</button>
				{/if}
			</Modal.Footer>
		{/if}
	</Modal.Content>
</Modal.Root>
