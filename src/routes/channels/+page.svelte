<main class="channels">
  <div class="channels__state">
    You are subscribed to {channels.length} channels
  </div>
  <div class="f f--g-base f--a">
    <div class="channels__content f f--c f--g-base">
      {#each channels as channel}
        <div class="f f--g-base channel">
          <Avatar class="channel__avatar" id={channel.id} size={100}/>

          <div class="f f--c f--g-small">
            <div class="f f--g-small f--aic">
              <a class="channel__title" href={'/channels/' + (channel.username || channel.id)}> {channel.title} </a>
              {#if channel.verified}
                <img class="channel__verified-icon" src="/icons/ic-verified.png" alt="Verified">
              {/if}
            </div>
            <p>Channel</p>
            <p>{channel.subscribersCount.toLocaleString('en-US')} subscribers</p>
          </div>
        </div>
        <div class="divider"></div>
      {/each}

      {#if isLoading}
        <Spinner />
      {/if}
    </div>
  
    <div class="channels__aside">
  
    </div>
  </div>
</main>

<script lang="ts">
    import { ChannelService } from "$lib/channel.service";
  import Avatar from "../../components/Avatar.svelte";
  import Spinner from "../../components/Spinner.svelte";
  import type { ChannelModel } from "../../models/channel.model";

  const channelService = new ChannelService();
  let channels: ChannelModel[] = $state(channelService.channels);
  let isLoading = $state(true);

  channelService.getChannelList().then((newChannels: ChannelModel[]) => {
    channels = newChannels;
  }).finally(() => isLoading = false);
</script>

<style lang="scss">
  .channel {
    &__title {
      font-weight: bold;
      color: var(--color-main);
    }

    &__verified-icon {
      filter: brightness(50%) sepia(100%) hue-rotate(-176deg);
      margin: -5px 0;
    }

    :global &__avatar {
      width: 50px;
      height: 50px;
    }
  }

  .channels {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-right: var(--gap);

    :global(.spinner) {
      align-self: center;
    }

    &__content {
      flex: auto;
      padding-top: var(--gap);
      padding-left: var(--gap);
      width: 100%;
    }

    &__aside {
      width: 170px;
      flex-shrink: 0;
      border-left: 1px solid var(--color-border);
      background-color: #f7f7f7;
    }

    &__state {
      border-bottom: 1px solid var(--color-border);
      padding-bottom: var(--gap-small);
      padding-top: var(--gap);
      padding-left: var(--gap);
      font-weight: bold;
      color: var(--color-main);
    }
  }
</style>
