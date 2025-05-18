<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  const { data } = $props();

  const { form, enhance, errors, constraints } = superForm(data.form);
</script>

<h1>Login</h1>

<form method="post" class="grid grid-cols-2 gap-4" use:enhance>
  <label class="label">
    <span class="label-text">Email:</span>
    <input
      class="input"
      type="email"
      name="email"
      placeholder="Email"
      aria-invalid={$errors.email ? 'true' : undefined}
      bind:value={$form.email}
      {...$constraints.email}
    />
    {#if $errors.email}<span class="invalid">{$errors.email}</span>{/if}
  </label>
  <label class="label">
    <span class="label-text">Password</span>
    <input
      class="input"
      type="password"
      name="password"
      placeholder="Password"
      aria-invalid={$errors.password ? 'true' : undefined}
      bind:value={$form.password}
      {...$constraints.password}
    />
    {#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}
  </label>

  {#if $errors.signup}
    <div class="col-span-2">We have found you aren't a member yet, would you like to sign up?</div>
    <input type="hidden" name="signup" value="true" />
  {/if}

  <!-- TODO: Instead of just making the user -->
  <!-- If no user found prompt for more info -->
  <button type="submit" class="btn preset-tonal-primary">
    {#if $errors.signup}
      Sign Up
    {:else}
      Login
    {/if}
  </button>
</form>
