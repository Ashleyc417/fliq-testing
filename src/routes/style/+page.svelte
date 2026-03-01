<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import PhotoStripPreview from '$lib/components/PhotoStripPreview.svelte';
	import { photobooth, STRIP_COLORS } from '$lib/stores/photobooth';
	import type { StripColor } from '$lib/stores/photobooth';
	import { get } from 'svelte/store';

	const state = get(photobooth);
	let selectedColor: StripColor = state.stripColor;
	const layout = state.layout!;

	$: colorEntry = STRIP_COLORS.find((c) => c.id === selectedColor)!;

	function next() {
		photobooth.setStripColor(selectedColor);
		goto(state.userCount === 2 ? '/session' : '/instructions');
	}
</script>

<main class="min-h-screen bg-[#080810] flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button on:click={() => goto('/layout')}
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

	<ProgressBar currentStep={3} />

	<div class="flex-1 flex flex-col items-center px-6 pb-6 overflow-y-auto animate-slide-up">
		<div class="text-center mb-6">
			<h1 class="font-display font-bold text-3xl mb-1.5">Pick Strip Style</h1>
			<p class="text-white/35 text-sm font-body">Choose a color for your photo strip frame</p>
		</div>

		<!-- Live preview -->
		<div class="mb-7 relative">
			<div class="absolute inset-0 blur-3xl opacity-15 rounded-full pointer-events-none transition-all duration-500"
				style="background: {colorEntry.hex};" />
			<div class="relative">
				<PhotoStripPreview {layout} stripColor={selectedColor} size="md" />
			</div>
			<p class="text-center mt-3 font-display font-semibold text-sm text-white">{colorEntry.label}</p>
		</div>

		<!-- Color grid: 6 cols × 2 rows -->
		<div class="w-full max-w-sm mb-7">
			<div class="grid grid-cols-6 gap-3">
				{#each STRIP_COLORS as color}
					<button
						on:click={() => (selectedColor = color.id)}
						class="flex flex-col items-center gap-1.5 group"
					>
						<div class="relative w-full aspect-square rounded-xl transition-all duration-200 shadow-md
                            {selectedColor === color.id
								? 'scale-[1.15] ring-2 ring-white shadow-lg'
								: 'hover:scale-[1.08]'}"
							style="background-color: {color.hex};">
							{#if selectedColor === color.id}
								<div class="absolute inset-0 flex items-center justify-center rounded-xl">
									<svg class="w-4 h-4 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"
										style="color:{['white','yellow','nude','lavender'].includes(color.id) ? '#000' : '#fff'}">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								</div>
							{/if}
						</div>
						<span class="text-[9px] font-display font-medium
                            {selectedColor === color.id ? 'text-white' : 'text-white/30'}">
							{color.label}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<div class="w-full max-w-sm">
			<button on:click={next} class="btn-primary w-full text-base py-4 flex items-center justify-center gap-2">
				Continue
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</button>
		</div>
	</div>
</main>
