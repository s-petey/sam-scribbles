<script lang="ts">
	import { socialLinks } from '$lib/siteLinks';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
</script>

<nav class="flex flex-col items-center gap-2">
	{#each socialLinks as link}
		<a class="anchor hover:underline" href={link.href} title={link.label} target="_blank">
			{link.label}
		</a>
	{/each}
</nav>
