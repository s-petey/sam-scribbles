<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import Scoring from '../Scoring.svelte';
  import type { PageData } from './$types';
  import { db, type FarkleGame } from './farkleDb';

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
    const newScores: FarkleGame['scores'] = Object.fromEntries(
      Array.from({ length: data.playerCount }).map((_, i) => [
        i,
        Object.fromEntries(Array.from({ length: rows }).map((_, j) => [j, 0])),
      ]),
    );

    scores = newScores;

    try {
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

<div class="border-primary-200-800 rounded-lg border border-solid text-center">
  <div
    class={{
      'bg-primary-400-600 text-primary-800-200 grid rounded-t-lg text-lg font-bold': true,
      'grid-cols-2': data.playerCount === 2,
      'grid-cols-3': data.playerCount === 3,
      'grid-cols-4': data.playerCount === 4,
      'grid-cols-5': data.playerCount === 5,
      'grid-cols-6': data.playerCount === 6,
      'grid-cols-7': data.playerCount === 7,
      'grid-cols-8': data.playerCount === 8,
      'grid-cols-9': data.playerCount === 9,
      'grid-cols-10': data.playerCount === 10,
      'grid-cols-11': data.playerCount === 11,
      'grid-cols-12': data.playerCount === 12,
    }}
  >
    {#each names as name, idx (idx)}
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

    {#each { length: data.playerCount }, count (count)}
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
    class={{
      'grid max-h-[360px] gap-4 overflow-y-auto py-4 md:max-h-[600px]': true,
      'grid-cols-2': data.playerCount === 2,
      'grid-cols-3': data.playerCount === 3,
      'grid-cols-4': data.playerCount === 4,
      'grid-cols-5': data.playerCount === 5,
      'grid-cols-6': data.playerCount === 6,
      'grid-cols-7': data.playerCount === 7,
      'grid-cols-8': data.playerCount === 8,
      'grid-cols-9': data.playerCount === 9,
      'grid-cols-10': data.playerCount === 10,
      'grid-cols-11': data.playerCount === 11,
      'grid-cols-12': data.playerCount === 12,
    }}
  >
    {#each { length: rows }, row (row)}
      {#each { length: data.playerCount }, count (count)}
        <div class="m-auto flex flex-row items-center justify-center gap-2">
          <!-- TODO: Add row numbers -->
          <!-- {#if count === 0}
            <span class="ml-4">
              {row + 1}
            </span>
          {/if} -->

          <input
            id="row-{row}-player-{count + 1}"
            onwheel={(e) => {
              e.preventDefault();
              return false;
            }}
            value={scores[count][row] || undefined}
            name="player-{count + 1}"
            type="number"
            class={{
              'input shadow-secondary-200-800 hover:shadow-secondary-800-200 shadow-sm': true,
              'border-error-500 border border-solid shadow-none':
                scores[count][row] > 0 && scores[count][row] < 50,
            }}
            step="50"
            min="0"
            oninput={(e) => {
              const value = e.currentTarget.value;
              const score = Number.isNaN(Number(value)) ? 0 : Number(value);
              scores[count][row] = score;

              if (rows === row + 1) {
                rows++;
              }

              void addGame();
            }}
          />
        </div>
      {/each}
    {/each}
  </div>
</div>

<div class="btn-group flex w-full justify-center">
  <button class="btn preset-tonal-tertiary" type="button" onclick={() => rows++}>Add Row</button>

  <button class="btn preset-filled-warning-400-600" type="button" onclick={handleReset}
    >Reset Game</button
  >

  <Modal
    open={openState}
    onOpenChange={({ open }) => (openState = open)}
    triggerBase="btn preset-filled-secondary-400-600"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
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
