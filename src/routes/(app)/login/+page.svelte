<!-- src/routes/login/+page.svelte -->
<script lang="ts">
	import type { ActionData } from './$types';

	const { form } = $props<{ form: ActionData }>();

	// function handle_submit(event: SubmitEvent) {
	// 	console.log('Form submitted');
	// 	// You can remove this prevent default later, it's just for testing
	// 	event.preventDefault();
	// 	const form = event.target as HTMLFormElement;
	// 	const email = form.email.value;
	// 	console.log('Email submitted:', email);
	// }
</script>

<h1>Login</h1>
<form method="POST">
	<input type="email" name="email" placeholder="Email" required />

	<input type="password" name="password" placeholder="Password" required />

	<button type="submit">Login</button>
</form>
