<div 
    class="photo { clazz || '' }"
    style:aspect-ratio={post.photo?.aspectRatio}
    onclick={handleClick}
>
    <img src={src}>
</div>

<script lang="ts">
    import { onMount } from "svelte";
    import type { MessageModel } from "../models/message.model";
    import { MediaService } from "$lib/media.service";

    interface Props {
        post: MessageModel;
        openInViewer?: boolean;
        class?: string;
    }

    let { post, openInViewer, class: clazz }: Props = $props();
    let src = $state('');

    onMount(async () => {
        src = await post.photo?.getUrl() || await post.sticker?.getUrl() || '';
    });

    const handleClick = () => {
        if (!openInViewer) return;
        new MediaService().currentPost = post;
    };
</script>

<style lang="scss">
    .photo {
        img {
            width: 100%;
        }
    }
</style>
