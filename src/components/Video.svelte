<div class="video-container">
  <div 
    class="video {clazz || ''}"
  
    class:video--playing={isPlaying}
    class:video--error={isError}
    class:video--started={percent > 0}
    class:video--loading={isLoading}
    class:video--preview={openInViewer}
  
    style:--aspect={post.video?.aspectRatio || 1}
    style:--percent={percent}
    style:--volume={volume}
  
    data-duration={durationLabel}
  
    bind:this={containerRef}
  >
    <video
      poster={poster}
      loop={isLoop}
      width="100%"
      bind:this={videoRef}
      ontimeupdate={updateProgress}
      onerror={() => isError = true}
      onplay={() => isPlaying = true}
      onpause={() => isPlaying = false}
    >
      <track kind="captions" />
    </video>
  
    {#if !isPlaying && percent === 0}
      <button 
        class="video__play-button clear" 
        class:video__play-button--big={!isLoading}
        onclick={playVideo}
      />
    {/if}
  
    {#if isLoading}
      <div class="video__spinner-container">
        <Spinner />
      </div>
    {/if}
  
    {#if isPlaying || percent > 0}
      <div class="video__controls">
        <button 
          class="video__play-button clear" 
          onclick={playVideo}
        />
  
        <TrackControl 
          bind:value={percent}
          onTrackState={handlePlayPosition}
          counter={counter + " / " + formatTime(post.video?.duration)} 
        />
  
        <div class="f f--aic f--g-base">
          <img src={volumeIcon} alt="Volume">
          
          <TrackControl
            class="video__volume"
            bind:value={volume}
            nailWidth={9}
          />
        </div>
  
        <button class="video__fullscreen-button clear" onclick={goFullscreen}>
          <img src="/icons/ic-fullscreen.png" alt="Fullscreen">
        </button>
      </div>
    {/if}
  </div>

  {#if !hideTitle }
    <div class="video-container__footer">
      <div class="video-container__title">
        <div class="monoiconset-movie" /> { post.video.filename }
      </div>

      <div class="video-container__views-label">
        { post.views } views
      </div>
    </div>
  {/if}
</div>

<script lang="ts">
  import { formatTime } from "$lib/utils";
  import { MessageModel } from "../models/message.model";
  import { VideoModel } from "../models/video.model";

  import TrackControl from "./TrackControl.svelte";
  import Spinner from "./Spinner.svelte";
  import { onMount } from "svelte";
  import { MediaService } from "$lib/media.service";

  interface Props {
    autoplay?: boolean;
    post: MessageModel;
    openInViewer?: boolean;
    class?: string;
  }

  let { autoplay, post, openInViewer, class: clazz }: Props = $props();

  const mediaService = new MediaService;
  const volumeIcons = [
    '/icons/ic-volume-muted.png',
    '/icons/ic-volume-low.png',
    '/icons/ic-volume-med.png',
    '/icons/ic-volume-high.png',
  ]
  const durationLabel = $derived(post.video?.duration
    ? formatTime(post.video.duration)
    : '');


  let videoRef: HTMLVideoElement;
  let containerRef: HTMLDivElement;
  let volume = $state(VideoModel.volume);
  let percent = $state(0);
  let counter = $state('');
  let poster = $state('');
  let dragging = $state(false);
  let isPlaying = $state(false);
  let isError = $state(false);
  let isLoading = $state(false);
  let isLoop = $state(false);
  let isFullscreen = $state(false);
  let hideTitle = $state(false);

  $effect(() => {
    if (videoRef) {
      videoRef.volume = volume;
    }
  });

  const volumeIcon = $derived(volumeIcons[Math.round(volume * 3)]);

  const loadVideo = async () => {
      isLoading = true;

      const url = await post.video!.getUrl();
      if (!url) return;

      videoRef.src = url;
      isLoading = false;
  }

  const playVideo = async () => {
    if (openInViewer) {
      mediaService.currentPost = post;
      return;
    }

    if (isPlaying) {
      videoRef.pause();
      return;
    }

    if (!videoRef.src) {
      await loadVideo();
    }

    if (!videoRef.src) return;

    volume = VideoModel.volume;
    videoRef.volume = volume;
    videoRef.play();
  }

  const updateProgress = () => {
    if (dragging) return;
    if (!videoRef) return;

    percent = videoRef.currentTime / post.video!.duration;
    counter = formatTime(videoRef.currentTime);
  }

  const handlePlayPosition = (started: boolean) => {
    dragging = started;

    if (!started) {
      videoRef.currentTime = videoRef.duration * percent;
    }
  };

  const goFullscreen = () => {
    if (document.fullscreenElement === containerRef) {
      document.exitFullscreen();
      isFullscreen = false;
      return;
    }

    containerRef.requestFullscreen();
    isFullscreen = true;
  }

  const loadPoster = async () => {
    if (!videoRef) return;
    videoRef.poster = await post.video!.getThumbUrl()!;

    if (autoplay) playVideo();
    hideTitle = videoRef.offsetWidth < 360 || !openInViewer;
  }

  onMount(loadPoster);

  console.log(post);
</script>

<style lang="scss">
  .video-container {
    display: flex;
    flex-direction: column;
    gap: var(--gap);

    &__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--color-main);
    }

    &__title {
      display: flex;
      gap: var(--gap-small);
      align-items: center;
    }

    &__views-label {
      color: var(--color-gray);
    }
  }

  .video {
    --aspect: 16/9;
    --percent: 0;
    --volume: 1;

    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    color: white;
    font-size: 0;
    background-color: black;
    aspect-ratio: 16/9;

    &--preview {
      aspect-ratio: var(--aspect);
    }

    .fas {
      font-size: 16px;
    }

    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    button {
      cursor: pointer;
      background-color: transparent;
      border: 0;
    }

    &:not(&--started):not(&--playing)::before {
      content: attr(data-duration);

      position: absolute;
      right: 0;
      bottom: 0;
      width: max-content;
      color: white;
      background-color: #00000055;
      z-index: 1;
      font-size: 11px;
      padding: 2px 4px;
    }

    p {
      font-size: 11px;
      color: white;
    }

    &--native {
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    &__message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &__controls {
      position: relative;
      height: 45px;
      width: 100%;
      background-color: #00000055;
      display: flex;
      align-items: center;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      padding: 0 var(--gap-large);
      box-sizing: border-box;
      gap: var(--gap-large);
    }

    &--playing:hover &__controls,
    &--started &__controls {
      opacity: 1;
    }

    &__play-button {
      padding: 0;
      border: 0;
      background-color: transparent;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;

      &::before {
        content: '\f04b';
        display: inline-block;
        color: white;
        font-family: var(--fa-font);
        font-weight: 900;
      }

      &--big, &--loading {
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: #00000055;
        height: 60px;
        transform: translate(-50%, -50%);
        border-radius: 3px;
        font-size: 24px;
        width: 50px;
        height: 50px;
      }

    }

    &--playing &__play-button::before {
      content: '\f04c';
      font-family: var(--fa-font);
      font-weight: 900;
    }

    :global(.video__volume) {
      width: 50px;
    }

    &__fullscreen-button {
      height: 100%;
    }

    &__spinner-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;

      :global(.spinner) {
        --dash-width: 16px;
        --dash-height: 8px;
        --first-color: #ffffff88;
        --second-color: white;

        gap: 4px;
      }
    }
  }
</style>
