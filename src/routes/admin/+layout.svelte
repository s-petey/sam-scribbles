<script lang="ts">
	import '../../app.css';
	// import type { PageData } from './$types';
	let { data, children } = $props();
</script>

<div class="grid h-full grid-rows-[auto_1fr_auto]">
	<!-- Header -->
	<header class="grid grid-cols-2 bg-red-500 p-4">
		<h2 class="h2">Admin</h2>

		<span class="flex items-center justify-end space-x-4">
			<p>Logged in as: {data.user.username}</p>

			<form action="?/logout" method="POST">
				<button class="btn preset-tonal-primary" type="submit">Logout</button>
			</form>
		</span>
	</header>

	<!-- Page -->
	<div class="container mx-auto grid grid-cols-1 xl:grid-cols-[200px_minmax(0px,_1fr)_200px]">
		<!-- Sidebar (Left) -->
		<!-- NOTE: hidden in smaller screen sizes -->
		<aside class="sticky top-0 col-span-1 hidden h-screen bg-yellow-500 p-4 xl:block">
			(sidebar)
		</aside>
		<!-- Main -->
		<main class="col-span-1 space-y-4 bg-green-500 p-4">
			{@render children()}

			<!-- <p class="h-[512px] bg-purple-500 p-4">Paragraph 1</p>
			<p class="h-[512px] bg-purple-500 p-4">Paragraph 2</p>
			<p class="h-[512px] bg-purple-500 p-4">Paragraph 3</p> -->
		</main>
		<!-- Sidebar (Right) -->
		<!-- NOTE: hidden in smaller screen sizes -->
		<aside class="sticky top-0 col-span-1 hidden h-screen bg-yellow-500 p-4 xl:block">
			(sidebar)
		</aside>
	</div>
	<!-- Footer -->
	<footer class="bg-blue-500 p-4">(footer)</footer>
</div>
