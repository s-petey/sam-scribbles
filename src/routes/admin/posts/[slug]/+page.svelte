<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

  const { form, enhance, submitting, message, reset } = superForm(data.form, {
    clearOnSubmit: 'errors-and-message',
  });

  const sortedTags = $derived(
    data.tags
      .slice()
      .sort((a, b) => (data.tags.includes(a) ? -1 : 1) - ($form.tags?.includes(b) ? -1 : 1)),
  );
</script>

<h2 class="h2">{data.meta.title}</h2>

<form method="post" use:enhance action="?/syncPost">
  <input type="hidden" name="slug" value={data.meta.slug} />
  <button
    disabled={$submitting}
    aria-disabled={$submitting}
    type="submit"
    class="btn preset-tonal-primary"
    class:disabled={$submitting}
  >
    Manually sync
  </button>
</form>

{#if $message}
  <div
    class="card preset-filled-success-500 grid grid-cols-1 items-center p-4 text-center text-lg font-bold"
  >
    {$message}
  </div>
{/if}

<div>
  <form class="flex flex-col gap-4" method="post" action="?/updateTags" use:enhance>
    <label class="label border-secondary-300-700 flex items-center rounded-lg border p-2">
      {#each $form.tags ?? [] as tag (tag)}
        <input type="hidden" name="tags" value={tag} />
      {/each}
      <div>
        <span class="label-text">Available Tags:</span>

        <div class="flex items-center">
          <div class="flex flex-wrap gap-2">
            {#each sortedTags as tag (tag)}
              <button
                class={`chip ${
                  ($form.tags ?? []).includes(tag)
                    ? 'preset-outlined-secondary-500'
                    : 'preset-outlined-surface-500'
                }`}
                type="button"
                onclick={() => {
                  if (Array.isArray($form.tags)) {
                    if ($form.tags.includes(tag)) {
                      $form.tags = $form.tags.filter((t) => t !== tag);
                    } else {
                      $form.tags = [...$form.tags, tag];
                    }
                  }
                }}
              >
                {tag}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          class="btn preset-filled-tertiary-600-400"
          onclick={() => {
            $form.tags = [];
          }}
        >
          Remove all
        </button>
      </div>
    </label>

    <div class="flex flex-row justify-evenly">
      <button
        type="button"
        class="btn preset-filled-warning-600-400"
        onclick={() => {
          reset();
        }}
        class:disabled={$submitting}
        disabled={$submitting}
      >
        Reset
      </button>

      <button
        disabled={$submitting}
        aria-disabled={$submitting}
        type="submit"
        class="btn preset-tonal-primary"
        class:disabled={$submitting}
      >
        Save
      </button>
    </div>
  </form>
</div>
