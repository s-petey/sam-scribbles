<script lang="ts">
  import { route } from '$lib/ROUTES';
  import Scoring from './Scoring.svelte';
</script>

<h1 class="h1">Farkle</h1>

<h3 class="h3">How many players?</h3>

<div class="m-auto grid w-1/2 grid-cols-3 gap-4">
  {#each { length: 12 }, count (count)}
    {#if count > 0}
      <a
        class="btn-icon preset-tonal-primary m-auto rounded-xs p-4"
        href={route('/games/farkle/[playerCount]', {
          playerCount: count + 1,
        })}
      >
        {count + 1}
      </a>
    {/if}
  {/each}
</div>

<Scoring />
