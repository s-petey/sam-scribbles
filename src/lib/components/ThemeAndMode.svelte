<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { page } from '$app/state';
  import { isValidMode, isValidTheme, themes, type Theme, type ThemeMode } from './themes';
  import LucideMoon from '~icons/lucide/moon';
  import LucideSun from '~icons/lucide/sun';
  import { Combobox, Portal } from '@skeletonlabs/skeleton-svelte';

  let { currentTheme, currentThemeMode }: { currentTheme: Theme; currentThemeMode: ThemeMode } =
    $props();

  let theme = $state<{ theme: Theme; mode: ThemeMode }>({
    theme: currentTheme,
    mode: currentThemeMode,
  });

  $effect(() => {
    theme.theme = currentTheme;
    theme.mode = currentThemeMode;
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

  let form: HTMLFormElement;

  let filteredThemes: Theme[] = $state(themes.map((theme) => theme));
</script>

<div class="flex items-center justify-end gap-2">
  <form
    method="POST"
    use:enhance={setTheme}
    class="flex gap-2"
    bind:this={form}
    action="/?/setTheme&theme={theme.theme}&redirectTo={page.url.pathname}"
  >
    <Combobox
      value={[theme.theme]}
      defaultValue={[theme.theme]}
      onValueChange={(e) => {
        const newTheme = e.value.at(0);
        theme.theme = isValidTheme(newTheme) ? newTheme : 'catppuccin';
        form.action = `/?/setTheme&theme=${theme.theme}&redirectTo=${page.url.pathname}`;
        form.requestSubmit();
      }}
      onInputValueChange={(e) => {
        const inputValue = e.inputValue;

        const matchingThemes: Theme[] = [];

        for (const theme of themes) {
          if (theme.toLowerCase().includes(inputValue.toLowerCase())) {
            matchingThemes.push(theme);
          }
        }

        filteredThemes = matchingThemes;
      }}
      placeholder="Select a theme"
    >
      <Combobox.Label />
      <Combobox.Control>
        <Combobox.Input value={[theme.theme]} />
        <Combobox.Trigger />
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            {#each filteredThemes as item (item)}
              <Combobox.Item {item}>
                <Combobox.ItemText>
                  {item}
                </Combobox.ItemText>
              </Combobox.Item>
            {/each}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
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
