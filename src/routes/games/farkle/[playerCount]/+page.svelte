<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import Scoring from '../Scoring.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let scores = $state<Record<number, Record<number, number>>>(
    Object.fromEntries(
      Array.from({ length: data.playerCount }).map((_, i) => [
        i,
        Object.fromEntries(Array.from({ length: data.startingRows }).map((_, j) => [j, 0])),
      ]),
    ),
  );

  let rows = $state(data.startingRows);
  let names = $state(Array.from({ length: data.playerCount }).map((_, i) => `Player ${i + 1}`));

  let openState = $state(false);
</script>

<h1 class="h1">Farkle</h1>

<span>You can rename players, just click into the name and type!</span>

<div class="rounded-lg border border-solid text-center border-primary-200-800">
  <div
    class="grid grid-cols-{data.playerCount} rounded-t-lg text-lg font-bold bg-primary-400-600 text-primary-800-200"
  >
    <!-- class="mb-4 grid grid-cols-subgrid text-lg font-bold col-span-{data.playerCount} rounded-t-lg bg-primary-400-600 text-primary-800-200" -->
    {#each names as _name, idx}
      <div class="">
        <!-- On hover show an edit name button -->
        <input
          name="player-{idx + 1}-name"
          type="text"
          class={{
            'input border-none text-center ring-0': true,
            'rounded-tl-lg': idx === 0,
            'rounded-tr-lg': idx === data.playerCount - 1,
          }}
          bind:value={names[idx]}
        />
      </div>
    {/each}

    {#each { length: data.playerCount }, count}
      <div
        class={{
          'text-success-700-300':
            scores[count] &&
            Object.entries(scores ?? {}).every(([key, subScore]) => {
              if (key === count.toString()) {
                return true;
              }

              const other = Object.values(subScore ?? {}).reduce((a, b) => a + b, 0);
              const curr = Object.values(scores[count]).reduce((a, b) => a + b, 0);

              return other < curr;
            }),
        }}
      >
        Total: {Object.values(scores[count] ?? {})
          .reduce((a, b) => a + b, 0)
          .toLocaleString()}
      </div>
    {/each}
  </div>

  <div
    class="grid gap-4 grid-cols-{data.playerCount} max-h-[360px] overflow-y-auto py-4 md:max-h-[600px]"
  >
    {#each { length: rows }, row}
      <div class="grid grid-cols-subgrid col-span-{data.playerCount}">
        {#each { length: data.playerCount }, count}
          <div class="m-auto flex w-2/3 flex-row items-center justify-center gap-2">
            {#if count === 0}
              {row + 1}
            {/if}
            <input
              onwheel={(e) => {
                e.preventDefault();
                return false;
              }}
              oninput={(e) => {
                const value = e.currentTarget.value;
                const score = Number.isNaN(Number(value)) ? 0 : Number(value);
                scores[count][row] = score;

                if (rows === row + 1) {
                  rows++;
                }
              }}
              name="player-{count + 1}"
              type="number"
              class={{
                'input shadow shadow-secondary-200-800 hover:shadow-secondary-800-200': true,
                'border border-solid border-error-500 shadow-none':
                  scores[count][row] > 0 && scores[count][row] < 50,
              }}
              step="50"
              min="0"
            />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<div class="btn btn-group">
  <button class="btn preset-tonal-tertiary" type="button" onclick={() => rows++}> Add Row </button>

  <Modal
    bind:open={openState}
    triggerBase="btn preset-filled-secondary-400-600"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  >
    {#snippet trigger()}
      Show Scoring
    {/snippet}

    {#snippet content()}
      <Scoring />

      <footer class="flex justify-end gap-4">
        <button type="button" class="btn preset-tonal" onclick={() => (openState = false)}
          >Close</button
        >
      </footer>
    {/snippet}
  </Modal>
</div>
