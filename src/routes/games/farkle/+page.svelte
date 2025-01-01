<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1 class="text-4xl heading-font-weight">Farkle</h1>

<h2 class="text-3xl heading-font-weight">How many players?</h2>

<div class="m-auto grid w-1/2 grid-cols-3 gap-4">
  {#each { length: 12 }, count}
    {#if count > 0}
      <a
        class="btn-icon m-auto rounded-sm p-4 preset-tonal-primary"
        href="/games/farkle/{count + 1}">{count + 1}</a
      >
    {/if}
  {/each}
</div>
