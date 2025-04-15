<main class="messenger">
  <div class="messenger__title">
    <a href="/messages">Back</a>
    <h1 class="page-headline">{ user?.fullName }</h1>
  </div>
  <div class="messenger__messages">
    <div class="messenger__scroll-wrapper" bind:this={scrollWrapper}>
      {#each messages as post}
        {#key post.id}
          <Message { post } id={ post.fromId } />
        {/key}
      {/each}
    </div>
  </div>
  <div class="messenger__input-panel">
    <VkAvatar class="messenger__avatar" id="me" />

    <form
      class="messenger__input-wrapper"
      onsubmit={sendMessage}
      bind:this={form}
    >
      <textarea
        name="message"
        cols="30"
        rows="10"
        placeholder="Enter your message here..."
        onkeyup={handleEnter}
        onkeydown={preventNewLine}
      ></textarea>

      <div class="messenger__input-actions">
        <VkButton inline>
          Submit
        </VkButton>

        <VkButton flat inline>
          Attach
        </VkButton>
      </div>
    </form>

    <VkAvatar class="messenger__avatar" id={ params.id } />
  </div>
</main>

<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import type { MessageModel } from "$models/message.model";
  import { MessengerService, MessengerServiceEvents } from "$lib/messenger.service";

  import Message from "$components/Message.svelte";
  import VkAvatar from "$components/VkAvatar.svelte";
  import VkButton from "$components/VkButton.svelte";

  import { page } from "$app/state";
  import { UserService } from "@/lib/user.service";
  import type { UserModel } from "$models/user.model";

  const messengerService = new MessengerService;
  const userService = new UserService;

  const { params } = page;

  let form: HTMLFormElement;
  let scrollWrapper: HTMLDivElement;
  let messages: MessageModel[] = $state([]);
  let isLoading: boolean = $state(true);
  let user: UserModel | null = $state(null);

  const preventNewLine = (e: KeyboardEvent) => {
    if (e.key === "Enter") e.preventDefault();
  }

  const handleEnter = async (e: KeyboardEvent) => {
    e.preventDefault();
    if (e.key !== "Enter") return;

    form.dispatchEvent(new SubmitEvent("submit"));
  }

  const sendMessage = async (e: any) => {
    e.preventDefault();
    const mess = form.message.value.trim();
    if (mess === '') return;

    await messengerService.sendMessage(params.id!, mess);
    scrollWrapper.scrollTop = 0;
    form.message.value = '';
  }

  const loadMoreMessages = async () => {
    isLoading = true;
    const newMessages = await messengerService.getMessages(params.id!, messages[messages.length - 1].id);
    messages = [...messages, ...newMessages];
    isLoading = false;
  }

  const onScroll = (e: Event) => {
    const { target } = e as unknown as { target: HTMLDivElement };
    if (!target) return;

    const scrollHeight = Math.max(0, target.scrollHeight - target!.offsetHeight);
    if (isLoading) return;
    if (-target!.scrollTop < scrollHeight - 100) return;

    loadMoreMessages();
  }

  const addMessage = (message: MessageModel) => {
    messages = [message, ...messages];
  }

  onMount(async () => {
    messengerService.getMessages(params.id!)
      .then((newMessages: MessageModel[]) => messages = newMessages)
      .finally(() => isLoading = false);

    user = await userService.getUser(params.id!)

    scrollWrapper.addEventListener("scroll", onScroll);
  });

  onDestroy(() => {
    scrollWrapper.removeEventListener("scroll", onScroll);
  });

  onDestroy(messengerService.on(MessengerServiceEvents.MESSAGE_ADDED, addMessage));
</script>

<style lang="scss">
  .messenger {
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--color-light);
    height: 100%;
    padding-right: var(--gap);

    :global &__avatar {
      width: 50px;
    }

    &__title {
      background-color: #f2f2f2;
      height: 45px;
      border-bottom: 1px solid var(--color-light);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      padding: 0 var(--gap);

      display: grid;
      grid-template-columns: repeat(3, 1fr);

      h1 {
        text-align: center;
      }
    }

    &__messages {
      position: relative;
      flex: auto;
    }

    &__scroll-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;

      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      gap: var(--gap-large);
      padding: var(--gap) 0;
      padding-bottom: 35px;

      :global(.message) {
        max-width: 476px;
      }
    }

    &__input-panel {
      display: flex;
      align-items: flex-start;
      gap: var(--gap);
      justify-content: center;
      background-color: #f2f2f2;
      padding: var(--gap);
      border-top: 1px solid var(--color-light);
      padding-bottom: 70px;
    }

    &__input-wrapper {
      max-width: 358px;
      width: 358px;
      display: flex;
      flex-direction: column;
      gap: var(--gap);

      textarea {
        width: 100%;
        height: 50px;
        resize: none;
        font: inherit;
        border: 1px solid #C0CAD5;
        padding: var(--gap-small);
        box-sizing: border-box;
        border-radius: 3px;
        outline: none;
      }
    }
  }
</style>
