<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<!-- TODO:  
<svelte:head>
  <title>Sam's Scribbles - personal website</title>
  <meta name="description" content="My blog and link sharing website." />
</svelte:head> -->

<p>🚧 WIP 🚧 -- {data.slug} -- please come back later!</p>
