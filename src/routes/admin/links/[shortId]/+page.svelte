<script lang="ts">
  import { TagsInput } from '@skeletonlabs/skeleton-svelte';
  import DeleteIcon from 'lucide-svelte/icons/circle-x';
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

  const { form, enhance, constraints, errors, submitting } = superForm(data.form, {
    // Prevent the tags from being de-selected
    resetForm: false,
  });
</script>

<h2 class="h2">{$form.link}</h2>

<form use:enhance method="post" action="?/update">
  <input class="input" name="link" bind:value={$form.link} {...$constraints.link} />

  <TagsInput
    onValueChange={(e) => {
      $form.tags = e.value;
    }}
    value={$form.tags}
    placeholder="Tags"
  >
    {#snippet buttonDelete()}
      <DeleteIcon class="size-4" />
    {/snippet}
  </TagsInput>

  <div class="col-span-2">
    <div class="flex items-center space-x-2">Available Tags:</div>

    <!-- 
    ---- This is a work-around as the `TagsInput` above doesn't pass 
    ---- `name` properly or render them for a form input.
    --->
    {#each $form.tags as tag (tag)}
      <input type="hidden" name="tags" value={tag} />
    {/each}

    <div class="flex gap-2">
      {#each data.tags as tag (tag)}
        <button
          class={`chip ${
            ($form.tags ?? []).includes(tag)
              ? 'preset-outlined-secondary-500'
              : 'preset-outlined-surface-500'
          }`}
          type="button"
          onclick={() => {
            if ($form.tags?.includes(tag)) {
              $form.tags = $form.tags.filter((t) => t !== tag);
            } else {
              $form.tags = [...($form.tags ?? []), tag];
            }
          }}
        >
          {tag}
        </button>
      {/each}
    </div>

    {#if $errors.tags}
      <span class="invalid">{$errors.tags}</span>
    {/if}
  </div>

  <button
    disabled={$submitting}
    aria-disabled={$submitting}
    type="submit"
    class="btn preset-tonal-primary mt-4"
    class:disabled={$submitting}
  >
    Save
  </button>

  <button
    disabled={$submitting}
    aria-disabled={$submitting}
    type="submit"
    class="btn preset-tonal-error mt-4"
    class:disabled={$submitting}
    formaction="?/delete"
  >
    Delete
  </button>
</form>
