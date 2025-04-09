{#if post}
<div 
  class="media-viewer" 
  class:media-viewer--video={!!post?.video}
  class:media-viewer--vertical={isVertical}
  class:media-viewer--quad={isQuad}
  style:display={post ? '' : 'none'}

  onmouseup={handleOverlayClick} 

  role="button"
  tabindex="0"
>
  <div class="media-viewer__container">
    <div class="media-viewer__content">
      {#if post?.photo}
        <Photo class="media-viewer__photo" post={post} />
      {/if}

      {#if post?.video}
        <Video class="media-viewer__video" post={post} autoplay />
      {/if}
    </div>

    <div class="media-viewer__info">
      <div class="media-viewer__author f f--g-base">
        <Avatar class="media-viewer__avatar" id={post?.authorId} />
        <span class="page-headline">{post?.channel?.title}</span>
      </div>
      <div class="media-viewer__description f f--c f--g-base">
        <p class="media-viewer__text">
          {@html formatMarkdown(post.parentPost?.message || 'No description', post.parentPost?.raw.entities || [])} 
        </p>

        <div class="media-viewer__meta small-text-hint">
          {post?.date.toLocaleString()}
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<script lang="ts">
  import { MediaService, MediaServiceEvent } from "$lib/media.service";
  import { onDestroy } from "svelte";
  import type { MessageModel } from '../models/message.model';
  import Video from './Video.svelte';
  import Photo from "./Photo.svelte";
  import { formatMarkdown } from "$lib/utils";
  import Avatar from "./Avatar.svelte";

  const mediaService = new MediaService();

  let post: MessageModel | null = $state(null);
  let isVertical = $state(false);
  let isQuad = $state(false);
  let aspectRatio = $state(1);

  const onPostChanged = async (newPost: MessageModel | null) => {
      post = newPost;
      if (!post) return;

      aspectRatio = post.photo?.aspectRatio || post.video?.aspectRatio || 1;
      isQuad = aspectRatio === 1;
      isVertical = aspectRatio < 1;
  };

  const handleOverlayClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
          mediaService.currentPost = null;
      }
  };

  onDestroy(mediaService.on(MediaServiceEvent.POST_CHANGED, onPostChanged));
</script>

<style lang="scss">
:global .media-viewer {
  &__photo {
    aspect-ratio: var(--aspect-ratio) !important;
  } 
  
  &__photo img {
    aspect-ratio: var(--aspect-ratio) !important;
    object-fit: contain !important;
  }

  &__video {
    aspect-ratio: var(--aspect-ratio) !important;
  }
}
.media-viewer {
  --aspect-ratio: 16/9;

  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000088;
  z-index: 101;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  :global &__avatar {
    width: 50px;
    height: 50px;
  }

  &__container {
    background-color: white;
    width: 100%;
    max-width: 790px;
    height: 790px;
    box-sizing: border-box;
    align-self: center;
    justify-self: center;
    display: flex;
    flex-direction: column;
  }

  &__content {
    padding: var(--gap);
  }

  &__content {
    padding: 0;
    aspect-ratio: var(--aspect-ratio);
    width: 100%;
    position: relative;
  }

  &__info {
    padding: var(--gap);
    flex: auto;
    border-left: 1px solid var(--color-border);
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
    gap: var(--gap);
  }

  &__author {
    display: flex;
    gap: var(--gap);
  }

  &__description {
    width: 100%;
  }

  &__text {
    max-height: 300px;
    display: -webkit-box;
    -webkit-line-clamp: 14;
    -webkit-box-orient: vertical;
    overflow: hidden;
    font-size: 11px;
  }

  &__author {
    width: 200px;
    flex-shrink: 0;
    padding-left: var(--gap);
    border-left: 1px solid var(--color-border);
  }

  &__meta {
    border-bottom: 1px solid var(--color-border);
    padding-top: var(--gap);
    padding-bottom: var(--gap);
  }

  &--vertical {
    --aspect-ratio: 9/16;
  }

  &--vertical &__container {
    flex-direction: row;
  }

  &--vertical &__content {
    width: auto;
    height: 100%;
  }

  &--vertical &__info {
    flex-direction: column;
  }

  &--vertical &__author {
    width: 100%;
    border-left: 0;
    padding-left: 0;
  }
}
</style>
