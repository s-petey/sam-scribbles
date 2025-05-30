<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import LucideCircleX from '~icons/lucide/circle-x';

  let { data } = $props();

  const { enhance, submitting, message, reset } = superForm(data.form, {
    clearOnSubmit: 'errors-and-message',
  });
</script>

<svelte:head>
  <title>Admin - {data.meta.title}</title>
  <meta name="description" content="Manage the post details." />
</svelte:head>

<section class="card preset-outlined-primary-500 p-4">
  <h2 class="h3">{data.meta.title}</h2>

  <p class="text-lg font-bold">Reading Time: {Math.round(data.post.readingTimeSeconds / 60)}</p>
  <p class="text-lg font-bold">Word count: {data.post.readingTimeWords}</p>
  <p class="text-sm">Created on: {data.post.createdAt.toLocaleString()}</p>
  <p class="text-sm">Updated on: {data.post.updatedAt.toLocaleString()}</p>

  <div class="flex flex-wrap items-center justify-start">
    {#each data.post.tags as tag (tag.tag)}
      <span class="chip preset-outlined-secondary-500 m-1">{tag.tag}</span>
    {/each}
  </div>
</section>

<form method="post" use:enhance>
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
    class="card preset-filled-success-500 flex w-xs flex-row items-center justify-evenly p-4 text-center text-lg font-bold"
  >
    {$message}
    <button
      class="btn btn-icon preset-filled-error-500 h-6 w-6 text-2xl font-bold"
      onclick={() => reset()}
    >
      <LucideCircleX />
    </button>
  </div>
{/if}
