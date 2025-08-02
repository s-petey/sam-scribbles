<script lang="ts">
  import { DateTime } from 'luxon';

  let { data } = $props();

  // I know this de-structure isn't responsive
  // however in this case I won't care
  const {
    Content,
    meta: { isPrivate, date, title, reading_time, tags, updated },
  } = data;

  const dateTime = DateTime.fromJSDate(date);
  if (!dateTime.isValid) {
    throw new Error('Invalid date');
  }

  const dateIso = dateTime.toISO() ?? '';
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
          {dateTime.toLocaleString()}
        </time>
        <span>&bull;</span>
        <span>{reading_time.text}</span>
        {#if dateTime.diffNow('days').days < 31}
          <span>&bull;</span>
          <span class="text-primary-800 font-bold">NEW</span>
        {/if}
      </div>

      <div class="flex justify-center gap-2">
        {#each tags as tag (tag)}
          <a class="anchor" href={`/tags/${tag}`}>
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
    {#if updated !== undefined && DateTime.fromJSDate(updated).diffNow('months').years <= 4}
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

  <!-- <RelatedPosts {related_posts} /> -->
</article>
