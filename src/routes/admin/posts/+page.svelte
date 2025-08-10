<script lang="ts">
  import SquareX from '~icons/lucide/square-x';
  import { superForm } from 'sveltekit-superforms';
  import { resolve } from '$app/paths';

  let { data } = $props();

  const { message, submitting, enhance } = superForm(data.form, {
    clearOnSubmit: 'errors-and-message',
    resetForm: false,
  });
  const {
    submitting: deleteSubmitting,
    enhance: deleteEnhance,
    allErrors,
  } = superForm(data.deleteForm);
</script>

<div class="grid grid-cols-2">
  <form method="post" action="?/syncPosts" use:enhance>
    <button
      disabled={$submitting}
      aria-disabled={$submitting}
      type="submit"
      class="btn preset-tonal-primary"
      class:disabled={$submitting}
    >
      Sync Posts
    </button>
  </form>

  <div>
    {#if typeof $message === 'object'}
      <h4 class="h4">Created amount: {$message.created}</h4>
      <h4 class="h4">Updated amount: {$message.updated}</h4>
    {/if}
  </div>
</div>

<h3 class="h3">Manage posts:</h3>

<form method="post" action="?/delete" class="grid grid-cols-2 gap-2" use:deleteEnhance>
  {#each data.posts as post (post.slug)}
    <span class="btn-group preset-outlined-surface-200-800 grid grid-cols-4 p-2">
      <a
        href={resolve('/admin/posts/[slug]', { slug: post.slug })}
        class="btn preset-tonal-secondary hover:preset-outlined-secondary-500 col-span-3 justify-start truncate"
      >
        {post.title}
      </a>
      <button
        type="submit"
        name="slug"
        disabled={$deleteSubmitting}
        aria-disabled={$deleteSubmitting}
        value={post.slug}
        class="btn preset-tonal-error hover:preset-outlined-error-500"
        class:disabled={$deleteSubmitting}
      >
        <SquareX class="text-2xl" />
      </button>
      {#if $allErrors?.flatMap((error) => error.messages).includes(post.slug)}
        <span class="text-error-500 col-span-4 font-bold">
          There is still a markdown file for this!!!
        </span>
      {/if}
    </span>
  {/each}
</form>
