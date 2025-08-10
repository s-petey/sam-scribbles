<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import LinkWithIcon from '$lib/components/LinkWithIcon.svelte';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function goToPage(pageNum: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);

    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : resolve('/tags/[slug]', { slug: data.slug });
    goto(url, { keepFocus: true });
  }
</script>

<svelte:head>
  <title>Sam's Scribbles - Tag: {data.slug}</title>
  <meta name="description" content="Posts and links tagged with {data.slug}." />
</svelte:head>

<h1 class="h1 mb-4">
  Tag: {data.slug}
</h1>

<div class="text-secondary-500 mb-4 text-sm">
  Showing {data.posts.length + data.links.length} items ({data.pagination.totalPosts} posts, {data
    .pagination.totalLinks} links total)
</div>

{#if data.posts.length > 0}
  <h2 class="h2 mb-2">Posts</h2>
  <ul class="mb-6">
    {#each data.posts as post (post.slug)}
      <li class="mb-4 rounded border p-2">
        <a href={resolve('/posts/[slug]', { slug: post.slug })} class="text-lg font-bold">
          {post.title}
        </a>
        <div class="text-secondary-500 text-sm">{post.preview}</div>

        <ul class="mt-2 flex flex-wrap gap-2">
          {#each post.tags as tag (tag)}
            <li class="chip preset-outlined-surface-500">
              <a
                href={resolve('/tags/[slug]', { slug: tag })}
                class="cursor-pointer"
                title="Show items by {tag}"
              >
                {tag}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-gray-500">No posts found for this tag.</p>
{/if}

<h2 class="h2 mb-2">Links</h2>
{#if data.links.length > 0}
  <ul class="mb-6">
    {#each data.links as link (link.shortId)}
      <li class="mb-4 rounded border p-2">
        <LinkWithIcon {link} />

        <ul class="mt-2 flex flex-wrap gap-2">
          {#each link.tags as tag (tag)}
            <li class="chip preset-outlined-surface-500">
              <a
                href={resolve('/tags/[slug]', { slug: tag })}
                class="cursor-pointer"
                title="Show items by {tag}"
              >
                {tag}
              </a>
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-warning-500">No links found for this tag.</p>
{/if}

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
