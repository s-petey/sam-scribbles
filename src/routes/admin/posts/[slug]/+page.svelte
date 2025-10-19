<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { isNew } from '$lib/time';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
  import { DateTime } from 'effect';
  import type { FormEventHandler } from 'svelte/elements';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { superForm } from 'sveltekit-superforms';
  import LucideArrowLeft from '~icons/lucide/arrow-left';
  import LucideArrowRight from '~icons/lucide/arrow-right';
  import LucideChevronLeft from '~icons/lucide/chevron-left';
  import LucideChevronRight from '~icons/lucide/chevron-right';
  import LucideCircleX from '~icons/lucide/circle-x';
  import LucideEllipsis from '~icons/lucide/ellipsis';

  let { data } = $props();

  const { enhance, submitting, message, reset } = superForm(data.form, {
    clearOnSubmit: 'errors-and-message',
  });

  const {
    form: relatedPostsForm,
    enhance: relatedPostsEnhance,
    submitting: relatedPostsSubmitting,
    message: relatedPostsMessage,
    reset: relatedPostsReset,
    isTainted,
    tainted,
  } = superForm(data.relatedPostsForm, {
    clearOnSubmit: 'errors-and-message',
    invalidateAll: 'pessimistic',
  });

  const { derivedRelatedPosts, derivedAvailablePosts } = $derived.by(() => {
    const availablePosts: typeof data.combinedPosts = [];
    const relatedPosts: typeof data.combinedPosts = [];

    for (const post of data.combinedPosts) {
      if (
        $relatedPostsForm.relatedPostIds.includes(post.id) &&
        relatedPosts.filter((p) => p.id === post.id).length === 0
      ) {
        relatedPosts.push(post);
      }

      if (
        !$relatedPostsForm.relatedPostIds.includes(post.id) &&
        availablePosts.filter((p) => p.id === post.id).length === 0
      ) {
        availablePosts.push(post);
      }
    }

    return {
      derivedRelatedPosts: relatedPosts,
      derivedAvailablePosts: availablePosts,
    };
  });

  const handleSearchChange: FormEventHandler<HTMLInputElement> = (event) => {
    const target = event.currentTarget;
    const searchParams = new SvelteURLSearchParams(page.url.searchParams);

    if (target?.value) {
      searchParams.set('q', target.value);
      searchParams.set('page', '1');
    } else {
      searchParams.delete('q');
      searchParams.delete('page');
    }

    // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
    goto(`?${searchParams.toString()}`, { keepFocus: true });
  };

  function handlePageChange(newPage: number) {
    const searchParams = new SvelteURLSearchParams(page.url.searchParams);
    searchParams.set('page', newPage.toString());

    // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
    goto(`?${searchParams.toString()}`, { keepFocus: true });
  }
</script>

<svelte:head>
  <title>Admin - {data.post.title}</title>
  <meta name="description" content="Manage the post details." />
</svelte:head>

<section class="card preset-outlined-primary-500 p-4">
  <h2 class="h3 flex flex-row items-center gap-2">
    {data.post.title}
    {#if isNew(data.post.createdAt)}
      <span class="badge preset-filled-secondary-500">NEW</span>
    {/if}
  </h2>

  <p class="text-lg font-bold">
    Reading Time: {Math.round(data.post.readingTimeSeconds / 60)}
  </p>
  <p class="text-lg font-bold">Word count: {data.post.readingTimeWords}</p>
  <p class="text-sm">
    Created on: {DateTime.unsafeMake(data.post.createdAt).toLocaleString()}
  </p>
  <p class="text-sm">
    Updated on: {DateTime.unsafeMake(data.post.updatedAt).toLocaleString()}
  </p>

  <div class="flex flex-wrap items-center justify-start">
    {#each data.post.tags as tag (tag.tag)}
      <span class="chip preset-outlined-secondary-500 m-1">{tag.tag}</span>
    {/each}
  </div>
</section>

<!-- Related Posts Management Section -->
<section class="card preset-outlined-surface-500 mt-4 p-4">
  <h3 class="h4 mb-4">Related Posts</h3>

  <form method="post" action="?/updateRelatedPosts" use:relatedPostsEnhance class="space-y-4">
    <!-- Currently Related Posts -->
    {#if derivedRelatedPosts.length > 0}
      <div>
        <h4 class="h5 mb-2">Currently Related:</h4>
        <div class="mb-4 flex flex-wrap gap-2">
          {#each derivedRelatedPosts as relatedPost (`related-${relatedPost.id}`)}
            <span class="chip preset-filled-secondary-500 flex items-center gap-2">
              {relatedPost.title}
              <button
                type="button"
                class="text-sm"
                onclick={() => {
                  $relatedPostsForm.relatedPostIds = $relatedPostsForm.relatedPostIds.filter(
                    (id: string) => id !== relatedPost.id,
                  );
                }}
              >
                <LucideCircleX class="h-4 w-4" />
              </button>
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Search Available Posts -->
    <div>
      <label for="postSearch" class="mb-2 block text-sm font-medium">Search Posts:</label>
      <input
        id="postSearch"
        type="text"
        class="input"
        placeholder="Search by title or slug..."
        value={data.searchQuery}
        oninput={handleSearchChange}
      />
    </div>

    <!-- Available Posts Selection -->
    <div>
      <h4 class="h5 mb-2">Available Posts:</h4>
      <div class="mb-4 flex flex-wrap gap-2">
        {#each derivedAvailablePosts as availablePost (`available-${availablePost.id}`)}
          <button
            type="button"
            class="chip preset-outlined-surface-500"
            onclick={() => {
              if ($relatedPostsForm.relatedPostIds.includes(availablePost.id)) {
                $relatedPostsForm.relatedPostIds = $relatedPostsForm.relatedPostIds.filter(
                  (id: string) => id !== availablePost.id,
                );
              } else {
                $relatedPostsForm.relatedPostIds = [
                  ...$relatedPostsForm.relatedPostIds,
                  availablePost.id,
                ];
              }
            }}
          >
            {availablePost.title}
            <span class="text-xs opacity-60">
              ({Math.round(availablePost.readingTimeSeconds / 60)}min)
            </span>
          </button>
        {/each}
      </div>

      <!-- Hidden inputs for form submission -->
      {#each $relatedPostsForm.relatedPostIds as relatedPostId (relatedPostId)}
        <input type="hidden" name="relatedPostIds" value={relatedPostId} />
      {/each}
    </div>

    <!-- Pagination -->
    {#if data.pagination.totalPages > 1}
      <div class="flex justify-center">
        <Pagination
          data={derivedAvailablePosts}
          count={data.pagination.totalCount}
          page={data.pagination.page}
          pageSize={data.pagination.limit}
          onPageChange={(value) => handlePageChange(value.page)}
        >
          {#snippet labelEllipsis()}<LucideEllipsis class="text-base" />{/snippet}
          {#snippet labelNext()}<LucideArrowRight class="text-base" />{/snippet}
          {#snippet labelPrevious()}<LucideArrowLeft class="text-base" />{/snippet}
          {#snippet labelFirst()}<LucideChevronLeft class="text-base" />{/snippet}
          {#snippet labelLast()}<LucideChevronRight class="text-base" />{/snippet}
        </Pagination>
      </div>
    {/if}

    <!-- Save Button -->
    <button
      type="submit"
      disabled={$relatedPostsSubmitting}
      aria-disabled={$relatedPostsSubmitting}
      class="btn preset-tonal-primary"
      class:disabled={$relatedPostsSubmitting || !isTainted($tainted)}
    >
      Save Related Posts
    </button>
  </form>

  {#if $relatedPostsMessage}
    <div
      class="card preset-filled-success-500 mt-4 flex w-xs flex-row items-center justify-evenly p-4 text-center text-lg font-bold"
    >
      {$relatedPostsMessage}
      <button class="btn btn-icon h-6 w-6 text-2xl font-bold" onclick={() => relatedPostsReset()}>
        <LucideCircleX />
      </button>
    </div>
  {/if}
</section>

<form method="post" action="?/manualSync" use:enhance>
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
