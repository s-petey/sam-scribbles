<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import LinkWithIcon from '$lib/components/LinkWithIcon.svelte';

  let { data }: { data: PageData } = $props();

  let tags = $state<string[]>(page.url.searchParams.get('tags')?.split(',').filter(Boolean) ?? []);

  const sortedTags = $derived(
    data.tags.slice().sort((a, b) => (tags.includes(a) ? -1 : 1) - (tags.includes(b) ? -1 : 1)),
  );
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

    let hasParams = false;
    const params = new SvelteURLSearchParams(page.url.searchParams);
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
      hasParams = true;
    } else {
      params.delete('tags');
    }

    console.log('params', hasParams, params.toString());

    if (hasParams) {
      goto(`?${params.toString()}`, { keepFocus: true });
    } else {
      goto(resolve('/tags'), { keepFocus: true });
    }
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
  <h2 class="h2 mb-2">Posts</h2>
  {#if data.posts.length > 0}
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
    <p class="text-warning-500">No posts found for selected tags.</p>
  {/if}

  <h2 class="h2 mb-2">Links</h2>
  {#if data.links.length > 0}
    <ul>
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
    <p class="text-warning-500">No links found for selected tags.</p>
  {/if}
{/if}
