<script lang="ts">
  import { page } from '$app/state';
  import { route } from '$lib/ROUTES';
  import { core } from '$lib/siteLinks';

  // import { PopularPosts } from '$lib/components'
</script>

<svelte:head>
  <title>Whoops! {page.status}</title>
</svelte:head>

<main class="all-prose">
  <h1>{page.status}</h1>

  <p>{page.error?.message}</p>

  {#if page.status !== 404}
    <p>You may have helped find a new bug! 🎉</p>
  {/if}

  <p>
    Maybe check out the <a href={core.Posts.href}>posts</a> page? Or go to the
    <a href={route('/')}>home</a> page.
  </p>

  <!-- TODO: Something like this... -->
  <!-- <p>Also 👇</p> -->

  <!-- <PopularPosts /> -->
</main>
