<script lang="ts">
  import { socialLinks } from '$lib/siteLinks';
</script>

<svelte:head>
  <title>Sam's Scribbles - Socials</title>
  <meta name="description" content="Links to my socials." />
</svelte:head>

<nav class="flex flex-col items-center gap-2">
  {#each socialLinks as link (link.href)}
    <span class="text-primary-500 flex items-center gap-1">
      <link.icon name={link.label} />

      <a
        class="anchor hover:underline"
        href={link.href}
        title={link.label}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    </span>
  {/each}
</nav>
