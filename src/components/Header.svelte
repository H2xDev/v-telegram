<header class="block-blue header">
	<img class="header__logo" src="https://vtelege-530a8.web.app/logo.png" alt="Logo">

	<nav class="header__navigation">
		<a href="/channels">Channels</a>

    <div class="header__music-player">
      <a href="/music">
        Music
      </a>
      <button 
        class="header__play-button"
        class:header__play-button--playing={isPlaying}
        title={playLabel}
      ></button>
    </div>

		<a href="/logout">Logout</a>
	</nav>
</header>

<script lang="ts">
  import type { MusicModel } from "$models/music.model";
  import { MusicService, MusicServiceEvents } from "@/lib/music.service";
  import { onDestroy } from "svelte";

  const musicService = new MusicService;
  const audio = musicService.getAudio();

  let isPlaying = $state(audio ? !audio.paused : false);
  let song = $state(musicService.settings.music);

  const playLabel = $derived(song ? `Currently playing: ${song.artist} - ${song.songName}` : 'No song playing');

  const onPlay = (newSong: MusicModel | null) => {
    isPlaying = true;
    song = newSong;
  }

  const onPause = () => isPlaying = false;

  onDestroy(musicService.on(MusicServiceEvents.PLAY_STARTED, onPlay));
  onDestroy(musicService.on(MusicServiceEvents.PLAY_PAUSED, onPause));
</script>

<style lang="scss">
.header {
	min-height: var(--header-height);
	padding: var(--gap);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: sticky;
	top: 0;
	z-index: 100;
		
	&__logo {
		margin: -1.5px 0;
	}

	&__navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--gap-large);
	}

  &__music-player {
    display: flex;
    align-items: center;
    gap: var(--gap);
  }

  &__play-button {
    background: url('/icons/playpause_large.png');
    width: 22px;
    height: 22px;
    border: none;
    cursor: pointer;

    &--playing {
      background-position-y: -22px;
    }
  }

  a {
    color: white;
    font-weight: 700;
  }
}
</style>
