<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import LinkWithIcon from '$lib/components/LinkWithIcon.svelte';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import LucideArrowLeft from '~icons/lucide/arrow-left';
  import LucideArrowRight from '~icons/lucide/arrow-right';
  import LucideChevronLeft from '~icons/lucide/chevron-left';
  import LucideChevronRight from '~icons/lucide/chevron-right';
  import LucideEllipsis from '~icons/lucide/ellipsis';
  import type { PageData } from './$types';
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
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same page
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

<div class="table-wrap max-h-96">
  <table class="table table-auto">
    <thead>
      <tr>
        <th class="whitespace-nowrap">Link</th>
        <th class="whitespace-nowrap">Tags</th>
        <th class="whitespace-nowrap">Date</th>
      </tr>
    </thead>
    <tbody>
      {#each data.links as link (link.shortId)}
        <tr class="hover:preset-tonal-primary">
          <td>
            <LinkWithIcon {link} />
          </td>
          <td>
            <div class="flex flex-wrap gap-1">
              {#each link.tags as tag (tag.tag)}
                <a href={resolve('/tags/[slug]', { slug: tag.tag })} class="cursor-pointer">
                  <span class="chip preset-outlined-surface-500 text-xs">
                    {tag.tag}
                  </span>
                </a>
              {/each}
            </div>
          </td>
          <td class="text-sm">
            {new Date(link.createdAt).toLocaleDateString()}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<!-- Pagination Controls -->
{#if data.pagination.totalPages > 1}
  <footer class="mt-6 flex justify-center">
    <Pagination
      count={data.pagination.totalLinks}
      page={data.pagination.page}
      pageSize={data.pagination.limit}
      onPageChange={(value) => {
        goToPage(value.page);
      }}
    >
      <Pagination.FirstTrigger>
        <LucideChevronLeft class="text-base" />
      </Pagination.FirstTrigger>
      <Pagination.PrevTrigger>
        <LucideArrowLeft class="text-base" />
      </Pagination.PrevTrigger>
      <Pagination.Context>
        {#snippet children(pagination)}
          {#each pagination().pages as page, index (page)}
            {#if page.type === 'page'}
              <Pagination.Item {...page}>
                {page.value}
              </Pagination.Item>
            {:else}
              <Pagination.Ellipsis {index}>
                <LucideEllipsis class="text-base" />
              </Pagination.Ellipsis>
            {/if}
          {/each}
        {/snippet}
      </Pagination.Context>
      <Pagination.NextTrigger>
        <LucideArrowRight class="text-base" />
      </Pagination.NextTrigger>
      <Pagination.LastTrigger>
        <LucideChevronRight class="text-base" />
      </Pagination.LastTrigger>
    </Pagination>
  </footer>
{/if}
