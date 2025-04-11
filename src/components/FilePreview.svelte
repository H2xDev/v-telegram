<div class="file-preview">
  File: { post.file?.fileName } <br>
  <i>
    Downloading files temporarily is not supported.
  </i>
</div>

<script lang="ts">
  import type { MessageModel } from "$models/message.model";

  interface Props {
    post: MessageModel;
  }

  let { post }: Props = $props();
</script>

<style lang="scss">
  .file-preview {
    display: flex;
    width: 100%;
    padding: var(--gap);
    background-color: var(--color-main-light);
    border-radius: 5px;
    margin-top: 10px;
    color: var(--color-main);
    flex-direction: column;
    gap: var(--gap);

    &:hover {
      background-color: var(--color-bg);
      cursor: pointer;
    }
  }
</style>
