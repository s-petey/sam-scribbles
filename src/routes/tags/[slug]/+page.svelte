<script lang="ts">
  import { resolve } from '$app/paths';
  import LinkWithIcon from '$lib/components/LinkWithIcon.svelte';

  let { data } = $props();
</script>

<svelte:head>
  <title>Sam's Scribbles - Tag: {data.slug}</title>
  <meta name="description" content="Posts and links tagged with {data.slug}." />
</svelte:head>

<h1 class="h1 mb-4">
  Tag: {data.slug}
</h1>

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
