<script lang="ts">
  import { socialLinks } from '$lib/siteLinks';
</script>

<nav class="flex flex-col items-center gap-2">
  {#each socialLinks as link}
    <a class="anchor hover:underline" href={link.href} title={link.label} target="_blank">
      {link.label}
    </a>
  {/each}
</nav>
