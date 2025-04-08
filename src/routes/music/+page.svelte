<main class="music-page">
  {#if currentSong}
    {#key currentSong.id }
      <SmallMusicPlayer
        class="music-page__player"
        post={{ music: currentSong }}
        big
      />
    {/key}
  {/if}

  <form class="music-page__search">
    <input type="text" placeholder="Search" />
  </form>

  <div class="music-page__list">
    {#each musicList as post}
      <SmallMusicPlayer class="music-page__song-item" { post } />
    {/each}
  </div>
</main>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { MusicService, MusicServiceEvents } from "$lib/music.service";
  import SmallMusicPlayer from "$components/SmallMusicPlayer.svelte";
  import type { MessageModel } from "$models/message.model";
  import type { MusicModel } from "$models/music.model";

  const musicService = new MusicService;
  let musicList: MessageModel[] = $state([]);
  let isFinal = $state(false);
  let isLoading = $state(true);
  let currentSong: MusicModel | null = $state(null);

  const appendMusic = (newMusic: MessageModel[]) => {
      if (newMusic.length === 0) {
          isFinal = true;
          return;
      }
      musicList = [...musicList, ...newMusic];
  }

  const onScroll = () => {
      if (isLoading || isFinal) return;

      if (window.scrollY + window.innerHeight > document.body.offsetHeight - 100) {
          isLoading = true;
          musicService
              .getMusicList(musicList[musicList.length - 1].id)
              .then(appendMusic)
              .finally(() => isLoading = false);
      }
  }

  onMount(async () => {
    musicList = await musicService.getMusicList().finally(() => isLoading = false);
    window.addEventListener('scroll', onScroll);
    musicService.on(MusicServiceEvents.MUSIC_CHANGED, (music: MusicModel | null) => {
      currentSong = music;
    });
    currentSong = musicService.currentMusic || musicList[0].music;
  });

  onDestroy(() => {
    window.removeEventListener('scroll', onScroll);
  });
</script>

<style lang="scss">
  .music-page {
    margin-right: var(--gap);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--gap);

    &__list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      padding: 0 var(--gap);
    }

    &__search {
      padding: 0 var(--gap);

      input {
        padding: 6px 10px;
      }
    }

    :global &__player {
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-main-light);
      position: sticky;
      top: var(--header-height);
    }

    :global &__song-item {
      padding: var(--gap) !important;
    }
  }
</style>
