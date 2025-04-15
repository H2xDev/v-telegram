<svelte:head>
  <title>{ channel?.title || params.id } | Channel</title>
</svelte:head>

<div class="channel">
  <VkTitleBar>
    Channel&nbsp;<i class="fas fa-bullhorn"></i>
  </VkTitleBar>

  <div class="channel__layout">
    <div class="channel__content">
      <h1 class="page-headline">
        { channel?.title || params.id }
      </h1>

      <VkDivider tag="h2" class="divider">
        About
      </VkDivider>

      <p>
        {@html formatMarkdown(channel?.about) }
      </p>

      {#if channel?.pinnedMessage}
        <VkDivider tag="h2" class="divider">
          Pinned message
        </VkDivider>

        <Post post={channel.pinnedMessage} channel={channel} compact noTitle repost />
      {/if}

      <ChannelPosts channel={params.id} title="Posts" />
    </div>

    {#if channel}
      <div class="channel__aside">
        <VkAvatar id={ channel?.id } size={200} />

        <VkTitleBar secondary>
          <div class="channel__menu">
            <VkButton href="/channels/{params.id}/music">
              Channel's music
            </VkButton>

            {#if channel.isSubscribed}
              <VkButton
                flat
                onclickasync={ channelService.leaveChannel.bind(channelService, channel.id) }
              >
                Leave channel
              </VkButton>
            {:else}
              <VkButton
                onclickasync={ channelService.joinChannel.bind(channelService, channel.id) }
              >
                Join channel
              </VkButton>
            {/if}
          </div>
        </VkTitleBar>

        <div>
          <VkTitleBar tag="p">
            Followers
          </VkTitleBar> 
          <VkTitleBar secondary tiny>
            { channel?.subscribersCount } followers
          </VkTitleBar>
        </div>
      </div>
    {/if}
  </div>
</div>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { formatMarkdown } from "$lib/utils";
  import { ChannelService, ChannelServiceEvents } from "$lib/channel.service";
  import type { ChannelModel } from "$models/channel.model";
  import type { PageProps } from "./$types";

  import ChannelPosts from "$components/ChannelPosts.svelte";
  import Post from "$components/Post.svelte";
  import VkSpinner from "$components/VkSpinner.svelte";
  import VkAvatar from "$components/VkAvatar.svelte";
  import VkButton from "$components/VkButton.svelte";
  import VkTitleBar from "$components/VkTitleBar.svelte";
  import VkDivider from "$components/VkDivider.svelte";
  import { page } from "$app/state";

  const channelService = new ChannelService;
  const { params, data } = page;

  let channel: ChannelModel | null = $state(data.channel);

  const onChannelUpdated = (updatedChannel: ChannelModel) => {
    if (updatedChannel.id !== params.id) return;
    channel = updatedChannel;
  };

  onDestroy(channelService.on(ChannelServiceEvents.CHANNEL_UPDATED, onChannelUpdated));
</script>

<style lang="scss">
  .channel {
    padding-right: var(--gap);

    &__menu {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: var(--gap);
      width: 100%;
    }

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
