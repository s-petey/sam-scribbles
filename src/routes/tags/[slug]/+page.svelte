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

  function goToPage(pageNum: number) {
    const params = new SvelteURLSearchParams(page.url.searchParams);

    if (pageNum > 1) {
      params.set('page', pageNum.toString());
    } else {
      params.delete('page');
    }

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : resolve('/tags/[slug]', { slug: data.slug });
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- we want to keep the current path
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
      count={data.pagination.totalPosts + data.pagination.totalLinks}
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
              <Pagination.Ellipsis {index}><LucideEllipsis class="text-base" /></Pagination.Ellipsis
              >
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
