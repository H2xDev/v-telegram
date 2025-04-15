<button 
  class="play-button"
  class:play-button--playing={isPlaying}
  title={playLabel}
  bind:this={playButtonEl}
></button>

<!--<div class="mini-music-player">
  <p>Music playlist:</p>

  <div class="mini-music-player__body">

  </div>
</div> -->

<script lang="ts">
  import type { MusicModel } from "$models/music.model";
  import { MusicService, MusicServiceEvents } from "@/lib/music.service";
  import { onDestroy } from "svelte";

  const musicService = new MusicService;
  const audio = musicService.getAudio();

  let isPlaying = $state(audio ? !audio.paused : false);
  let song = $state(musicService.settings.music);
  let playButtonEl: HTMLButtonElement | null = $state(null);

  const playLabel = $derived(song ? `Currently playing: ${song.artist} - ${song.songName}` : 'No song playing');

  const onPlay = (newSong: MusicModel | null) => {
    console.log('onPlay', newSong);
    isPlaying = true;
    song = newSong;
  }

  const onPause = (pausedSong: MusicModel | null) => {
    if (pausedSong !== song) return;
    isPlaying = false;
  }

  onDestroy(musicService.on(MusicServiceEvents.PLAY_PAUSED, onPause));
  onDestroy(musicService.on(MusicServiceEvents.PLAY_STARTED, onPlay));
</script>

<style lang="scss">
  .play-button {
    background: url('/icons/playpause_large.png');
    width: 22px;
    height: 22px;
    border: none;
    cursor: pointer;

    &--playing {
      background-position-y: -22px;
    }
  }

  .mini-music-player {
    position: fixed;
    top: var(--header-height);
    right: 0;
    height: 300px;
    width: 200px;
    background-color: var(--color-bg);
    border-radius: var(--border-radius);
    color: var(--color-main);
    padding: var(--gap);
    box-sizing: border-box;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    gap: var(--gap);

    &__body {
      padding: var(--gap);
      background-color: white;
      flex: auto;
    }
  }
</style>
