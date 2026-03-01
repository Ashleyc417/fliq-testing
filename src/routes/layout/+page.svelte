<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import { photobooth, LAYOUTS } from '$lib/stores/photobooth';
	import type { Layout } from '$lib/stores/photobooth';
	import { get } from 'svelte/store';

	let selected: Layout = get(photobooth).layout ?? LAYOUTS[0];

	function next() {
		photobooth.setLayout(selected);
		goto('/style');
	}
</script>

<main class="min-h-screen bg-[#080810] flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button on:click={() => goto('/users')}
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

	<ProgressBar currentStep={2} />

	<div class="flex-1 flex flex-col px-6 pb-6 overflow-y-auto animate-slide-up">
		<div class="text-center mb-6">
			<h1 class="font-display font-bold text-3xl mb-1.5">Choose Layout</h1>
			<p class="text-white/35 text-sm font-body">Pick how photos are arranged on your strip</p>
		</div>

		<!-- Layout grid — 4 cols, numbered like Figma patterns 1–8 -->
		<div class="grid grid-cols-4 gap-3 max-w-sm mx-auto w-full mb-6">
			{#each LAYOUTS as layout, i}
				<button
					on:click={() => (selected = layout)}
					class="group relative flex flex-col items-center gap-2"
				>
					<!-- Number badge -->
					<div class="absolute -top-1.5 -right-1.5 z-10 w-4.5 h-4.5 w-[18px] h-[18px] rounded-full
                        text-[9px] font-mono font-bold flex items-center justify-center transition-all
                        {selected.id === layout.id ? 'bg-[#00e676] text-[#080810]' : 'bg-[#161628] text-white/30'}">
						{i + 1}
					</div>

					<!-- Thumbnail -->
					<div class="w-full aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-200 p-1.5
                        {selected.id === layout.id
							? 'border-[#00e676] bg-[#00e676]/8 shadow-[0_0_12px_rgba(0,230,118,0.25)]'
							: 'border-white/8 bg-[#0f0f20] hover:border-white/20'}">
						<div class="w-full h-full grid gap-0.5"
							style="grid-template-columns:repeat({layout.grid.cols},1fr); grid-template-rows:repeat({layout.grid.rows},1fr);">
							{#each Array(layout.photoCount) as _}
								<div class="rounded-[2px] transition-colors
                                    {selected.id === layout.id ? 'bg-[#00e676]/50' : 'bg-white/12'}" />
							{/each}
						</div>
					</div>

					<!-- Label -->
					<span class="text-[9px] font-display font-semibold leading-tight text-center truncate w-full
                        {selected.id === layout.id ? 'text-[#00e676]' : 'text-white/30'}">
						{layout.label}
					</span>
				</button>
			{/each}
		</div>

		<!-- Selected preview card -->
		<div class="max-w-sm mx-auto w-full mb-6 px-4 py-3 rounded-2xl bg-[#0f0f20] border border-white/6 flex items-center justify-between gap-4">
			<div>
				<p class="font-display font-semibold text-white text-sm">{selected.label}</p>
				<p class="text-white/35 text-xs mt-0.5">{selected.photoCount} photos per strip</p>
			</div>
			<div class="w-10 h-14 rounded-lg p-1 flex-shrink-0" style="background: rgba(0,230,118,0.08); border: 1px solid rgba(0,230,118,0.2);">
				<div class="w-full h-full grid gap-0.5"
					style="grid-template-columns:repeat({selected.grid.cols},1fr); grid-template-rows:repeat({selected.grid.rows},1fr);">
					{#each Array(selected.photoCount) as _}
						<div class="rounded-[2px] bg-[#00e676]/50" />
					{/each}
				</div>
			</div>
		</div>

		<div class="max-w-sm mx-auto w-full">
			<button on:click={next} class="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
				Continue
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>
	</div>
</main>
