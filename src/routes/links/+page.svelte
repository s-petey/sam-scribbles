<script lang="ts">
  import type { PageData } from './$types';
  import SimpleIconsYoutube from '~icons/simple-icons/youtube';
  import SimpleIconsVimeo from '~icons/simple-icons/vimeo';
  import LucideLink from '~icons/lucide/link';
  // import LucideBookOpen from '~icons/lucide/book-open';

  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { route } from '$lib/ROUTES';

  let { data }: { data: PageData } = $props();

  let tags = $state<string[]>(page.url.searchParams.get('tags')?.split(',').filter(Boolean) ?? []);
  let searchQuery = $state(page.url.searchParams.get('q') || '');

  const sortedTags = $derived(
    data.tags.slice().sort((a, b) => (tags.includes(a) ? -1 : 1) - (tags.includes(b) ? -1 : 1)),
  );
</script>

<svelte:head>
  <title>Sam's Scribbles - Links</title>
  <meta name="description" content="A collection of links to various resources." />
</svelte:head>

<h1 class="h1">Links worth checking out</h1>

<form
  class="grid grid-cols-1 gap-4 md:grid-cols-7"
  onsubmit={(e) => {
    e.preventDefault();

    let hasParams = false;
    const params = new URLSearchParams(page.url.searchParams);
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
      goto(`?${params.toString()}`, { keepFocus: true });
    } else {
      goto(route('/links'), { keepFocus: true });
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
          goto(route('/links'), { keepFocus: true });
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

<ul class="space-y-2">
  {#each data.links as link (link.shortId)}
    <li>
      <span class="flex items-center gap-2">
        {#if link.link.includes('youtube.com')}
          <SimpleIconsYoutube />
        {:else if link.link.includes('vimeo.com')}
          <SimpleIconsVimeo />
        {:else}
          <LucideLink />
        {/if}

        <a
          class="anchor"
          href={link.link}
          target="_blank"
          rel="noopener noreferrer"
          title="External link"
        >
          <span>
            {link.link}
          </span>
        </a>
        <!-- {#if hasRelatedPost}
        <a class="anchor" href="link_to_related_post" title="Sam's related post">
          <LucideBookOpen />
        </a>
        {/if} -->
      </span>

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
