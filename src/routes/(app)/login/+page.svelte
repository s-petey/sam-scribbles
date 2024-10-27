<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	const { data } = $props();

	const { form, enhance, errors, constraints } = superForm(data.form);
</script>

<h1>Login</h1>

<form method="post" use:enhance>
	<input
		type="email"
		name="email"
		placeholder="Email"
		aria-invalid={$errors.email ? 'true' : undefined}
		bind:value={$form.email}
		{...$constraints.email}
	/>
	{#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}

	<input
		type="password"
		name="password"
		placeholder="Password"
		aria-invalid={$errors.password ? 'true' : undefined}
		bind:value={$form.password}
		{...$constraints.password}
	/>
	{#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}

	<button type="submit">Login</button>
</form>
