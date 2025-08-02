<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<div class="grid grid-cols-2 gap-2">
  <a class="btn preset-tonal" href={resolve('/admin/links')}>Links</a>
  <a class="btn preset-tonal" href={resolve('/admin/posts')}>Posts</a>
  <!-- <a  href={resolve('/admin/tags')}>Tags</a>
  <a  href={resolve('/admin/users')}>Users</a> -->
</div>
