<div 
  class="post"
  class:post--repost={repost}
  id={post.id}
>
  {#if !compact}
    <VkAvatar class="post__avatar" id={post.authorId} />
  {/if}

  <div class="post__content">
    {#if !noTitle}
    <p class="t-main">
      { post.channel.title }
    </p>
    {/if}

    {#if post.message}
      <div class="small-text">
        {@html formatMarkdown(post.message, post.raw.entities || []) }
      </div>
    {/if}

    {#if hasAttachments}
      <Attachments class="post__attachments" { post } />
    {/if}

    {#if hasMusic}
      <div class="post__music-list">
        {#each post.group as subPost}
          {#if subPost.music}
            <SmallMusicPlayer post={subPost} />
          {/if}
        {/each}
      </div>
    {/if}

    <div class="post__footer">
      <span class="post__date small-text-hint">
        { post.date.toLocaleString() }
      </span>
      <Reactions { post } />
    </div>

    <CommentarySection { post } />
  </div>
</div>

<script lang="ts">
  import { formatMarkdown } from "$lib/utils";
  import type { MessageModel } from "../models/message.model";
  import VkAvatar from "./VkAvatar.svelte";
  import SmallMusicPlayer from "./SmallMusicPlayer.svelte";
  import CommentarySection from "./CommentarySection.svelte";
  import Attachments from "./Attachments.svelte";
  import Reactions from "./Reactions.svelte";

  interface Props {
      post: MessageModel;
      compact?: boolean;
      noTitle?: boolean;
      repost?: boolean;
  }

  let { post, compact, noTitle, repost }: Props = $props();

  const hasMusic = $derived(post.group.some(p => p.music));
  const hasAttachments = $derived(post.group.some((p) => p.video || p.photo || p.round));
</script>

<style lang="scss">
.post {
  position: relative;
  display: flex;
  border-bottom: 1px solid var(--color-border);
  gap: var(--gap);
  padding-bottom: var(--gap);
  word-break: break-word;
  width: 100%;
  box-sizing: border-box;

  --content-height: 0;

  &--repost {
    border-left: 2px solid var(--color-main);
    padding-left: var(--gap);
  }

  &__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    // position: sticky;
    // top: calc(var(--header-height));
    background-color: white;
    z-index: 1;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  &__footer {
    margin-top: auto;
    display: flex;
    gap: var(--gap);
    align-items: flex-end;
    justify-content: space-between;
  }

  &__date {
    flex-shrink: 0;
    margin-bottom: 2px;
    font-size: 10px;
  }

  :global(.user-avatar) {
    position: sticky;
    top: calc(var(--gap) + var(--header-height));
  }

  :global .post__avatar {
    width: 50px;
    height: 50px;
  }
}
</style>
