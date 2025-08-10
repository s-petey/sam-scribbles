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

  let { data }: { data: PageData } = $props();

  let tags = $state<string[]>(page.url.searchParams.get('tags')?.split(',').filter(Boolean) ?? []);

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

    if (newPage && newPage > 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : resolve('/tags');
    goto(url, { keepFocus: true });
  }

  function goToPage(pageNum: number) {
    updateUrl(pageNum);
  }
</script>

<svelte:head>
  <title>Sam's Scribbles - Tags</title>
  <meta name="description" content="Tags to search blogs or links." />
</svelte:head>

<h1 class="h1">Tags</h1>

<form
  class="flex flex-row content-evenly gap-4"
  onsubmit={(e) => {
    e.preventDefault();
    updateUrl(1);
  }}
>
  <div class="flex items-center md:col-span-2">
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
                  tags.includes(tag)
                    ? 'preset-outlined-secondary-500'
                    : 'preset-outlined-surface-500'
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
  </div>

  <div class="flex flex-col items-center justify-center gap-4">
    <div>
      <button
        class="btn preset-filled-secondary-600-400"
        onclick={() => {
          tags = [];
          goto(resolve('/tags'), { keepFocus: true });
        }}
        type="button"
      >
        Clear Selection
      </button>
    </div>
    <button type="submit" class="btn preset-filled-primary-500">Filter</button>
  </div>
</form>

{#if data.posts.length === 0 && data.links.length === 0}
  <p class="text-warning-500">Select one or more tags to filter posts and links.</p>
{:else}
  <div class="text-secondary-500 mb-4 text-sm">
    Showing {data.posts.length + data.links.length} items ({data.pagination.totalPosts} posts, {data
      .pagination.totalLinks} links total)
  </div>

  <div class="table-wrap max-h-96">
    <table class="table table-auto">
      <thead>
        <tr>
          <th class="whitespace-nowrap">Type</th>
          <th class="whitespace-nowrap">Title/Link</th>
          <th class="whitespace-nowrap">Tags</th>
          <th class="whitespace-nowrap">Date</th>
        </tr>
      </thead>
      <tbody>
        {#each data.posts as post (post.slug)}
          <tr class="hover:preset-tonal-primary">
            <td>
              <span class="chip preset-filled-primary-500">Post</span>
            </td>
            <td>
              <a href={resolve('/posts/[slug]', { slug: post.slug })} class="anchor">
                {post.title}
              </a>
              <div class="text-secondary-500 text-sm">{post.preview}</div>
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                {#each post.tags as tag (tag)}
                  <span class="chip preset-outlined-surface-500 text-xs">
                    <a href={resolve('/tags/[slug]', { slug: tag })} class="cursor-pointer">
                      {tag}
                    </a>
                  </span>
                {/each}
              </div>
            </td>
            <td class="text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </td>
          </tr>
        {/each}
        {#each data.links as link (link.shortId)}
          <tr class="hover:preset-tonal-primary">
            <td>
              <span class="chip preset-filled-secondary-500">Link</span>
            </td>
            <td>
              <LinkWithIcon {link} />
            </td>
            <td>
              <div class="flex flex-wrap gap-1">
                {#each link.tags as tag (tag)}
                  <span class="chip preset-outlined-surface-500 text-xs">
                    <a href={resolve('/tags/[slug]', { slug: tag })} class="cursor-pointer">
                      {tag}
                    </a>
                  </span>
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
        data={[...data.posts, ...data.links]}
        count={data.pagination.totalPosts + data.pagination.totalLinks}
        page={data.pagination.page}
        pageSize={data.pagination.limit}
        onPageChange={(value) => {
          goToPage(value.page);
        }}
      >
        {#snippet labelEllipsis()}<LucideEllipsis class="text-base" />{/snippet}
        {#snippet labelNext()}<LucideArrowRight class="text-base" />{/snippet}
        {#snippet labelPrevious()}<LucideArrowLeft class="text-base" />{/snippet}
        {#snippet labelFirst()}<LucideChevronLeft class="text-base" />{/snippet}
        {#snippet labelLast()}<LucideChevronRight class="text-base" />{/snippet}
      </Pagination>
    </footer>
  {/if}
{/if}
