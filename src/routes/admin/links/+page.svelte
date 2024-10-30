<script lang="ts">
	import Eraser from 'lucide-svelte/icons/eraser';
	import SqurePlus from 'lucide-svelte/icons/square-plus';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	const { form, enhance, constraints, errors, reset, submitting } = superForm(data.form);
</script>

<form class="grid grid-cols-2 gap-4" action="?/create" method="POST" use:enhance>
	<header class="col-span-2">
		<h2 class="h2">Add a link</h2>
	</header>

	<div>
		<input
			name="link"
			class="input"
			placeholder="Link"
			aria-label="Link"
			aria-invalid={$errors.link ? 'true' : undefined}
			bind:value={$form.link}
			{...$constraints.link}
		/>
		{#if $errors.link}
			<span class="invalid">{$errors.link}</span>
		{/if}
	</div>

	<div>
		<label class="flex items-center space-x-2">
			<input
				type="checkbox"
				class="checkbox"
				name="private"
				placeholder="Private"
				aria-label="Private"
				aria-invalid={$errors.private ? 'true' : undefined}
				bind:checked={$form.private}
				{...$constraints.private}
			/>
			<p>Private</p>
		</label>
		{#if $errors.private}
			<span class="invalid">{$errors.private}</span>
		{/if}
	</div>

	<button
		type="submit"
		class="btn preset-tonal-success"
		class:disabled={$submitting}
		disabled={$submitting}
	>
		<SqurePlus />
	</button>
	<button
		type="button"
		class="btn preset-tonal-warning"
		onclick={() => reset()}
		class:disabled={$submitting}
		disabled={$submitting}
	>
		<Eraser />
	</button>
</form>

<h3 class="h3">View Links</h3>

<div class="table-wrap">
	<table class="table">
		<thead>
			<tr>
				<th class="whitespace-nowrap">Link</th>
				<th class="whitespace-nowrap">Private</th>
			</tr>
		</thead>
		<tbody class="hover:[&>tr]:preset-tonal-primary">
			{#each data.links as link}
				<tr>
					<td>{link.link}</td>
					<td>{link.private}</td>
				</tr>
			{/each}
		</tbody><tfoot>
			<tr>
				<td colspan="3">Total</td>
				<td class="text-right">{data.links.length} Elements</td>
			</tr>
		</tfoot>
	</table>
</div>
