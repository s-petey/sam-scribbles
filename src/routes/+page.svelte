<script lang="ts">
  import TechInStack from '$lib/components/TechInStack.svelte';
  import * as SiteLinks from '$lib/siteLinks';
</script>

<svelte:head>
  <title>Sam's Scribbles - personal website</title>
  <meta name="description" content="My blog and link sharing website." />
</svelte:head>

<div class="flex flex-col justify-center gap-2 md:flex-row">
  <div>
    <p class="text-xl font-extrabold">
      A place for finding and sharing things Sam finds interesting.
    </p>

    <p>
      Check out what this page is
      <a href={SiteLinks.core.About.href} title={SiteLinks.core.About.label} class="anchor">
        about
      </a>,
      <a href={SiteLinks.core.Posts.href} title={SiteLinks.core.Posts.label} class="anchor">
        posts
      </a>
      (coming soon), my
      <a href={SiteLinks.core.Socials.href} title={SiteLinks.core.Socials.label} class="anchor">
        socials
      </a>
      or enjoy a
      <a href={SiteLinks.core.Games.href} title={SiteLinks.core.Games.label} class="anchor">
        game
      </a>!
    </p>
  </div>

  <!-- TODO: Check if there are recent posts -->
  <!-- {#if areRecentPosts}
      Show Something
    {:else} -->
  <TechInStack />
  <!-- {/if} -->
</div>
