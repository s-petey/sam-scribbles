<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { page as sveltePage } from '$app/state';
  import { Modal, Pagination, TagsInput } from '@skeletonlabs/skeleton-svelte';
  import { SvelteURLSearchParams } from 'svelte/reactivity';
  import { superForm } from 'sveltekit-superforms';
  import LucideArrowLeft from '~icons/lucide/arrow-left';
  import LucideArrowRight from '~icons/lucide/arrow-right';
  import LucideChevronLeft from '~icons/lucide/chevron-left';
  import LucideChevronRight from '~icons/lucide/chevron-right';
  import LucideCircleX from '~icons/lucide/circle-x';
  import LucideEllipsis from '~icons/lucide/ellipsis';
  import LucideEraser from '~icons/lucide/eraser';
  import LucidePencil from '~icons/lucide/pencil';
  import LucideSquarePlus from '~icons/lucide/square-plus';
  import LucideTrashIcon from '~icons/lucide/trash';

  let { data } = $props();
  let selectedId = $state<string | null>(null);

  const { form, enhance, constraints, errors, reset, submitting } = superForm(data.form);

  function handleQueryChange(
    event: SubmitEvent & {
      currentTarget: EventTarget & HTMLFormElement;
    },
  ) {
    event.preventDefault();

    const q = event.currentTarget.q.value;
    const params = new SvelteURLSearchParams(sveltePage.url.searchParams);

    if (q) {
      params.set('q', q);
      params.set('page', '1');
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
      goto(`?${params.toString()}`, { keepFocus: true });
    } else {
      params.delete('q');
      params.delete('page');
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
      goto(`?${params.toString()}`, { keepFocus: true });
    }
  }
</script>

<form class="grid grid-cols-2 items-center gap-4" action="?/create" method="POST" use:enhance>
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

  <div class="col-span-2">
    <label class="flex items-center space-x-2" for="tags">Available Tags:</label>
    <input type="hidden" name="tags" bind:value={$form.tags} {...$constraints.tags} />

    <div class="flex gap-2">
      {#each data.tags as tag (tag)}
        <button
          class={`chip ${
            ($form.tags ?? []).includes(tag)
              ? 'preset-outlined-secondary-500'
              : 'preset-outlined-surface-500'
          }`}
          type="button"
          onclick={() => {
            if ($form.tags?.includes(tag)) {
              $form.tags = $form.tags.filter((t) => t !== tag);
            } else {
              $form.tags = [...($form.tags ?? []), tag];
            }
          }}
        >
          {tag}
        </button>
      {/each}
    </div>

    {#if $errors.tags}
      <span class="invalid">{$errors.tags}</span>
    {/if}
  </div>

  <div class="col-span-2">
    <TagsInput
      onValueChange={(e) => {
        $form.tags = e.value;
      }}
      value={$form.tags}
      placeholder="Tags"
    >
      {#snippet buttonDelete()}
        <LucideCircleX class="text-base" />
      {/snippet}
    </TagsInput>
  </div>

  <div class="col-span-2 flex justify-evenly">
    <button
      type="submit"
      class="btn preset-tonal-success"
      class:disabled={$submitting}
      disabled={$submitting}
    >
      <LucideSquarePlus class="text-2xl" />
    </button>
    <button
      type="button"
      class="btn preset-tonal-warning"
      onclick={() => reset()}
      class:disabled={$submitting}
      disabled={$submitting}
    >
      <LucideEraser class="text-2xl" />
    </button>
  </div>
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
        <th class="whitespace-nowrap"></th>
      </tr>
    </thead>
    <tbody>
      {#each data.links as link (link.shortId)}
        <tr class="hover:preset-tonal-primary">
          <td>
            <a class="anchor" href={link.link} target="_blank" rel="noopener noreferrer">
              {link.link}
            </a>
          </td>
          <td>
            <span>
              {link.private}
            </span>
          </td>
          <td class="text-right">
            <button class="btn-icon" type="button">
              <a href={resolve('/admin/links/[shortId]', { shortId: link.shortId })}>
                <LucidePencil class="text-base" />
              </a>
            </button>

            <button
              class="btn-icon text-error-500"
              type="button"
              onclick={() => {
                selectedId = link.shortId;
              }}
            >
              <LucideTrashIcon class="text-base" />
            </button>
          </td>
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
      const params = new SvelteURLSearchParams(sveltePage.url.searchParams);

      params.set('page', value.page.toString());
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- Routing to same path
      goto(`?${params.toString()}`, { keepFocus: true });
    }}
  >
    {#snippet labelEllipsis()}<LucideEllipsis class="text-base" />{/snippet}
    {#snippet labelNext()}<LucideArrowRight class="text-base" />{/snippet}
    {#snippet labelPrevious()}<LucideArrowLeft class="text-base" />{/snippet}
    {#snippet labelFirst()}<LucideChevronLeft class="text-base" />{/snippet}
    {#snippet labelLast()}<LucideChevronRight class="text-base" />{/snippet}
  </Pagination>
</footer>

<Modal
  open={selectedId !== null}
  onOpenChange={() => (selectedId = null)}
  triggerBase="btn preset-tonal"
  contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-(--breakpoint-sm)"
  backdropClasses="backdrop-blur-xs"
>
  {#snippet content()}
    <header class="flex justify-between">
      <h2 class="h2 text-error-500">Delete Link</h2>
    </header>
    <article>
      <p class="opacity-60">Are you sure you'd like to delete this link?</p>
    </article>
    <footer class="flex justify-end gap-4">
      <form action="?/delete" method="POST">
        <input type="hidden" name="shortId" value={selectedId} />
        <button type="button" class="btn preset-tonal" onclick={() => (selectedId = null)}>
          Cancel
        </button>
        <button type="submit" class="btn preset-filled-error-500 font-bold">Confirm</button>
      </form>
    </footer>
  {/snippet}
</Modal>
