<div class="message" class:message--same={post.isPreviousSame} class:message--out={post.isOut}>
  {#if !post.isPreviousSame}
    <VkAvatar class="message__avatar" id={ post.fromId } />
  {/if}
  <div class="message__body">
    {#if !post.isPreviousSame}
      <a class="message__name" href="/{ post.user?.username }">
        { post.user?.fullName }
      </a>
    {/if}

    {@html formatMarkdown(post.message, post.raw.entities || []) }

    {#if post.hasAttachments}
      <div class="post__attachments" class:post__attachments--multiple={isMultipleAttachments}>
        {#each post.group as subPost}
          {#if subPost.video}
            <Video post={subPost} openInViewer />
          {/if}

          {#if subPost.photo}
            <Photo post={subPost} openInViewer />
          {/if}

          {#if subPost.round}
            <RoundVideo post={subPost} />
          {/if}

          {#if subPost.sticker}
            <Sticker post={subPost} />
          {/if}

          {#if subPost.file}
            <FilePreview post={subPost} />
          {/if}
        {/each}
      </div>
    {/if}
    <Reactions { post } />
  </div>
  <div class="message__date">
    { post.date.toLocaleTimeString() }
  </div>
</div>

<script lang="ts">
  import { formatMarkdown } from "$lib/utils";
  import type { MessageModel } from "../models/message.model";
  import VkAvatar from "./VkAvatar.svelte";
  import Video from "./Video.svelte";
  import Photo from "./Photo.svelte";
  import RoundVideo from "./RoundVideo.svelte";
  import Sticker from "./Sticker.svelte";
  import FilePreview from "./FilePreview.svelte";
  import Reactions from "./Reactions.svelte";

  interface Props {
    post: MessageModel;
  }

  let { post }: Props = $props();
  const isMultipleAttachments = $derived(post.group.length > 1 && post.hasAttachments);
</script>

<style lang="scss">
  .message {
    display: flex;
    box-sizing: border-box;
    align-items: flex-start;
    gap: var(--gap);
    color: var(--color-secondary);
    width: 100%;

    :global &__avatar {
      font-size: 0;
      position: relative;
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }

    :global &--same &__avatar {
      opacity: 0;
    }

    &--same {
      padding: 0;
      padding-left: calc(30px + var(--gap));
      margin-top: calc(-1 * var(--gap-small));
    }

    &__name {
      line-height: 1;
      font-weight: 700;
    }

    &__body {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }

    &__date {
      text-align: right;
      font-size: 10px;
      flex-shrink: 0;
      color: var(--color-gray);
    }
  }
</style>
