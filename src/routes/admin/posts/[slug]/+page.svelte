<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import LucideCircleX from '~icons/lucide/circle-x';

  let { data } = $props();

  const { enhance, submitting, message, reset } = superForm(data.form, {
    clearOnSubmit: 'errors-and-message',
  });
</script>

<h2 class="h2">{data.meta.title}</h2>

<form method="post" use:enhance>
  <input type="hidden" name="slug" value={data.meta.slug} />
  <button
    disabled={$submitting}
    aria-disabled={$submitting}
    type="submit"
    class="btn preset-tonal-primary"
    class:disabled={$submitting}
  >
    Manually sync
  </button>
</form>

{#if $message}
  <div
    class="card preset-filled-success-500 flex w-xs flex-row items-center justify-evenly p-4 text-center text-lg font-bold"
  >
    {$message}
    <button
      class="btn btn-icon preset-filled-error-500 h-6 w-6 text-2xl font-bold"
      onclick={() => reset()}
    >
      <LucideCircleX />
    </button>
  </div>
{/if}
