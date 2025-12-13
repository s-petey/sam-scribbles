<script lang="ts">
  import { resolve } from '$app/paths';
  import { isNew, isRecentlyUpdated } from '$lib/time';
  import { DateTime } from 'effect';

  let { data } = $props();

  // I know this de-structure isn't responsive
  // however in this case I won't care
  const {
    Content,
    meta: { isPrivate, date, title, reading_time, tags, updated },
  } = data;

  // TODO: Should I add a "serializer" for the "date" to always be DateTime?
  const dateIso = DateTime.formatIso(DateTime.unsafeMake(date));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={title} />
</svelte:head>

<!-- TODO: Add table of contents per post, load this in the `page.ts`. -->

<article
  class="dark:bg-surface-400 bg-surface-200 border-surface-800-200 m-auto w-fit rounded border px-4 py-2"
>
  <!-- {#if current_visitor_data} -->
  <!-- <span
			onmouseenter={() => (show_current_visitor_data = true)}
			onmouseleave={() => (show_current_visitor_data = false)}
			class="inline-block cursor-pointer text-sm"
		>
			<p>
				{current_visitor_data.recent_visitors}
				{current_visitor_data.recent_visitors > 1 ? `people` : `person`} viewing this page live
			</p>
			{#if show_current_visitor_data}
				<CurrentVisitorsData />
			{/if}
			<p class="text-sm">Read to the end of the post for more stats</p>
		</span> -->
  <!-- {/if} -->

  <div
    class="prose dark:prose-invert prose-lg lg:prose-xl prose-headings:scroll-mt-16 prose-a:transition prose-a:hover:text-secondary-400 m-auto mb-10"
  >
    <h1 class="h1 mb-0!">{title}</h1>

    {#if isPrivate}
      <p class="bg-tertiary-300 dark:bg-tertiary-500 rounded-lg p-2 text-center">
        POST ISN'T PUBLIC YET!
      </p>
    {/if}

    <div class="mt-4 mb-3 uppercase">
      <div class="flex justify-center gap-1">
        <time datetime={dateIso}>
          {DateTime.unsafeMake(date).toLocaleString()}
        </time>
        <span>&bull;</span>
        <span>{reading_time.text}</span>
        {#if isNew(date)}
          <span>&bull;</span>
          <span class="text-primary-800 font-bold">NEW</span>
        {/if}
      </div>

      <div class="flex justify-center gap-2">
        {#each tags as tag (tag)}
          <a class="anchor" href={resolve('/tags/[slug]', { slug: tag.toLowerCase() })}>
            <!-- TODO: Replace when route is created -->
            <!-- <a href={resolve('/tags/[tag]', { tag: tag.toLowerCase() })}> -->
            <span
              class="badge preset-filled-surface-500 hover:bg-surface-contrast-500 hover:text-surface-500 shadow-md transition"
            >
              {tag}
            </span>
          </a>
        {/each}
      </div>
    </div>

    <!-- TODO: Should this fall back to date? date || updated -->
    {#if isRecentlyUpdated(updated)}
      <p class="text-tertiary-800-200 flex w-full flex-col items-center font-normal italic">
        Recently updated!
      </p>
    {/if}

    <Content />
  </div>

  <!-- <div class="mb-5 mt-10 flex w-full flex-col" bind:this={end_of_copy}>
		<div class="divider divider-secondary"></div>
	</div> -->

  <!-- <Reactions data={count} path={current_path} /> -->

  <!-- <div class="flex justify-center">
		<a
			onclick={show_modal}
			href="/stats/{$page.params.slug}"
			class="btn-primary btn btn-lg mb-20 px-10 text-xl shadow-lg"
		>
			✨ View the stats for this post ✨
		</a>
	</div> -->

  <!-- <Modal bind:modal onclose={close_modal}>
		{#if $page.state.selected}
			<StatsPage data={$page.state.selected} />
		{/if}
	</Modal> -->

  <!-- <div class="mb-24 grid justify-items-center">
		<ShareWithTweet
			buttonText="Useful? Share it on Twitter."
			tweetText={`Check out this post from @spences10, ${title}: ${url}`}
		/>
	</div> -->

  <!-- <PopularPosts /> -->
</article>

<!-- TODO: Add a page for the timeline view (when they were linked, or order they were created) for related posts -->
{#if (data.relatedPosts?.length || 0) > 0}
  <div class="m-4">
    <h3 class="mb-8 text-xl">Related posts...</h3>

    <div class="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {#each data.relatedPosts as post (post.slug)}
        <a data-sveltekit-reload href={resolve(`/posts/${post.slug}`)} class="h-full">
          <aside class="card preset-outlined-secondary-500 p-2">
            <h3 class="w-full truncate text-xl">
              {post.title}
            </h3>
          </aside>
        </a>
      {/each}
    </div>
  </div>
{/if}
