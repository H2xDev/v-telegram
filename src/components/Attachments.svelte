<div 
  class="{ clazz } attachments"
  class:attachments--small={isMultipleAttachments || small}
>
  {#each post.group as subPost}
    {#if subPost.video}
      <Video post={subPost} openInViewer />
    {/if}

    {#if subPost.round}
      <RoundVideo post={subPost} />
    {/if}

    {#if subPost.photo}
      <Photo post={subPost} openInViewer />
    {/if}

    {#if subPost.sticker}
      <Sticker post={subPost} />
    {/if}

    {#if subPost.file}
      <FilePreview post={subPost} />
    {/if}
  {/each}
</div>

<script lang="ts">
  import type { MessageModel } from "$models/message.model";
  import FilePreview from "./FilePreview.svelte";
  import Photo from "./Photo.svelte";
  import RoundVideo from "./RoundVideo.svelte";
  import Video from "./Video.svelte";
  import Sticker from "./Sticker.svelte";

  interface Props { 
    post: MessageModel;
    class?: string;
    small?: boolean;
  }

  let { post, class: clazz = '', small }: Props = $props();

  const hasAttachments = $derived(post.group.some((p) => p.video || p.photo || p.round));
  const isMultipleAttachments = $derived(post.group.length > 1 && hasAttachments);
</script>

<style lang="scss">
  .attachments {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--gap);

    &--small {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    &:not(:has(*)) {
      display: none;
    }
  }
</style>
