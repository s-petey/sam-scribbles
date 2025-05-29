<script lang="ts">
  import '../app.css';

  import BackToTop from '$lib/components/BackToTop.svelte';
  import ThemeAndMode from '$lib/components/ThemeAndMode.svelte';
  import * as SiteLinks from '$lib/siteLinks';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import Menu from 'lucide-svelte/icons/menu';
  import Close from 'lucide-svelte/icons/x';

  let { children, data } = $props();
  let expanded = $state(false);
</script>

<div class="grid h-screen grid-rows-[auto_1fr_auto]">
  {@render header()}

  <!-- Page -->
  <div class="flex flex-row">
    <div class="hidden p-4 lg:block">
      {@render navigation()}
    </div>

    <!-- {#key $page.url} -->
    <!-- TODO: I don't know if I will keep these transitions -->
    <!-- in:fly={{ x: -200, duration: 300, delay: 400 }}
			out:fly={{ x: 200, duration: 300 }} -->
    <main class="space-y-4 p-4">
      {@render children()}
      <BackToTop />
    </main>
    <!-- {/key} -->
  </div>

  <!-- Footer -->
  <div class="relative">
    <div
      class="rounded-box from-primary-500 to-secondary-500 absolute -inset-0 z-0 bg-linear-to-br font-black blur-xs"
    ></div>
    <footer
      class="footer bg-surface-500 bg-opacity-20 relative grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {@render footer()}
    </footer>
  </div>
</div>

{#snippet header()}
  <!-- Header -->
  <header class="border-surface-500/20 bg-surface-50-950 w-full border-b-[1px] p-4 py-3 lg:px-10">
    <div
      class="container mx-auto grid max-w-(--breakpoint-2xl) grid-cols-[auto_1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]"
    >
      <!-- Left -->
      <div class="flex items-center justify-start gap-6">
        <!-- Mobile Nav Drawer -->
        {@render drawer()}

        <!-- Hamburger Menu -->
        <button class="btn-icon lg:hidden" onclick={() => (expanded = !expanded)}>
          <Menu />
        </button>

        <!-- Logo -->
        <h2 class="h2">
          <!-- TODO: Have an icon for this instead and a title? -->
          <a
            class="from-primary-500 to-tertiary-500 hidden bg-linear-to-b bg-clip-text font-extrabold text-transparent lg:inline-block"
            href={SiteLinks.core.Home.href}
            title={SiteLinks.core.Home.label}
          >
            <!-- TODO: Update this will be the full site not only sam-scribbles... -->
            <!-- <Icon name="skeleton" size={28} /> -->
            Sam-Scribbles
          </a>
        </h2>
      </div>
      <!-- Middle -->
      <div class="flex items-center gap-2">
        {#if data.user !== null && data.user.role === 'admin'}
          <h2 class="h2">Admin</h2>
        {/if}

        <!-- TODO: Implement search? -->
        <!-- Search -->
        <!-- <Search client:load /> -->
      </div>

      <!-- Right -->
      <div class="flex items-center justify-end gap-2">
        <div class="hidden items-center justify-end gap-2 lg:flex">
          <ThemeAndMode currentTheme={data.theme.theme} currentThemeMode={data.theme.mode} />
        </div>
        <!-- Social -->
        <nav class="flex flex-row items-center gap-2">
          {#each SiteLinks.socialLinks as link (link.href)}
            <a class="anchor hover:underline" href={link.href} title={link.label} target="_blank">
              <Avatar name={link.label}>
                <link.icon />
              </Avatar>
            </a>
          {/each}

          {#if data.user !== null}
            {#if data.user.name.length > 0}
              <p>User: {data.user.name}</p>
            {/if}

            <form action="/logout" method="POST">
              <button class="btn preset-tonal-primary" type="submit">Logout</button>
            </form>
          {/if}
        </nav>
      </div>
    </div>
  </header>
{/snippet}

{#snippet navigation()}
  <aside class="type-scale-2 space-y-10 overflow-y-auto">
    <nav class="flex flex-col gap-2">
      {#each SiteLinks.coreLinks as link (link.href)}
        <a
          class="anchor"
          onclick={() => {
            if (expanded) expanded = !expanded;
          }}
          href={link.href}
          title={link.label}
        >
          {link.label}
        </a>
      {/each}

      {#if data.user !== null && data.user.role === 'admin'}
        {#each SiteLinks.adminLinks as link (link.href)}
          <a
            href={link.href}
            title={link.label}
            class="anchor"
            onclick={() => {
              if (expanded) expanded = !expanded;
            }}
          >
            {link.label}
          </a>
        {/each}
      {/if}
    </nav>
  </aside>
{/snippet}

{#snippet drawer()}
  <!-- Drawer -->
  <div
    class={{
      'preset-filled-surface-100-900 fixed top-0 bottom-0 left-0 z-50 w-[320px] space-y-10 overflow-y-auto p-4 pb-24 shadow-xl transition-transform duration-100 lg:hidden': true,
      block: expanded,
      '-translate-x-[320px]': !expanded,
    }}
  >
    <!-- Header -->
    <header class="flex items-center justify-between">
      <h3
        class="h3 from-primary-500 to-tertiary-500 inline-block bg-linear-to-b bg-clip-text font-extrabold text-transparent"
      >
        <!-- TODO: Update this will be the full site not only sam-scribbles... -->
        Sam-Scribbles
      </h3>
      <button class="btn-icon" onclick={() => (expanded = !expanded)}>
        <Close />
      </button>
    </header>

    <!-- Navigation -->
    <nav class="flex flex-col gap-2">
      <span class="font-bold capitalize">Navigate</span>
      {@render navigation()}
    </nav>
  </div>
{/snippet}

{#snippet footer()}
  <div class="grid grid-cols-1 justify-items-center md:grid-cols-2 md:justify-items-start">
    <span class="mb-1 font-bold uppercase lg:col-span-2">PLACEHOLDER</span>
    <!-- <span class="mb-1 font-bold lg:col-span-2 uppercase">Popular Posts</span> -->
    <!-- {#each posts as post}
				<p>
					<a
						data-sveltekit-reload
						class="hover:opacity-50 w-fit"
						href={$page.url.origin + post.pathname}
					>
						{post.title}
					</a>
					<span
						class="tooltip  group relative cursor-pointer font-bold"
						data-tip={`
          Visits: ${number_crunch(post.visits)},
          Pageviews: ${number_crunch(post.pageviews)}
        `}
					>
						<Eye />
						{number_crunch(post.pageviews)}
					</span>
				</p>
			{/each} -->

    <!-- {#if total_visitors > 0} -->
    <!-- <span
					onmouseenter={() => (show_current_visitor_data = true)}
					onmouseleave={() => (show_current_visitor_data = false)}
					class="inline-block cursor-pointer"
				> -->
    <!-- <p
						class="rounded-box bg-secondary text-secondary-content mt-2 px-2 py-1 tracking-wide shadow-lg"
					>
						There's currently
						<span class="font-bold">
							{total_visitors}
						</span>
						live {total_visitors === 1 ? 'visitor' : 'visitors'}
					</p> -->
    <!-- {#if show_current_visitor_data}
						<CurrentVisitorsData />
					{/if} -->
    <!-- </span>
			{/if} -->
  </div>
  <div class="grid grid-cols-1 justify-items-center md:grid-cols-2 md:justify-items-start">
    <span class="mb-1 font-bold uppercase lg:col-span-2">Site Links</span>
    {#each SiteLinks.coreLinks as link (link.href)}
      <a href={link.href} title={link.label} class="w-fit hover:opacity-50">
        {link.label}
      </a>
    {/each}

    {#if data.user !== null && data.user.role === 'admin'}
      {#each SiteLinks.adminLinks as link (link.href)}
        <a href={link.href} title={link.label} class="w-fit hover:opacity-50">
          {link.label}
        </a>
      {/each}
    {/if}
  </div>
  <div class="grid grid-cols-1 justify-items-center md:grid-cols-2 md:justify-items-start">
    <span class="mb-1 font-bold uppercase lg:col-span-2">Socials</span>
    {#each SiteLinks.socialLinks as social (social.href)}
      <span class="flex items-center gap-1">
        <social.icon name={social.label} />
        <a
          class="w-fit hover:opacity-50"
          href={social.href}
          title={social.label}
          target="_blank"
          rel="noopener noreferrer"
        >
          {social.label}
        </a>
      </span>
    {/each}
  </div>
  <div class="md:col-span-2 lg:col-span-3">
    <p class="py-4 text-center">
      Copyright &copy; 2024 - {`${new Date().getFullYear()}`} - All rights reserved Sam Peterson
    </p>
  </div>
{/snippet}
