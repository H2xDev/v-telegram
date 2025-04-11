<div class="channel">
  <VkAvatar class="channel__avatar" id={channel.id} size={100}/>

  <div class="channel__title">
    <a href={'/channels/' + (channel.username || channel.id)}> {channel.title} </a>
    {#if channel.verified}
      <img class="channel__verified-icon" src="/icons/ic-verified.png" alt="Verified">
    {/if}
  </div>
  <p class="channel__meta-info">
    {channel.subscribersCount.toLocaleString('en-US')} subscribers

    {#if isInFeed || canAddToFeed}
      <VkButton flat inline onClick={toggleFeed}>
        {#if !isInFeed}
          Add to feed
        {:else}
          Remove from feed
        {/if}
      </VkButton>
    {/if}
  </p>
</div>

<script lang="ts">
  import type { ChannelModel } from "$models/channel.model";
  import { ChannelService, ChannelServiceEvents } from "@/lib/channel.service";
  import VkAvatar from "./VkAvatar.svelte";
  import VkButton from "./VkButton.svelte";
  import { onDestroy } from "svelte";

  const channelService = new ChannelService();

  interface Props {
    channel: ChannelModel;
  }

  let { channel }: Props = $props();
  let feedList = $state(channelService.feedChannels);

  const isInFeed = $derived(feedList.includes(channel.id));
  const canAddToFeed = $derived(feedList.length < 3);
  const updateFeedList = (newList: string[]) => feedList = newList;
  const toggleFeed = () => {
    if (isInFeed) {
      channelService.feedChannels = feedList.filter(id => id !== channel.id);
    } else {
      channelService.feedChannels = [...feedList, channel.id];
    }
  };


  onDestroy(channelService.on(ChannelServiceEvents.FEED_CHANNELS_UPDATED, updateFeedList));
</script>

<style lang="scss">
  .channel {
    display: grid;
    gap: var(--gap-small) var(--gap);
    border-bottom: 1px solid var(--color-border);
    padding: var(--gap);
    align-items: center;
    grid-template-columns: 50px 1fr;
    grid-template-areas: 
      "avatar title"
      "avatar meta-info";

    &__title {
      font-weight: bold;
      color: var(--color-main);
      grid-area: title;
    }

    &__verified-icon {
      filter: brightness(50%) sepia(100%) hue-rotate(-176deg);
      margin: -5px 0;
    }

    &__meta-info {
      grid-area: meta-info;
      color: var(--color-gray);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    :global &__avatar {
      width: 50px;
      height: 50px;
      grid-area: avatar;
    }
  }
</style>
