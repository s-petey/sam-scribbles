<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { core } from '$lib/siteLinks';

  // import { PopularPosts } from '$lib/components'
</script>

<svelte:head>
  <title>Whoops! {page.status}</title>
</svelte:head>

<main>
  <h1>{page.status}</h1>

  <p>{page.error?.message}</p>

  {#if page.status !== 404}
    <p>You may have helped find a new bug! 🎉</p>
  {/if}

  <p>
    Maybe check out the <a href={resolve(core.Posts.href)}>posts</a> page? Or go to the
    <a href={resolve(core.Home.href)}>home</a> page.
  </p>

  <!-- TODO: Something like this... -->
  <!-- <p>Also 👇</p> -->

  <!-- <PopularPosts /> -->
</main>
