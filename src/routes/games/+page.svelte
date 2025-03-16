<script lang="ts">
  import { routes } from '$lib/ROUTES';

  const filteredRoutes = routes.filter((route) => {
    return (
      route.startsWith('/games/') &&
      // There is only one segment after `/games`
      route.split('/').length === 3
    );
  });
</script>

<h1 class="h1">Games</h1>

<nav class="m-auto w-2/3 text-center">
  <ul class="grid grid-cols-3 gap-2">
    {#each filteredRoutes as path (path)}
      <li>
        <a class="anchor capitalize" href={path}>{path.replace('/games/', '')}</a>
      </li>
    {/each}
  </ul>
</nav>
