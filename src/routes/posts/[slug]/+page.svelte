<script lang="ts">
  // import { route } from '$lib/ROUTES.js';
  import { DateTime } from 'luxon';

  let { data } = $props();

  // I know this de-structure isn't responsive
  // however in this case I won't care
  const {
    Content,
    meta: { isPrivate, date, title, reading_time, tags },
  } = data;

  const dateTime = DateTime.fromJSDate(date);
  if (!dateTime.isValid) {
    throw new Error('Invalid date');
  }

  const dateIso = dateTime.toISO() ?? '';
</script>

<article class="bg-surface-800-200 px-4">
  <h1 class="mb-1 text-5xl font-black">{title}</h1>
  <div class="mt-4 mb-3 uppercase">
    <div class="flex justify-center gap-1">
      <time datetime={dateIso}>
        {dateTime.toLocaleString()}
      </time>
      &bull;
      <span>{reading_time.text}</span>
    </div>
    <div class="flex justify-center gap-2">
      <!-- TODO: Implement this page -->
      {#each tags as tag}
        <a href={`/tags/${tag}`}>
          <!-- <a href={route('/tags/[tag]', { tag: tag.toLowerCase() })}> -->
          <span
            class="badge preset-filled-surface-500 hover:bg-surface-contrast-500 hover:text-surface-500 shadow-md transition"
          >
            {tag}
          </span>
        </a>
      {/each}
      {#if dateTime.diffNow('days').days < 31}
        <span
          class="text-primary-content badge preset-filled-success-500 hover:bg-success-contrast-500 hover:text-success-500 cursor-pointer font-bold shadow-md transition"
        >
          NEW
        </span>
      {/if}
    </div>
  </div>
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

  {#if isPrivate}
    POST ISN'T PUBLISHED YET!
    <!-- <IsPrivateBanner /> -->
  {/if}

  <!-- || updated -->
  {#if DateTime.fromJSDate(date).diffNow('years').years >= 1}
    It has been updated!
    <!-- <UpdatedBanner updated={updated === undefined ? date : updated} {date} /> -->
  {/if}

  <div
    class="prose prose-lg lg:prose-xl prose-headings:scroll-mt-16 prose-a:text-primary-400 prose-a:transition prose-a:hover:text-secondary-400 mb-10"
  >
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

  <!-- <ButtButt /> -->
</article>
