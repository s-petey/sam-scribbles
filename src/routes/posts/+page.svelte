<script lang="ts">
	import { DateTime, Duration } from 'luxon';

	let { data } = $props();

	function differenceInDays(date: Date) {
		const luxonDate = DateTime.fromJSDate(date);

		return luxonDate.diffNow('days').days;
	}
</script>

<!-- TODO: Add search / filters -->

<div class="grid grid-cols-1 gap-4">
	{#each data.posts as post (post.slug)}
		<!-- <div class="rounded-box from-primary to-secondary absolute -inset-0 bg-gradient-to-r blur-sm"> -->
		<!-- TODO: Have icons for tags ? -->
		<!-- </div> -->
		<div class="relative flex h-full w-full">
			<div
				class="rounded-box absolute -inset-0 bg-gradient-to-r from-primary-500 to-tertiary-500 blur-sm"
			></div>
			<div class="relative h-full w-full">
				<article
					class="text-secondary-contrast-300-700 hover:text-primary-300-700trast-700 card p-4 transition bg-secondary-300-700 first:pt-0 hover:bg-primary-300-700"
				>
					<a href={`/posts/${post.slug}`}>
						<div>
							<h2 class="pb-1 pt-5 text-3xl font-black">
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
						<div class="all-prose w-full !max-w-full">
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
