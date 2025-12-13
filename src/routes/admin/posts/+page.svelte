<script lang="ts">
  import { resolve } from '$app/paths';
  import { isNew } from '$lib/time';
  import { superForm } from 'sveltekit-superforms';
  import SquareX from '~icons/lucide/square-x';

  let { data } = $props();

  const {
    message,
    submitting,
    enhance,
    allErrors: allSyncErrors,
  } = superForm(
    // eslint-disable-next-line svelte/no-unused-svelte-ignore
    // svelte-ignore state_referenced_locally
    data.form,
    {
      clearOnSubmit: 'errors-and-message',
      resetForm: false,
    },
  );
  const {
    submitting: deleteSubmitting,
    enhance: deleteEnhance,
    allErrors,
  } = superForm(
    // eslint-disable-next-line svelte/no-unused-svelte-ignore
    // svelte-ignore state_referenced_locally
    data.deleteForm,
  );
</script>

<div class="grid grid-cols-2">
  <form method="post" action="?/syncPosts" use:enhance>
    <button
      disabled={$submitting}
      aria-disabled={$submitting}
      type="submit"
      class={[
        'btn transition-all',
        {
          'btn-disabled': $submitting,
          'preset-tonal-primary': !$allSyncErrors.length,
          'preset-tonal-error': $allSyncErrors.length > 0,
        },
      ]}
    >
      Sync Posts
    </button>
  </form>

  <div>
    {#if $allSyncErrors.length}
      <ul>
        {#each $allSyncErrors as error (error.path)}
          <li>
            {#each error.messages as message (message)}
              <pre>{message}</pre>
            {/each}
          </li>
        {/each}
      </ul>
    {/if}

    {#if typeof $message === 'object'}
      <h4 class="h4">Created amount: {$message.created}</h4>
      <h4 class="h4">Updated amount: {$message.updated}</h4>
    {/if}
  </div>
</div>

<h3 class="h3">Manage posts:</h3>

<form method="post" action="?/delete" class="grid grid-cols-2 gap-2" use:deleteEnhance>
  {#each data.posts as post (post.slug)}
    {@const postIsNew = isNew(post.createdAt)}
    <span class="btn-group preset-outlined-surface-200-800 grid grid-cols-5 p-2">
      <a
        href={resolve('/admin/posts/[slug]', { slug: post.slug })}
        class="btn preset-tonal-secondary hover:preset-outlined-secondary-500 col-span-3 h-full justify-start truncate"
        class:col-span-4={!postIsNew}
      >
        {post.title}
      </a>

      {#if postIsNew}
        <span class="badge preset-tonal-success col-span-1 h-full">NEW</span>
      {/if}

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
