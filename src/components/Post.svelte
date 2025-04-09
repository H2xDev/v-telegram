<div class="post" class:post--repost={repost}>
  {#if !compact}
    <Avatar class="post__avatar" id={post.authorId} />
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
      <div class="post__attachments" class:post__attachments--multiple={isMultipleAttachments}>
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
        {/each}
      </div>
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
    </div>
  </div>
</div>

<script lang="ts">
  import { formatMarkdown } from "$lib/utils";
  import type { MessageModel } from "../models/message.model";
  import Avatar from "./Avatar.svelte";
  import Video from "./Video.svelte";
  import Photo from "./Photo.svelte";
  import RoundVideo from "./RoundVideo.svelte";
  import SmallMusicPlayer from "./SmallMusicPlayer.svelte";

  interface Props {
      post: MessageModel;
      compact?: boolean;
      noTitle?: boolean;
      repost?: boolean;
  }

  let { post, compact, noTitle, repost }: Props = $props();
  const hasAttachments = $derived(post.group.some((p) => p.video || p.photo || p.round));
  const hasMusic = $derived(post.group.some(p => p.music));
  const isMultipleAttachments = $derived(post.group.length > 1 && hasAttachments);
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

  &--repost {
    border-left: 2px solid var(--color-main);
    padding-left: var(--gap);
  }

  &__content {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--gap);
  }

  &__footer {
    margin-top: auto;
  }

  &__attachments {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--gap);

      &--multiple {
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }
  }

  :global(.user-avatar) {
    position: sticky;
    top: calc(var(--gap) + 43px);
  }


  :global .post__avatar {
    width: 50px;
    height: 50px;
  }
}
</style>
