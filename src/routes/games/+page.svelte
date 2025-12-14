<script lang="ts">
  import { resolve } from '$app/paths';
  import { gamesLinks } from '$lib/siteLinks';
</script>

<svelte:head>
  <title>Sam's Scribbles - Games</title>
  <meta name="description" content="A collection of games I've re-created a web UI for." />
</svelte:head>

<h1 class="h1">Games</h1>

<nav class="m-auto w-2/3 text-center">
  <ul class="grid grid-cols-3 gap-2">
    {#each gamesLinks as { href, label } (href)}
      <li>
        <a class="anchor capitalize" href={resolve(href)}>{label}</a>
      </li>
    {/each}
  </ul>
</nav>
