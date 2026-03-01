<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { photobooth } from '$lib/stores/photobooth';
	import { get } from 'svelte/store';

	const state = get(photobooth);
	const photoCount = state.layout?.photoCount ?? 4;

	const tips = [
		{ emoji: '💡', title: 'Find good lighting', desc: 'Bright, even light gives the clearest shots' },
		{ emoji: '🎯', title: 'Fill the frame', desc: 'Move closer so your face fills the view' },
		{ emoji: '⏱', title: 'Watch the countdown', desc: '3 seconds to get into your pose' },
		{ emoji: '🎭', title: 'Switch it up', desc: `${photoCount} shots — try a different look each time` }
	];
</script>

<main class="min-h-screen bg-[#080810] flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button on:click={() => goto('/style')}
			class="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm font-display">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Back
		</button>
		<div class="flex items-center gap-2">
			<div class="w-6 h-6 rounded-lg bg-[#00e676] flex items-center justify-center">
				<svg class="w-3.5 h-3.5 text-[#080810]" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/>
					<path fill-rule="evenodd" d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z" clip-rule="evenodd"/>
				</svg>
			</div>
			<span class="font-display font-bold text-lg tracking-tight">FLIQ</span>
		</div>
	</div>

	<ProgressBar currentStep={4} />

	<div class="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-slide-up">
		<div class="w-full max-w-sm">
			<!-- Title -->
			<div class="text-center mb-8">
				<div class="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center mx-auto mb-4">
					<svg class="w-7 h-7 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
							d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<h1 class="font-display font-bold text-3xl mb-1.5">Ready to shoot?</h1>
				<p class="text-white/35 text-sm font-body">
					You'll take <span class="text-[#00e676] font-semibold">{photoCount} photos</span> for your strip
				</p>
			</div>

			<!-- Tips -->
			<div class="space-y-2.5 mb-7">
				{#each tips as tip, i}
					<div class="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-[#0f0f20] border border-white/[0.05] animate-slide-up"
						style="animation-delay:{i * 60}ms">
						<span class="text-xl flex-shrink-0">{tip.emoji}</span>
						<div>
							<p class="font-display font-semibold text-sm text-white">{tip.title}</p>
							<p class="text-xs text-white/35 font-body mt-0.5">{tip.desc}</p>
						</div>
					</div>
				{/each}
			</div>

			<!-- Session summary chip -->
			<div class="flex items-center gap-2 px-4 py-3 rounded-xl mb-6"
				style="background: linear-gradient(135deg, rgba(0,230,118,0.07), rgba(77,170,255,0.07)); border: 1px solid rgba(0,230,118,0.15);">
				<div class="flex gap-1">
					{#each Array(Math.min(photoCount, 6)) as _}
						<div class="w-1.5 h-1.5 rounded-full bg-[#00e676]/60" />
					{/each}
				</div>
				<p class="text-xs font-display text-white/50 ml-1">
					{photoCount} shots · {state.userCount === 2 ? 'Duo' : 'Solo'} · {state.layout?.label}
				</p>
			</div>

			<button on:click={() => goto('/capture')}
				class="btn-primary w-full text-lg py-5 flex items-center justify-center gap-3">
				<div class="w-2 h-2 rounded-full bg-[#080810] animate-pulse" />
				Start Shooting
			</button>
		</div>
	</div>
</main>
