<button 
  class="play-button"
  title={playLabel}
  bind:this={playButtonEl}
  onclick={toggleVisibility}
></button>

{#if isOpened}
<div
  class="mini-music-player"
  bind:this={miniPlayerEl}
>
  <MusicPlayer 
    class="mini-music-player__player" 
    onNextSongRequest={setNextSong}
    onPrevSongRequest={setPreviousSong}
  />

  <div class="mini-music-player__body">
    <div
      class="mini-music-player__scroll-wrapper"
      onscroll={handlePlaylistScroll}
    >
      {#each list as post}
        <SmallMusicPlayer
          class="mini-music-player__song-item"
          {post}
          big={false}
        />
      {/each}

      {#if isLoading}
        <VkSpinner />
      {/if}
    </div>
  </div>

  <div class="mini-music-player__channels">
    <div class="mini-music-player__scroll-wrapper">
      <VkTitleBar> Recommended </VkTitleBar>
      <div class="mini-music-player__list">
        {#each recommendedChannels as channel}
          <VkButton
            class="mini-music-player__channel-item"
            flat={currentPlaylist !== channel.id}
            onClick={setPlaylist.bind(null, channel.id)}
            align="flex-start"
            label={channel.title}
          />
        {/each}
      </div>
      <VkTitleBar> Channels </VkTitleBar>
      <div class="mini-music-player__list">
        {#each channelList as channel}
          <VkButton
            class="mini-music-player__channel-item"
            flat={currentPlaylist !== channel.id}
            onClick={setPlaylist.bind(null, channel.id)}
            align="flex-start"
            label={channel.title}
          />
        {/each}
      </div>
    </div>
  </div>

  <div class="mini-music-player__footer">
    <VkButton
      inline
      label="Close"
      onClick={toggleVisibility}
    />
  </div>
</div>
{/if}

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ChannelService } from "@/lib/channel.service";
  import { MusicService, MusicServiceEvents, RECOMMENDED_CHANNELS } from "@/lib/music.service";
  import type { MusicModel } from "$models/music.model";
  import type { MessageModel } from "$models/message.model";
  import type { ChannelModel } from "$models/channel.model";

  import MusicPlayer from "./MusicPlayer.svelte";
  import SmallMusicPlayer from "./SmallMusicPlayer.svelte";
  import VkButton from "./VkButton.svelte";
  import VkSpinner from "./VkSpinner.svelte";
  import VkTitleBar from "./VkTitleBar.svelte";

  const musicService = new MusicService;
  const channelService = new ChannelService;

  const audio = musicService.getAudio();

  let isPlaying = $state(audio ? !audio.paused : false);
  let isOpened = $state(false);
  let isLoading = $state(true);
  let isFinal = $state(false);
  let song = $state(musicService.settings.music);
  let playButtonEl: HTMLButtonElement | null = $state(null);
  let miniPlayerEl: HTMLDivElement | null = $state(null);
  let list: MessageModel[] = $state([]);
  let channelList: ChannelModel[] = $state([]);
  let recommendedChannels: ChannelModel[] = $state([]);
  let loadNext: MessageChunk["loadNext"] = () => musicService.getMusicList(musicService.settings.playlist);
  let currentPlaylist: string | undefined = $state(musicService.settings.playlist);

  const playLabel = $derived(song ? `Currently playing: ${song.artist} - ${song.songName}` : 'No song playing');

  const finishLoading = () => isLoading = false;
  const toggleVisibility = () => isOpened = !isOpened;

  const applyList = (chunk: MessageChunk) => {
    list = [...list, ...chunk.list];
    loadNext = chunk.loadNext;
  }

  const setPlaylist = (channelId: string) => {
    musicService.settings.playlist = channelId;
  }

  const loadChannels = async () => {
    channelList = await channelService.getChannelList();
    recommendedChannels = await Promise.all(RECOMMENDED_CHANNELS.map(channelService.getChannel.bind(channelService)));
  }

  const onPlay = (newSong: MusicModel | null) => {
    isPlaying = true;
    song = newSong;
  }

  const onPause = (pausedSong: MusicModel | null) => {
    if (pausedSong !== song) return;
    isPlaying = false;
  }

  const onResize = () => {
    if (!miniPlayerEl || !playButtonEl) return;
    const bbox1 = playButtonEl.getBoundingClientRect();
    const bbox2 = miniPlayerEl.getBoundingClientRect();
    miniPlayerEl.style.setProperty('--arrow-position', `${bbox1?.left - bbox2?.left}px`);
  }

  const onPlaylistChanged = (channelId: string) => {
    list = [];
    isFinal = false;
    isLoading = true;
    musicService.getMusicList(channelId).then(applyList).finally(finishLoading);
    currentPlaylist = channelId;
  }

  const setNextSong = () => {
    const currentSong = musicService.settings.music;
    const currentIndex = list.findIndex((item) => item.music?.id === currentSong?.id);

    if (currentIndex === -1) return;

    musicService.settings.music = list[currentIndex + 1]?.music;
  }

  const setPreviousSong = () => {
    const currentSong = musicService.settings.music;
    const currentIndex = list.findIndex((item) => item.music?.id === currentSong?.id);
    if (currentIndex === -1) return;

    
    musicService.settings.music = list[currentIndex - 1]?.music;
  }

  const onWindowClick = (e: MouseEvent) => {
    if (!isOpened) return;
    const path = e.composedPath();
    const dontClose = path.find((el) => el === miniPlayerEl || el === playButtonEl);
    if (dontClose) return;

    isOpened = false;
  }

  const handlePlaylistScroll = (e: Event) => {
    if (isLoading || isFinal) return;
    const target = e.target as HTMLDivElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 100) {
      isLoading = true;
      loadNext().then(applyList).finally(finishLoading);
    }
  }

  onDestroy(musicService.on(MusicServiceEvents.PLAY_PAUSED, onPause));
  onDestroy(musicService.on(MusicServiceEvents.PLAY_STARTED, onPlay));
  onDestroy(musicService.on(MusicServiceEvents.PLAYLIST_CHANGED, onPlaylistChanged));

  onMount(() => {
    window.addEventListener('resize', onResize);
    window.addEventListener('click', onWindowClick);
    onResize();
    loadNext().then(applyList).finally(finishLoading);
    loadChannels();
  });

  onDestroy(window.removeEventListener.bind(window, 'resize', onResize));
  onDestroy(window.removeEventListener.bind(window, 'click', onWindowClick));

  $effect(() => {
    if (!isOpened) return;
    onResize();
  });
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
    --arrow-position: 32px;

    position: fixed;
    display: grid;
    top: var(--header-height);
    margin-top: var(--gap);
    left: 50%;
    margin-left: -215px;
    height: 480px;
    width: 630px;
    background-color: white;
    border-radius: var(--border-radius);
    color: var(--color-main);
    box-sizing: border-box;
    box-shadow: 0px 1px 6px rgba(0, 0, 0, .35);
    grid-template-columns: 1fr 200px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      'player player'
      'list channels'
      'footer footer';

    &::before {
      content: '';
      font-size: 0;
      border: 8px solid transparent;
      width: 0;
      border-top-width: 0;
      border-bottom-color: var(--color-main-light);
      position: absolute;
      bottom: 100%;
      left: calc(var(--arrow-position) + 11px);
      margin-left: -8px;
    }

    &__body {
      position: relative;
      background-color: white;
      flex: auto;
      grid-area: list;
    }

    &__channels {
      position: relative;
      grid-area: channels;
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      border-left: 1px solid var(--color-border);

      :global .title-bar {
        position: sticky;
        top: 0;
      }
    }

    &__scroll-wrapper {
      position: absolute;
      inset: 0;
      overflow-y: auto;
    }

    &__footer {
      padding: var(--gap);
      display: flex;
      justify-content: flex-end;
      grid-area: footer;
      background-color: var(--color-main-light);
    }

    &__list {
      padding: var(--gap-small);
    }

    :global &__player {
      background-color: var(--color-main-light);
      grid-area: player;
      border-bottom: 1px solid var(--color-border);
    }
  }
</style>
