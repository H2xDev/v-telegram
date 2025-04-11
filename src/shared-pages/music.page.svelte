<main
  class="music-page"
  style:--sidebar-height={sidebarHeight}
>
  {#if params?.id}
    <VkTitleBar>
      <a href="/channels/{params.id}">
        &lt; To the channel
      </a>
    </VkTitleBar>
  {/if}

  {#if currentSong}
    {#key currentSong.id }
      <MusicPlayer
        class="music-page__player"
        post={{ music: currentSong }}
        big
        onNextSongRequest={playNext}
        onPrevSongRequest={playPrev}
      />
    {/key}
  {/if}

  <div class="music-page__layout">
    <div class="music-page__body">
      <form class="music-page__search">
        <VkInputField
          type="text"
          placeholder="Search"
          oninput={onQueryInput}
        />
      </form>
      {#if !isLoading}
        {#if musicList.length}
          {#each musicList as post}
            <SmallMusicPlayer class="music-page__song-item" { post } />
          {/each}
        {:else}
          <p align="center">
            No music found.
          </p>
        {/if}
      {:else}
        <VkSpinner />
      {/if}
    </div>

    <div class="music-page__aside" bind:this={sidebar}>
      <div class="music-page__list">
        <VkButton flat big align="flex-start" href="/music">
          My music
        </VkButton>
      </div>

      <VkTitleBar tag="h2" class="title-bar">
        Music from channels:
      </VkTitleBar>

      <div class="music-page__list">
        {#if !isChannelLoading}
          {#each channelList as channel}
            <VkButton
              class="music-page__channel-item"
              href={`/channels/${channel.id}/music`}
              flat={ params?.id !== channel.id }
              align="flex-start"
            >
              {channel.title}
            </VkButton>
          {/each}
        {:else}
          <VkSpinner dark />
        {/if}
      </div>
    </div>
  </div>
</main>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { MusicService, MusicServiceEvents } from "$lib/music.service";

  import type { MessageModel } from "$models/message.model";
  import type { MusicModel } from "$models/music.model";
  import type { ChannelModel } from "$models/channel.model";

  import { ChannelService } from "@/lib/channel.service";

  import SmallMusicPlayer from "$components/SmallMusicPlayer.svelte";
  import MusicPlayer from "$components/MusicPlayer.svelte";
  import VkInputField from "$components/VkInputField.svelte";
  import VkButton from "$components/VkButton.svelte";
  import VkTitleBar from "$components/VkTitleBar.svelte";
  import VkSpinner from "$components/VkSpinner.svelte";

  interface PageData {
    id?: string;
  }

  let { params }: { params: PageData } = $props();
  let timeout: NodeJS.Timeout | null = null;

  const musicService = new MusicService;
  const channelService = new ChannelService;

  let musicList: MessageModel[] = $state([]);
  let isFinal = $state(false);
  let isLoading = $state(true);
  let isChannelLoading = $state(true);
  let currentQuery: string = $state('');
  let currentSong: MusicModel | null = $state(musicService.settings.music);
  let channelList: ChannelModel[] = $state([]);
  let sidebar: HTMLDivElement | null = $state(null);
  let sidebarHeight = $state(0);

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
        .getMusicList(params?.id, musicList[musicList.length - 1].id, currentQuery)
        .then(appendMusic)
        .finally(() => isLoading = false);
    }
  }

  const loadMusicList = async () => {
    musicList = await musicService.getMusicList(params?.id, undefined, currentQuery).finally(() => isLoading = false);
    musicService.on(MusicServiceEvents.MUSIC_CHANGED, (music: MusicModel | null) => {
      currentSong = music;
    });

    if (currentSong) return;
    musicService.settings.music = musicService.settings.music || musicList[0]?.music;
  }

  const onQueryInput = (e: Event) => {
    const { target } = e as unknown as { target: HTMLInputElement };

    if (timeout) clearTimeout(timeout);

    currentQuery = target.value;

    setTimeout(() => {
      isLoading = true;
      loadMusicList();
    }, 500);
  }

  const loadChannels = async () => {
    channelList = await channelService.getChannelList().finally(() => isChannelLoading = false);
  }

  const playNext = () => {
    const currentIndex = musicList.findIndex((item) => item.music?.id === currentSong?.id);
    if (currentIndex === -1) return;

    currentSong = musicList[currentIndex + 1]?.music;
  }

  const playPrev = () => {
    const currentIndex = musicList.findIndex((item) => item.music?.id === currentSong?.id);
    if (currentIndex === -1) return;

    currentSong = musicList[currentIndex - 1]?.music;
  }

  onMount(async () => {
    window.addEventListener('scroll', onScroll);
    loadMusicList();
    loadChannels();
  });

  onDestroy(() => {
    window.removeEventListener('scroll', onScroll);
  });

  $effect(() => {
    sidebarHeight = sidebar?.offsetHeight || 0;
  });
</script>

<style lang="scss">
  .music-page {
    --sidebar-height: 0px;

    margin-right: var(--gap);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;

    &__body {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      padding-top: var(--gap);
    }

    &__search {
      padding: 0 var(--gap);
    }

    &__layout {
      display: grid;
      grid-template-columns: 1fr 200px;
    }

    &__aside {
      background-color: var(--color-main-light);
      border-left: 1px solid var(--color-border);
    }

    &__list {
      display: flex;
      flex-direction: column;
      padding: var(--gap);
    }

    :global &__player {
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-main-light);
      position: sticky !important;
      top: var(--header-height);
      z-index: 1;
    }

    :global &__song-item {
      padding: var(--gap) !important;
    }
  }
</style>
