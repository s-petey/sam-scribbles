<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { hourMinuteSecondFromDuration, isNew } from '$lib/time';
  import { SvelteURLSearchParams } from 'svelte/reactivity';

  let { data } = $props();

  let tags = $state<string[]>(page.url.searchParams.get('tags')?.split(',').filter(Boolean) ?? []);
  let searchQuery = $state(page.url.searchParams.get('q') || '');

  const sortedTags = $derived(
    data.tags.slice().sort((a, b) => (tags.includes(a) ? -1 : 1) - (tags.includes(b) ? -1 : 1)),
  );
</script>

<svelte:head>
  <title>Sam's Scribbles - Posts</title>
  <meta name="description" content="Recent blog posts with details." />
</svelte:head>

<h1 class="h1">Scribbles</h1>
<!-- TODO: Add sort by (date / alphabetical / other?) -->
<!-- TODO: Look into adding progressively enhancing -->
<form
  class="grid grid-cols-1 gap-4 md:grid-cols-7"
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

    if (searchQuery.trim().length > 0) {
      params.set('q', searchQuery.trim());
      hasParams = true;
    } else {
      params.delete('q');
    }

    if (hasParams) {
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
      goto(`?${params.toString()}`, { keepFocus: true });
    } else {
      goto(resolve('/posts'), { keepFocus: true });
    }
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
          goto(resolve('/posts'), { keepFocus: true });
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

<div class="grid grid-cols-1 gap-4">
  {#each data.posts as post (post.slug)}
    <div class="group relative flex h-full w-full">
      <div
        class="rounded-box from-primary-500 to-tertiary-500 group-hover:from-tertiary-500 group-hover:to-primary-500 absolute -inset-0 bg-linear-to-r blur-xs"
      ></div>
      <div class="relative h-full w-full">
        <article
          class="text-secondary-contrast-300-700 hover:text-secondary-contrast-600-400 card bg-secondary-300-700 hover:bg-secondary-400-600 p-4 transition first:pt-0"
        >
          <a class="flex flex-col gap-2" href={resolve('/posts/[slug]', { slug: post.slug })}>
            <div>
              <h2 class="pt-5 pb-1 text-3xl font-black">
                {post.title}
              </h2>
              <div class="mb-4 flex items-center gap-2 text-sm font-bold uppercase">
                <time> {post.createdAt.toLocaleString()}</time>
                &bull;
                <span>
                  {hourMinuteSecondFromDuration(post.readingTimeSeconds)}
                </span>
                {#if isNew(post.createdAt)}
                  &bull;
                  <span class="badge preset-filled-secondary-500"> new </span>
                {/if}
              </div>

              <!-- TODO: Have icons for tags ? -->
              <div class="flex flex-wrap gap-2">
                {#each post.tags as tag (tag.tag)}
                  <span class="badge preset-tonal-secondary">{tag.tag}</span>
                {/each}
              </div>
            </div>

            <div
              class="prose prose-lg lg:prose-xl prose-headings:scroll-mt-16 prose-a:text-primary-400 prose-a:transition prose-a:hover:text-secondary-400 w-full max-w-full!"
            >
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html post.preview}
              <!-- TODO: Figure out why this previewHtml doesn't work -->
              <!-- {@html post.previewHtml} -->
            </div>
          </a>
        </article>
      </div>
    </div>
  {/each}
</div>
