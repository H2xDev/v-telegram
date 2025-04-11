{#if src}
  {#if post.sticker!.isStatic}
    <img class="sticker sticker--static" { src } />
  {:else if !post.sticker!.isVideo}
    <tgs-player
      class="sticker sticker--animated"
      src={src}
      mode="normal"
      autoplay
      loop
    />
  {:else}
    <video class="sticker sticker--video" autoplay muted loop src={src} />
  {/if}
{/if}

<script lang="ts">
  import type { MessageModel } from "$models/message.model";
  import { onMount } from "svelte";

  interface Props {
    post: MessageModel;
  }

  let { post }: Props = $props();
  let src = $state('');

  onMount(async () => {
    src = await post.sticker?.getUrl() || '';
  });
</script>

<style lang="scss">
  .sticker {
    display: block;
    width: 150px;
    height: auto;
    aspect-ratio: 1;
    object-fit: cover;
  }
</style>
