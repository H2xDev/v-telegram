<div class="main-layout">
	<Header />

	<div class="main-layout__cols">
		<aside class="main-layout__sidebar">
			<div class="main-layout__sticky-wrapper">
				{#if isLoggedIn}
					<Sidebar />
				{:else}
					<LoginForm />
				{/if}

        <VkDivider class="divider" />

				<div class="main-layout__sidebar-footer">
					<a href="https://github.com/h2xdev/v-telegram" target="_blank">
						Contribute
					</a>
          <p class="small-text-hint">
            Commit: { GIT_COMMIT_HASH?.substr(0, 8) }
          </p>
				</div>
			</div>
		</aside>

    {#key page.url}
      {@render children?.()}
    {/key}
	</div>

	<MediaViewer />
</div>

<script>
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { TelegramService, TelegramServiceEvents } from '$lib/telegram.service';
  
  import Header from '$components/Header.svelte';
  import Sidebar from '$components/Sidebar.svelte';
  import LoginForm from '$components/LoginForm.svelte';
  import MediaViewer from '$components/MediaViewer.svelte';
  import VkDivider from '$components/VkDivider.svelte';

  let { children } = $props();

  let isLoggedIn = $state(false);
  const GIT_COMMIT_HASH = import.meta.env.VITE_GIT_COMMIT_HASH || 'unknown';
  
  onMount(async () => {
  	const service = new TelegramService();
  	isLoggedIn = await service.isLoggedIn();
  
  	service.on(TelegramServiceEvents.AUTHORIZED, () => {
  		isLoggedIn = true;
  	});
  
  	service.on(TelegramServiceEvents.UNAUTHORIZED, () => {
  		isLoggedIn = false;
  	});
  })
</script>

<style lang="scss" global>
@use '../styles/variables.scss';
@use '../styles/layout.scss';
@use '../styles/ui.scss';
@use '../styles/typography.scss';
@use '../styles/mono_iconset.scss';

.main-layout {
	width: var(--container-width);
	margin: 0 auto;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

	&__cols {
		display: grid;
		grid-template-columns: 140px 1fr;
		flex: 1;
	}

	&__sidebar {
		padding: var(--gap);
		border-right: 1px solid var(--color-border);
		font-size: 12px;
	}

  &__sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: var(--gap-small);
  }

	&__sticky-wrapper {
		position: sticky;
		top: calc(var(--gap) + 43px);
		display: flex;
		flex-direction: column;
		gap: var(--gap);
	}
}
</style>
