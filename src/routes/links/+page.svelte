<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import type { PageData } from './$types';
  import LinkWithIcon from '$lib/components/LinkWithIcon.svelte';
  // import LucideBookOpen from '~icons/lucide/book-open';

  let { data }: { data: PageData } = $props();

  let tags = $state<string[]>(page.url.searchParams.get('tags')?.split(',').filter(Boolean) ?? []);
  let searchQuery = $state(page.url.searchParams.get('q') || '');

  const sortedTags = $derived(
    data.tags.slice().sort((a, b) => (tags.includes(a) ? -1 : 1) - (tags.includes(b) ? -1 : 1)),
  );

  function updateUrl(newPage?: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);

    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    } else {
      params.delete('tags');
    }

    if (searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }

    if (newPage && newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : resolve('/links');
    goto(url, { keepFocus: true });
  }

  function goToPage(pageNum: number) {
    updateUrl(pageNum);
  }
</script>

<svelte:head>
  <title>Sam's Scribbles - Links</title>
  <meta name="description" content="A collection of links to various resources." />
</svelte:head>

<h1 class="h1">Links worth checking out</h1>

<!-- TODO: Add sort by (date / alphabetical / other?) -->
<!-- TODO: Look into adding progressively enhancing -->
<form
  class="grid grid-cols-1 gap-4 md:grid-cols-7"
  onsubmit={(e) => {
    e.preventDefault();
    updateUrl(1);
  }}
>
  <!-- Search / filter -->
  <div class="flex items-center md:col-span-2">
    <label class="label" for="search">
      <span class="label-text">Search:</span>
      <input
        type="search"
        name="q"
        class="input"
        placeholder="Search posts..."
        aria-label="Search posts"
        bind:value={searchQuery}
      />
    </label>
  </div>

  <label
    class="label border-secondary-300-700 flex items-center rounded-lg border p-2 md:col-span-4"
  >
    <div>
      <span class="label-text">Available Tags:</span>

      <div class="flex items-center">
        <div class="flex flex-wrap gap-2">
          {#each sortedTags as tag (tag)}
            <button
              class={`chip ${
                tags.includes(tag) ? 'preset-outlined-secondary-500' : 'preset-outlined-surface-500'
              }`}
              type="button"
              onclick={() => {
                if (tags.includes(tag)) {
                  tags = tags.filter((t) => t !== tag);
                } else {
                  tags.push(tag);
                }
              }}
            >
              {tag}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </label>

  <div class="flex flex-col items-center justify-center gap-4">
    <div>
      <button
        type="button"
        class="btn preset-filled-secondary-600-400"
        onclick={() => {
          tags = [];
          searchQuery = '';
          goto(resolve('/links'), { keepFocus: true });
        }}
      >
        Reset
      </button>
    </div>
    <button type="submit" class="btn preset-filled-primary-500">
      <span class="text-lg font-bold">Filter</span>
    </button>
  </div>
</form>

<div class="text-secondary-500 mb-4 text-sm">
  Showing {data.links.length} of {data.pagination.totalLinks} links
</div>

<ul class="mb-6 space-y-2">
  {#each data.links as link (link.shortId)}
    <li>
      <LinkWithIcon {link} />

      <ul class="mt-2 flex flex-wrap gap-2">
        {#each link.tags as tag (tag.tag)}
          <li class="chip preset-outlined-surface-500">
            {tag.tag}
          </li>
        {/each}
      </ul>
    </li>
  {/each}
</ul>

<!-- Pagination Controls -->
{#if data.pagination.totalPages > 1}
  <div class="mt-6 flex items-center justify-center gap-2">
    <button
      class="btn preset-outlined-surface-500"
      disabled={data.pagination.page <= 1}
      onclick={() => goToPage(data.pagination.page - 1)}
    >
      Previous
    </button>

    {#each Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
      {#if pageNum === data.pagination.page}
        <button class="btn preset-filled-primary-500" disabled>
          {pageNum}
        </button>
      {:else if Math.abs(pageNum - data.pagination.page) <= 2 || pageNum === 1 || pageNum === data.pagination.totalPages}
        <button class="btn preset-outlined-surface-500" onclick={() => goToPage(pageNum)}>
          {pageNum}
        </button>
      {:else if Math.abs(pageNum - data.pagination.page) === 3}
        <span class="text-secondary-500">...</span>
      {/if}
    {/each}

    <button
      class="btn preset-outlined-surface-500"
      disabled={data.pagination.page >= data.pagination.totalPages}
      onclick={() => goToPage(data.pagination.page + 1)}
    >
      Next
    </button>
  </div>
{/if}
