
<form class="login" on:submit|preventDefault={submit}>
	{#if isPhoneRequire}
		<p>Enter phone number:</p>
		<VkInputField name="value" type="text" placeholder="Enter phone number" />
	{/if}

	{#if isCodeRequire}
		<p>Enter code:</p>
		<VkInputField name="value" type="text" placeholder="Enter code" />
	{/if}

	{#if isPassRequire}
		<p>Enter password:</p>
		<VkInputField name="value" type="password" placeholder="Enter password" />
	{/if}

	<VkButton>
		{#if isPending}
			<VkSpinner />
		{:else}
			Send
		{/if}
	</VkButton>
</form>

<script lang="ts">
  import { onMount } from 'svelte';
  import { TelegramService, TelegramServiceEvents } from '$lib/telegram.service';
  import { goto } from '$app/navigation';

  import VkSpinner from '../components/VkSpinner.svelte';
  import VkInputField from './VkInputField.svelte';
  import VkButton from './VkButton.svelte';

  let isPending = $state(true);
  let isPhoneRequire = $state(false);
  let isCodeRequire = $state(false);
  let isPassRequire = $state(false);
  
  let promiseResolver: (value: string) => void;
  
  const submit = (e: SubmitEvent) => {
    const { target } = e as unknown as { target: HTMLFormElement };
  
    if (promiseResolver) {
      promiseResolver(target.value.value);
    }
  }
  
  const createResolver = () => {
    return new Promise<string>((resolve) => {
      promiseResolver = resolve;
    })
  }
  
  const onPhoneRequired = () => {
    isPhoneRequire = true;
    isCodeRequire = false;
    isPassRequire = false;
  
    return createResolver();
  }
  
  const onCodeRequired = () => {
    isPhoneRequire = false;
    isCodeRequire = true;
    isPassRequire = false;
  
    return createResolver();
  }
  
  const onPassRequired = () => {
    isPhoneRequire = false;
    isCodeRequire = false;
    isPassRequire = true;
  
    return createResolver();
  }
  
  const onError = (error: any) => {
    console.error(error);
  }
  
  onMount(async () => {
  	const service = new TelegramService();
  	await service.forEvent(TelegramServiceEvents.CONNECTED);
  
  	const isLoggedIn = await service.isLoggedIn();
  
  	if (isLoggedIn) {
      isPending = false;
  		return;
  	}
  
  	isPending = false;
  
  	service
  	.login(
  		onPhoneRequired,
  		onCodeRequired,
  		onPassRequired,
  		onError,
  	)
  	.then(() => goto('/me'))
  	.catch((error) => console.error(error));
  })
</script>

<style lang="scss">
	.login {
		display: flex;
		flex-direction: column;
		gap: var(--gap-small);
		height: 100%;
	}
</style>
