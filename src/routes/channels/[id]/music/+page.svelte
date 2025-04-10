<svelte:head>
  <title>{ params.id } | Music</title>
</svelte:head>

<MusicPage { params } />

<script lang="ts">
  import { page } from '$app/state';
  import MusicPage from '@/shared-pages/music.page.svelte';

  const { params } = page;
</script>
