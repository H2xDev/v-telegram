<video 
  autoplay
  muted
  loop
  class="round-video"
  bind:this={videoEl}
  onmouseover={unmute}
  onfocus={unmute}
  onmouseout={mute}
  onblur={mute}
></video>

<script lang="ts">
  import { getNearScrollableElement } from "$lib/utils";
  import { onDestroy, onMount } from "svelte";
  import type { MessageModel } from "../models/message.model";

  interface Props {
    post: MessageModel;
  }

  let { post }: Props = $props();

  let videoEl: HTMLVideoElement;
  let scrollParent: HTMLElement | Window = window;

  const loadVideoAndPlay = async () => {
    if (!post.round) return;
    videoEl.src = (await post.round.getUrl())!;
    videoEl.play();
  }

  const checkVideoInViewport = async () => {
    const rect = videoEl.getBoundingClientRect();

    if (rect.y < window.innerHeight && rect.y + rect.height > 0) {
      loadVideoAndPlay();
      scrollParent.removeEventListener('scroll', checkVideoInViewport);
    }
  }

  const mute = () => {
    videoEl.muted = true;
  }

  const unmute = () => {
    videoEl.muted = false;
  }

  onMount(async () => {
    scrollParent = getNearScrollableElement(videoEl);
    scrollParent.addEventListener('scroll', checkVideoInViewport);
    videoEl.poster = await post.round!.getThumbUrl();

    checkVideoInViewport();
  })

  onDestroy(() => {
    scrollParent.removeEventListener('scroll', checkVideoInViewport);
  })
</script>

<style lang="scss">
  .round-video {
    max-width: 200px;
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid transparent;
    will-change: border-color, transform;
    transition: 0.4s;
    transform: scale(0.9);
    margin: 0 auto;

    &:hover {
      border-color: var(--color-border);
      transform: none;
    }
  }
</style>
