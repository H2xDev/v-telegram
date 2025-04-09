<div
  class="music-player { clazz || '' }"
  class:music-player--playing={isPlaying}
  class:music-player--not-supported={!post.music?.isSupported}
  class:music-player--big={big}
  style:--percent={percent}
>
  <div class="music-player__controls">
    <button
      class="clear music-player__play-button"
      onclick={play}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    ></button>

    <div class="music-player__info">
      <p class="music-player__artist" title={post.music.artist}>
        {post.music.artist.slice(0, 20) + (post.music.artist.length > 20 ? '...' : '')}
      </p>
      –
      <p class="music-player__title" title={post.music.songName}>
        {post.music.songName}
      </p>

      <p class="music-player__duration">
        {isPlaying ? playedTime : formatTime(post.music.duration)}
      </p>
    </div>

    {#if isPlaying}
      <div class="music-player__track" onmousedown={dragNail} role="slider" tabindex="-1" aria-valuenow={percent}>
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import { MusicService } from "$lib/music.service";
  import { formatTime } from "$lib/utils";
  import type { MessageModel } from "$models/message.model";
  import { onDestroy, onMount } from "svelte";

  interface Props {
    post: MessageModel;
    class?: string;
    big?: boolean;
  }
  let { post, class: clazz = '', big }: Props = $props();

  const musicService = new MusicService
  const music = musicService.getAudio(post.music!)

  let isPlaying = $state(music ? !music.paused : false);
  let percent = $state((music?.currentTime || 0) / post.music!.duration);
  let playedTime = $state('');
  let isDragging = $state(false);

  const play = () => {
    if (!music) return;
    musicService.beginStream(post.music!);

    if (!isPlaying) {
      music.play();
      return;
    }
    music.pause();
  };

  const dragNail = (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    isDragging = true;

    const mouseMove = (m: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = m.clientX - rect.left;
      percent = Math.max(0, Math.min(1, x / rect.width));
    }

    mouseMove(e);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', mouseMove);
      music.currentTime = percent * post.music.duration;

      isDragging = false;
    }, { once: true });
  }

  const updateProgress = () => {
    if (!isDragging) {
      percent = music.currentTime / post.music.duration;
    }

    playedTime = formatTime((1 - percent) * post.music!.duration);
  }

  const onPause = () => {
    isPlaying = false;
  }

  const onPlay = () => {
    isPlaying = true;
  }

  const onFinish = () => {
    isPlaying = false;
    music.currentTime = 0;
  }

  onMount(() => {
    if (!music) return;
    music.addEventListener('play', onPlay)
    music.addEventListener('pause', onPause)
    music.addEventListener('timeupdate', updateProgress)
    music.addEventListener('ended', onFinish);
  });

  onDestroy(() => {
    if (!music) return;
    music.removeEventListener('playing', onPlay)
    music.removeEventListener('pause', onPause)
    music.removeEventListener('timeupdate', updateProgress)
    music.removeEventListener('ended', onFinish);
  });
</script>

<style lang="scss">
  .music-player {
    --percent: 0;

    display: flex;
    flex-direction: column;
    gap: var(--gap-small);
    padding: var(--gap-small);
    border-radius: 2px;

    &:hover {
      background-color: #EDF1F5;
    }

    &__controls {
      display: grid;
      align-items: center;
      grid-template-columns: 16px 1fr;
      grid-template-areas: 
        'play-button info';

      gap: var(--gap);
      width: 100%;
      box-sizing: border-box;
    }

    &--playing &__controls {
      align-items: flex-start;
      grid-template-areas: 
        'play-button info'
        'play-button track';
    }

    &__play-button {
      width: 16px;
      height: 16px;
      border-radius: 2px;
      background: url(/playpause.gif);
      color: white;
      border: 0;
      font-size: 9px;
      padding: 0;
      cursor: pointer;
      flex-shrink: 0;
      grid-area: play-button;
    }

    &--playing &__play-button {
      background-position-y: -16px;
    }

    &__info {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: auto;
      grid-area: info;
    }

    &__artist {
      font-weight: bold;
      color: var(--color-main-dark);
    }

    &__title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100px;
    }

    &__duration {
      flex: auto;
      text-align: right;
      color: var(--color-gray);
      font-size: 0.9em;
    }

    &__track {
      position: relative;
      height: 5px;
      grid-area: track;

      &::before {
        content: '';
        display: block;
        height: 1px;
        background-color: var(--color-bg);
      }

      &::after { // nail
        content: '';
        height: 5px;
        width: 15px;
        display: block;
        background-color: var(--color-main);
        margin-top: -1px;
        left: calc(100% * var(--percent));
        margin-left: calc(-15px * var(--percent));
        position: relative;
      }
    }

    &--big {
      padding: 12px 10px;
    }

    &--big:where(&--playing) &__play-button {
      background-position-y: -22px;
    }
  }

  .music-player--big .music-player {
    &__controls {
      padding: 0;
      grid-template-columns: 22px 1fr;
      gap: var(--gap-small) var(--gap);
    }

    &__track::before {
      height: 4px;
      border-radius: 2px;
    }

    &__track::after {
      left: 0;
      margin-left: 0;
      margin-top: -4px;
      border-radius: 2px;
      height: 4px;
      width: calc(100% * var(--percent));
      background-color: var(--color-main);
    }

    &__play-button {
      width: 22px;
      height: 22px;
      background-image: url('/icons/playpause_large.jpg');
    }

    &__duration {
      font-size: 11px;
    }
  }
</style>
