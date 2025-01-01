<script lang="ts">
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
</script>

<h1 class="text-4xl heading-font-weight">Farkle</h1>

<div class="rounded-lg border border-solid text-center border-primary-200-800">
  <div
    class="grid grid-cols-{data.playerCount} rounded-t-lg text-lg font-bold bg-primary-400-600 text-primary-800-200"
  >
    <!-- class="mb-4 grid grid-cols-subgrid text-lg font-bold col-span-{data.playerCount} rounded-t-lg bg-primary-400-600 text-primary-800-200" -->
    {#each { length: data.playerCount }, count}
      <div class="">
        Player {count + 1}
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

  <!-- TODO: I think I want to render this inversely / allow new rows at the top and
   show which round number it is counting up
    -->

  <div class="grid gap-4 grid-cols-{data.playerCount} max-h-52 overflow-y-auto py-4">
    {#each { length: rows }, row}
      {#each { length: data.playerCount }, count}
        <div class="m-auto w-2/3 shadow shadow-secondary-200-800 hover:shadow-secondary-800-200">
          <input
            oninput={(e) => {
              const value = e.currentTarget.value;
              const score = Number.isNaN(Number(value)) ? 0 : Number(value);
              console.log({ scores });
              scores[count][row] = score;

              if (rows === row + 1) {
                rows++;
              }
            }}
            name="player-{count + 1}"
            type="number"
            class="input"
            step="50"
            min="0"
          />
        </div>
      {/each}
    {/each}
  </div>
</div>

<button class="btn m-auto mt-4 w-full preset-tonal-tertiary" type="button" onclick={() => rows++}>
  Add Row
</button>
