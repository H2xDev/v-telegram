<div
  class="music-player { clazz || '' }"
  class:music-player--playing={isPlaying}
  class:music-player--not-supported={!music?.isSupported}
  style:--percent={percent}
>
  <div class="music-player__controls">
    <button
      class="music-player__play-button"
      onclick={play}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    ></button>

    <button
      class="music-player__song-prev"
      aria-label="Previous Song"
      onclick={handlePrevSong}
    ></button>
    <button
      class="music-player__song-next"
      aria-label="Next Song"
      onclick={handleNextSong}
    ></button>
  </div>

  <div class="music-player__info">
    <p class="music-player__artist" title={music?.artist}>
      {music?.artist.slice(0, 20) + ((music?.artist || '').length > 20 ? '...' : '')}
    </p>
    –
    <p class="music-player__title" title={music?.songName}>
      {music?.songName}
    </p>

    <p class="music-player__duration">{isPlaying ? playedTime : formatTime(music?.duration || 0)}
    </p>
  </div>

  <div class="music-player__track-controls">
    <TrackControl 
      class="music-player__timeline"
      bind:value={percent}
      onDragStateChange={onNailStateChanged}
    />

    <TrackControl 
      class="music-player__volume-control"
      bind:value={volume}
    />
  </div>

  <div class="music-player__state-controls">
    <button 
      class="music-player__loop-button"
      class:music-player__loop-button--active={loop}
      onclick={() => loop = !loop}
    >
    </button>
  </div>
</div>

<script lang="ts">
  import { MusicService, MusicServiceEvents } from "$lib/music.service";
  import { formatTime } from "$lib/utils";
  import { onDestroy, onMount, tick } from "svelte";
  import TrackControl from "./TrackControl.svelte";
  import type { MusicModel } from "$models/music.model";

  interface Props {
    class?: string;
    onNextSongRequest?: () => void;
    onPrevSongRequest?: () => void;
  }

  let { 
    class: clazz = '', 
    onNextSongRequest,
    onPrevSongRequest,
  }: Props = $props();

  const musicService = new MusicService
  let music = $state(musicService.settings.music);
  const audio = $derived(musicService.getAudio(music));

  let isPlaying = $state(audio ? !audio.paused : false);
  let isDragging = $state(false);
  let percent = $state((audio?.currentTime || 0) / music?.duration);
  let playedTime = $state('');
  let volume = $state(musicService.settings.volume);
  let loop = $state(musicService.settings.loop);

  const play = () => {
    if (!audio || !music) return;

    if (!isPlaying) {
      audio.play();
      return;
    }

    audio.pause();
  };

  const onNailStateChanged = (dragState: boolean) => {
    if (!music || !audio) return;

    if (!dragState) {
      audio.currentTime = percent * music?.duration;
    }

    isDragging = dragState;
  }

  const updateProgress = () => {
    if (!music || !audio) return;

    if (!isDragging) {
      percent = Math.min(1, audio.currentTime / music.duration);
    }

    if (music.duration === 0) {
      percent = 0;
      return;
    }

    playedTime = formatTime((1 - percent) * music.duration);
    isPlaying = !audio.paused;
  }

  const onPause = () => {
    isPlaying = false;
  }

  const onPlay = () => {
    isPlaying = true;
  }

  const handleNextSong = async () => {
    onNextSongRequest?.();
  }

  const handlePrevSong = async () => {
    if (audio && audio.currentTime > 3) {
      percent = 0;
      playedTime = formatTime(music!.duration);
      audio.currentTime = 0;
      return;
    }

    onPrevSongRequest?.();
  }

  const onMusicChange = (newMusic: MusicModel | null) => {
    if (!newMusic) return;

    const newAudio = musicService.getAudio(newMusic);

    if (audio && audio !== newAudio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('timeupdate', updateProgress);
    }

    percent = 0;
    playedTime = formatTime(0);
    music = newMusic;

    if (newAudio) {
      newAudio.addEventListener('timeupdate', updateProgress);
      newAudio.play();
    }
  }

  onDestroy(musicService.on(MusicServiceEvents.MUSIC_CHANGED, onMusicChange));
  onDestroy(musicService.on(MusicServiceEvents.PLAY_PAUSED, onPause));
  onDestroy(musicService.on(MusicServiceEvents.PLAY_STARTED, onPlay));

  $effect(() => {
    musicService.settings.volume = volume;
    musicService.settings.loop = loop;
  })
</script>

<style lang="scss">
  .music-player {
    --percent: 0;

    padding: 12px 10px;
    display: grid;
    align-items: center;
    grid-template-columns: 64px 1fr;
    gap: var(--gap-small) var(--gap);
    width: 100%;
    box-sizing: border-box;
    grid-template-areas: 
      'controls info state'
      'controls track state';

    &__state-controls {
      display: flex;
      align-items: center;
      grid-area: state;
    }

    &__controls {
      display: flex;
      align-items: center;
      grid-area: controls;
      gap: var(--gap-small);
    }

    &__track-controls {
      display: flex;
      align-items: center;
      gap: var(--gap);
      width: 100%;
      grid-area: track;
    }

    &__play-button,
    &__song-prev,
    &__song-next,
    &__loop-button {
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
    }

    &__play-button {
      width: 22px;
      height: 22px;
      background-image: url('/icons/playpause_large.png');
    }

    &:where(&--playing) &__play-button {
      background-position-y: -22px;
    }

    &__song-prev {
      background: url(/icons/ic-prev-song.png);
    }

    &__song-next {
      background: url(/icons/ic-next-song.png);
    }

    &__loop-button {
      background: url(/icons/ic-loop.png);
      opacity: 0.5;

      &--active,
      &:hover {
        opacity: 1;
      }
    }

    &__info {
      display: flex;
      align-items: center;
      gap: 5px;
      flex: auto;
      grid-area: info;
      padding-right: 74px;
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
      font-size: 11px;
    }

    :global &__timeline {
      --track-bg-color: var(--color-bg) !important;
      --track-fg-color: var(--color-main) !important;
    }

    :global &__volume-control {
      max-width: 60px;
      --track-bg-color: var(--color-bg) !important;
      --track-fg-color: var(--color-main) !important;
    }

    &--not-supported {
      opacity: 0.5;
    }
  }
</style>
