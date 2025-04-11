<main class="feed-page">
  <ChannelPosts channel={channelService.feedChannels} title="Feed" limit={10} />
</main>

<script lang="ts">
  import ChannelPosts from "$components/ChannelPosts.svelte";
  import { ChannelService } from "@/lib/channel.service";
  const channelService = new ChannelService;
</script>

<style lang="scss">
  .feed-page {
    padding-right: var(--gap);

    :global(.posts__list) {
      padding: 0 var(--gap);
    }
  }
</style>
