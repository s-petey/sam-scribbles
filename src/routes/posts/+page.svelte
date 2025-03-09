<script lang="ts">
  import { DateTime, Duration } from 'luxon';
  import { route } from '$lib/ROUTES';

  let { data } = $props();

  function differenceInDays(date: Date) {
    const luxonDate = DateTime.fromJSDate(date);

    return luxonDate.diffNow('days').days;
  }
</script>

<!-- TODO: Add search / filters -->

<div class="grid grid-cols-1 gap-4">
  {#each data.posts as post (post.slug)}
    <!-- <div class="rounded-box from-primary to-secondary absolute -inset-0 bg-linear-to-r blur-xs"> -->
    <!-- TODO: Have icons for tags ? -->
    <!-- </div> -->
    <div class="relative flex h-full w-full">
      <div
        class="rounded-box from-primary-500 to-tertiary-500 absolute -inset-0 bg-linear-to-r blur-xs"
      ></div>
      <div class="relative h-full w-full">
        <article
          class="text-secondary-contrast-300-700 hover:text-primary-300-700trast-700 card bg-secondary-300-700 hover:bg-primary-300-700 p-4 transition first:pt-0"
        >
          <a href={route('/posts/[slug]', { slug: post.slug })}>
            <div>
              <h2 class="pt-5 pb-1 text-3xl font-black">
                {post.title}
              </h2>
              <div class="text-accent mb-4 text-sm font-bold uppercase">
                <time> {DateTime.fromJSDate(post.createdAt).toLocaleString()}</time>
                &bull;
                <span>
                  {Duration.fromObject({ seconds: post.readingTimeSeconds }).rescale().toHuman({})}
                </span>
                {#if differenceInDays(post.createdAt) < 31}
                  &bull;
                  <span class="badge preset-filled-secondary-500"> new </span>
                {/if}
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
