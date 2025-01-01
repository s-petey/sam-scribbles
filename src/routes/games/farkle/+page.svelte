<script lang="ts">
  import { route } from '$lib/ROUTES';
  import Scoring from './Scoring.svelte';
</script>

<h1 class="h1">Farkle</h1>

<h3 class="h3">How many players?</h3>

<div class="m-auto grid w-1/2 grid-cols-3 gap-4">
  {#each { length: 12 }, count}
    {#if count > 0}
      <a
        class="btn-icon m-auto rounded-sm p-4 preset-tonal-primary"
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
