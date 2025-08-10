<script lang="ts">
  import type { Link } from '$lib/server/db/schema';
  import LucideLink from '~icons/lucide/link';
  import SimpleIconsVimeo from '~icons/simple-icons/vimeo';
  import SimpleIconsYoutube from '~icons/simple-icons/youtube';

  export let link: Pick<Link, 'link' | 'shortId'>;
</script>

<span class="flex items-center gap-2">
  {#if link.link.includes('youtube.com')}
    <SimpleIconsYoutube aria-label="YouTube" />
  {:else if link.link.includes('vimeo.com')}
    <SimpleIconsVimeo aria-label="Vimeo" />
  {:else}
    <LucideLink aria-label="External link" />
  {/if}

  <a
    class="anchor"
    href={link.link}
    target="_blank"
    rel="noopener noreferrer"
    title="External link to {link.link}"
  >
    <span>
      {link.link}
    </span>
  </a>
  <!-- {#if hasRelatedPost}
        <a class="anchor" href="link_to_related_post" title="Sam's related post">
          <LucideBookOpen />
        </a>
        {/if} -->
</span>
