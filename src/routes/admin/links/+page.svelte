<script lang="ts">
  import { goto } from '$app/navigation';
  import { page as sveltePage } from '$app/state';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
  import IconArrowLeft from 'lucide-svelte/icons/arrow-left';
  import IconArrowRight from 'lucide-svelte/icons/arrow-right';
  import IconLast from 'lucide-svelte/icons/chevron-right';
  import IconFirst from 'lucide-svelte/icons/chevrons-left';
  import IconEllipsis from 'lucide-svelte/icons/ellipsis';
  import Eraser from 'lucide-svelte/icons/eraser';
  import SqurePlus from 'lucide-svelte/icons/square-plus';
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();

  const { form, enhance, constraints, errors, reset, submitting } = superForm(data.form);

  function handleQueryChange(
    event: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) {
    event.preventDefault();

    const q = event.currentTarget.q.value;
    const params = new URLSearchParams(sveltePage.url.searchParams);

    if (q) {
      params.set('q', q);
      params.set('page', '1');
      goto(`?${params.toString()}`, { keepFocus: true });
    } else {
      params.delete('q');
      params.delete('page');
      goto(`?${params.toString()}`, { keepFocus: true });
    }
  }
</script>

<form class="grid grid-cols-2 gap-4" action="?/create" method="POST" use:enhance>
  <header class="col-span-2">
    <h2 class="h2">Add a link</h2>
  </header>

  <div>
    <input
      name="link"
      class="input"
      placeholder="Link"
      aria-label="Link"
      aria-invalid={$errors.link ? 'true' : undefined}
      bind:value={$form.link}
      {...$constraints.link}
    />
    {#if $errors.link}
      <span class="invalid">{$errors.link}</span>
    {/if}
  </div>

  <div>
    <label class="flex items-center space-x-2">
      <input
        type="checkbox"
        class="checkbox"
        name="private"
        placeholder="Private"
        aria-label="Private"
        aria-invalid={$errors.private ? 'true' : undefined}
        bind:checked={$form.private}
        {...$constraints.private}
      />
      <p>Private</p>
    </label>
    {#if $errors.private}
      <span class="invalid">{$errors.private}</span>
    {/if}
  </div>

  <button
    type="submit"
    class="btn preset-tonal-success"
    class:disabled={$submitting}
    disabled={$submitting}
  >
    <SqurePlus />
  </button>
  <button
    type="button"
    class="btn preset-tonal-warning"
    onclick={() => reset()}
    class:disabled={$submitting}
    disabled={$submitting}
  >
    <Eraser />
  </button>
</form>

<div class="grid grid-cols-2">
  <h3 class="h3">View Links</h3>

  <form onsubmit={handleQueryChange}>
    <input id="q" class="input" placeholder="Search" name="q" />
  </form>
</div>

<div class="table-wrap max-h-96">
  <table class="table table-auto">
    <thead>
      <tr>
        <th class="whitespace-nowrap">Link</th>
        <th class="whitespace-nowrap">Private</th>
      </tr>
    </thead>
    <tbody class="hover:[&>tr]:preset-tonal-primary">
      {#each data.links as link}
        <tr>
          <td>{link.link}</td>
          <td>{link.private}</td>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <td>Total</td>
        <td>
          Page {data.pagination.page} of {data.pagination.pages}
        </td>
        <td class="text-right">{data.links.length} Elements</td>
      </tr>
    </tfoot>
  </table>
</div>

<footer class="flex justify-between">
  <Pagination
    data={data.links}
    count={data.pagination.linkCount}
    page={data.pagination.page}
    pageSize={data.pagination.limit}
    onPageChange={(value) => {
      const params = new URLSearchParams(sveltePage.url.searchParams);

      params.set('page', value.page.toString());
      goto(`?${params.toString()}`, { keepFocus: true });
    }}
  >
    {#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
    {#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
    {#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
    {#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
    {#snippet labelLast()}<IconLast class="size-4" />{/snippet}
  </Pagination>
</footer>
