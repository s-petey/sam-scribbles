<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

  // TODO: Work with these
  // isPrivate,
  //  tags,

  const { enhance, submitting, message } = superForm(data.form, {
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
    class="card preset-filled-success-500 grid grid-cols-1 items-center p-4 text-center text-lg font-bold"
  >
    {$message}
  </div>
{/if}
