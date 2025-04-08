<div class="contact">
  <Avatar class="contact__avatar" id={dialog.id} />

  <div class="contact__info">
    <a class="page-headline" href="/{dialog.user.username || dialog.user.id}">{dialog.user.fullName}</a>

    <a class="button flat inline" href="/messages/{dialog.user.username || dialog.user.id}">
      Send message
    </a>
  </div>
</div>

<script lang="ts">
  import type { DialogModel } from "../models/dialog.model";
  import Avatar from "./Avatar.svelte";

  interface Props {
    dialog: DialogModel;
  }
  
  let { dialog }: Props = $props();
</script>

<style lang="scss">
  .contact {
    display: flex;
    align-items: stretch;
    gap: var(--gap);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 10px;

    :global &__avatar {
      width: 50px;
      height: 50px;
    }

    &__info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
  }
</style>
