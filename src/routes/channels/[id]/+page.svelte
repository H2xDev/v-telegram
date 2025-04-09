<div class="channel">
  <div class="title-bar">
    Channel&nbsp;<i class="fas fa-bullhorn"></i>
  </div>
  <div class="channel__layout">
    <div class="channel__content">
      <h1 class="page-headline">
        { channel?.title || page.data.id }
      </h1>
      <div class="divider">
        About
      </div>
      {#if !isLoading}
      <p>
        {@html formatMarkdown(channel?.about) }
      </p>
      {:else}
        <Spinner />
      {/if}

      {#if channel?.pinnedMessage}
        <div class="divider">
          Pinned message
        </div>

        <Post post={channel.pinnedMessage} channel={channel} compact noTitle repost />
      {/if}

      <ChannelPosts channel={page.data.id} title="Posts" />
    </div>

    {#if channel}
      <div class="channel__aside">
          <Avatar id={ channel?.id } size={200} />

        <div class="title-bar title-bar--secondary">
          {#if channel.isSubscribed}
            <AsyncButton
              class="button"
              onclick={ channelService.leaveChannel.bind(channelService, channel.id) }
            >
              Leave channel
            </AsyncButton>
          {:else}
            <AsyncButton
              class="button"
              onclick={ channelService.joinChannel.bind(channelService, channel.id) }
            >
              Join channel
            </AsyncButton>
          {/if}
        </div>

        <div>
          <p class="title-bar">
            Followers
          </p>
          <p class="title-bar title-bar--secondary title-bar--tiny">
            { channel?.subscribersCount } followers
          </p>
        </div>
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import { page } from "$app/state";
  import { onDestroy } from "svelte";
  import { formatMarkdown } from "$lib/utils";
  import { ChannelService, ChannelServiceEvents } from "$lib/channel.service";
  import type { ChannelModel } from "$models/channel.model";

  import ChannelPosts from "$components/ChannelPosts.svelte";
  import Post from "$components/Post.svelte";
  import Avatar from "$components/Avatar.svelte";
  import Spinner from "$components/Spinner.svelte";
  import AsyncButton from "$components/AsyncButton.svelte";

  const channelService = new ChannelService;
  let channel: ChannelModel | null = $state(null);
  let isLoading = $state(true);

  channelService.getChannel(page.data.id)
    .then((newChannel: ChannelModel) => { channel = newChannel; })
    .finally(() => {
      isLoading = false;
    });

  const onChannelUpdated = (updatedChannel: ChannelModel) => {
    if (updatedChannel.id !== page.data.id) return;
    channel = updatedChannel;
  };

  onDestroy(channelService.on(ChannelServiceEvents.CHANNEL_UPDATED, onChannelUpdated));
</script>

<style lang="scss">
  .channel {
    padding-right: var(--gap);

    &__layout {
      display: flex;
      gap: var(--gap);
      padding-top: var(--gap);
    }

    &__content {
      width: 100%;
      padding-left: var(--gap);
      display: flex;
      flex-direction: column;
      gap: var(--gap);
    }

    &__aside {
      position: sticky;
      top: calc(var(--header-height) + var(--gap));
      width: 200px;
      height: max-content;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: var(--gap);

      :global(.content-section) {
        border-left: 1px solid var(--color-light);
      }
    }
  }
</style>
