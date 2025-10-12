<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { page } from '$app/state';
  import { isValidMode, isValidTheme, themes, type Theme, type ThemeMode } from './themes';
  import LucideMoon from '~icons/lucide/moon';
  import LucideSun from '~icons/lucide/sun';
  import { Combobox } from '@skeletonlabs/skeleton-svelte';

  let { currentTheme, currentThemeMode }: { currentTheme: Theme; currentThemeMode: ThemeMode } =
    $props();

  let theme = $state<{ theme: Theme; mode: ThemeMode }>({
    theme: currentTheme,
    mode: currentThemeMode,
  });

  // Set theme client-side
  const setTheme: SubmitFunction = ({ action }) => {
    const searchTheme = action.searchParams.get('theme');
    const searchThemeMode = action.searchParams.get('themeMode');

    if (isValidTheme(searchTheme)) {
      theme.theme = searchTheme;
      document.documentElement.setAttribute('data-theme', searchTheme);
    }

    if (isValidMode(searchThemeMode)) {
      theme.mode = searchThemeMode;
      document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    }

    return async ({ update }) => {
      update({ reset: false });
    };
  };
</script>

<div class="flex items-center justify-end gap-2">
  <form method="POST" use:enhance={setTheme} class="flex gap-2">
    <Combobox
      data={themes.map((theme) => ({ value: theme, label: theme }))}
      value={[currentTheme]}
      defaultValue={[currentTheme]}
      onValueChange={(e) => {
        const newTheme = e.value.at(0);
        currentTheme = isValidTheme(newTheme) ? newTheme : 'catppuccin';
      }}
      placeholder="Select a theme"
      classes="z-10"
    >
      {#snippet item(item)}
        <button
          class="flex w-full justify-between space-x-2"
          formaction="/?/setTheme&theme={item.label}&redirectTo={page.url.pathname}"
        >
          {item.label}
        </button>
      {/snippet}
    </Combobox>

    {#if theme.mode === 'dark'}
      <button
        type="submit"
        class="btn"
        formaction="/?/setTheme&redirectTo={page.url.pathname}&themeMode=light"
        aria-label="Light mode toggle"
      >
        <LucideMoon class="text-xl" />
      </button>
    {:else}
      <button
        type="submit"
        class="btn"
        formaction="/?/setTheme&redirectTo={page.url.pathname}&themeMode=dark"
        aria-label="Dark mode toggle"
      >
        <LucideSun class="text-xl" />
      </button>
    {/if}
  </form>
</div>
