<script lang="ts">
  import { route } from '$lib/ROUTES';
</script>

<div class="grid grid-cols-2 gap-2">
  <a class="btn preset-tonal" href={route('/admin/links')}>Links</a>
  <a class="btn preset-tonal" href={route('/admin/posts')}>Posts</a>
  <!-- <a  href={route('/admin/tags')}>Tags</a>
  <a  href={route('/admin/users')}>Users</a> -->
</div>
