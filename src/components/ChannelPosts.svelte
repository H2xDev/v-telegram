<section class="posts">
  <p class="title-bar">
    { title }
  </p>

  <div class="posts__list">
    {#each posts as post}
      <Post post={post} />
    {/each}

    {#if isLoading}
      <Spinner />
    {/if}
  </div>
</section>

<script lang="ts">
    import { ChannelService } from "$lib/channel.service";
    import { onDestroy, onMount } from "svelte";
    import type { MessageModel } from "../models/message.model";
    import type { UserModel } from "../models/user.model";
    import Post from "./Post.svelte";
    import Spinner from "./Spinner.svelte";
    
    
    interface Props {
      channel: string;
      title: string;
    }
    
    let { channel, title }: Props = $props();
    let posts: MessageModel[] = $state([]);
    let isLoading = $state(true);
    let isFinal = $state(false);

    const appendPosts = (newPosts: MessageModel[]) => {
        if (newPosts.length === 0) {
            isFinal = true;
            return;
        }

        posts = [...posts, ...newPosts];
    }
    
    const channelService = new ChannelService();
    channelService.getPosts(channel)
      .then(appendPosts)
      .finally(() => isLoading = false);

    const onScroll = () => {
        if (isLoading || isFinal) return;

        if (window.scrollY + window.innerHeight > document.body.offsetHeight - 100) {
            isLoading = true;
            channelService
                .getPosts('dvachannel', posts[posts.length - 1].id)
                .then(appendPosts)
                .finally(() => isLoading = false);
        }
    }

    onMount(() => {
      window.addEventListener('scroll', onScroll);
    })

    onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
    })
</script>

<style lang="scss">
  .posts {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }

  .posts__list {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
  }
</style>
