<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import Scoring from '../Scoring.svelte';
  import type { PageData } from './$types';
  import { db } from './farkleDb';

  let { data }: { data: PageData } = $props();

  let scores = $state<Record<number, Record<number, number>>>(data.scores);
  let rows = $state(data.startingRows);
  let names = $state(data.names);
  let openState = $state(false);

  let pendingSavingGame = false;

  async function addGame() {
    if (pendingSavingGame) {
      return;
    }

    pendingSavingGame = true;

    try {
      // Try to add the game
      await db.farkle.put({
        scores: JSON.parse(JSON.stringify(scores)),
        playerNames: Array.from(names),
        id: data.playerCount,
      });
    } catch (error) {
      console.error(error);
    } finally {
      pendingSavingGame = false;
    }
  }

  async function handleReset() {
    if (pendingSavingGame) {
      // TODO: Alert the user something is already saving.
      return;
    }

    pendingSavingGame = true;

    rows = 4;
    scores = Array.from({ length: data.playerCount }, () => Array.from({ length: rows }, () => 0));

    try {
      // Try to add the game
      await db.farkle.put({
        scores: JSON.parse(JSON.stringify(scores)),
        playerNames: Array.from(names),
        id: data.playerCount,
      });
    } catch (error) {
      console.error(error);
    } finally {
      pendingSavingGame = false;
    }
  }
</script>

<h1 class="h1">Farkle</h1>

<p>
  You can rename players, just click into the name and type! Game data is stored only in your
  browser session, so refreshing you can keep where you were.
</p>

<div class="rounded-lg border border-solid text-center border-primary-200-800">
  <div
    class="grid grid-cols-{data.playerCount} rounded-t-lg text-lg font-bold bg-primary-400-600 text-primary-800-200"
  >
    {#each names as name, idx}
      <input
        name="player-{idx + 1}-name"
        type="text"
        class={{
          'input border-none text-center ring-0 hover:ring-1': true,
          'rounded-tl-lg': idx === 0,
          'rounded-tr-lg': idx === data.playerCount - 1,
        }}
        onchange={(e) => (names[idx] = e.currentTarget.value)}
        value={name}
        onblur={(e) => {
          if (e.currentTarget.value === '') {
            names[idx] = `Player ${idx + 1}`;
          }

          void addGame();
        }}
      />
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

                void addGame();
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
              value={scores[count][row] || undefined}
            />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<div class="btn-group flex w-full justify-center">
  <button class="btn preset-tonal-tertiary" type="button" onclick={() => rows++}>Add Row</button>

  <button class="btn preset-filled-warning-400-600" type="button" onclick={handleReset}
    >Reset Game</button
  >

  <Modal
    bind:open={openState}
    triggerBase="btn preset-filled-secondary-400-600"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
  >
    {#snippet trigger()}
      Scoring Rules
    {/snippet}

    {#snippet content()}
      <Scoring />

      <footer class="flex justify-end gap-4">
        <button type="button" class="btn preset-tonal" onclick={() => (openState = false)}>
          Close
        </button>
      </footer>
    {/snippet}
  </Modal>
</div>
