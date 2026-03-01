<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import { photobooth } from '$lib/stores/photobooth';
	import type { UserCount } from '$lib/stores/photobooth';

	let selected: UserCount = 1;

	function next() {
		photobooth.setUserCount(selected);
		goto('/layout');
	}
</script>

<main class="min-h-screen bg-surface flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button
			on:click={() => goto('/')}
			class="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-display"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Back
		</button>
		<FliqLogo size="sm" />
	</div>

	<ProgressBar currentStep={1} />

	<div class="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-slide-up">
		<div class="w-full max-w-sm">
			<div class="text-center mb-10">
				<h1 class="font-display font-bold text-3xl mb-2">Who's shooting?</h1>
				<p class="text-white/40 text-sm font-body">Select the number of people in your session</p>
			</div>

			<div class="grid grid-cols-2 gap-4 mb-6">
				<!-- 1 Person -->
				<button
					on:click={() => (selected = 1)}
					class="group relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-200
                    {selected === 1
						? 'border-accent-green bg-accent-green/10 scale-105'
						: 'border-white/10 bg-surface-card hover:border-white/20'}"
				>
					{#if selected === 1}
						<div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
							<svg class="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{/if}
					<div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                        {selected === 1 ? 'bg-accent-green/20' : 'bg-surface-elevated'}">
						<svg class="w-10 h-10 transition-colors {selected === 1 ? 'text-accent-green' : 'text-white/30'}"
							fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
						</svg>
					</div>
					<div class="text-center">
						<p class="font-display font-bold text-lg {selected === 1 ? 'text-accent-green' : 'text-white'}">1 Person</p>
						<p class="text-xs text-white/30 font-body mt-0.5">Solo shoot</p>
					</div>
				</button>

				<!-- 2 People -->
				<button
					on:click={() => (selected = 2)}
					class="group relative flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-200
                    {selected === 2
						? 'border-accent-green bg-accent-green/10 scale-105'
						: 'border-white/10 bg-surface-card hover:border-white/20'}"
				>
					{#if selected === 2}
						<div class="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-green flex items-center justify-center">
							<svg class="w-3 h-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
					{/if}
					<div class="w-16 h-16 rounded-2xl flex items-center justify-center transition-colors
                        {selected === 2 ? 'bg-accent-green/20' : 'bg-surface-elevated'}">
						<svg class="w-10 h-10 transition-colors {selected === 2 ? 'text-accent-green' : 'text-white/30'}"
							fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
						</svg>
					</div>
					<div class="text-center">
						<p class="font-display font-bold text-lg {selected === 2 ? 'text-accent-green' : 'text-white'}">2 People</p>
						<p class="text-xs text-white/30 font-body mt-0.5">Duo session</p>
					</div>
				</button>
			</div>

			<!-- Duo hint -->
			{#if selected === 2}
				<div class="flex items-start gap-3 p-4 rounded-2xl bg-accent-green/5 border border-accent-green/20 mb-6 animate-fade-in">
					<svg class="w-4 h-4 text-accent-green mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
					<p class="text-xs text-white/50 font-body leading-relaxed">
						You'll get a shareable link to send to your friend. Both cameras appear side by side in each photo.
					</p>
				</div>
			{:else}
				<div class="mb-6" />
			{/if}

			<button on:click={next} class="btn-primary w-full text-lg flex items-center justify-center gap-2">
				{selected === 2 ? 'Create Session Link' : 'Continue'}
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>
	</div>
</main>
