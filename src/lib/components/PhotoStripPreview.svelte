<script lang="ts">
	import type { Layout, StripColor } from '$lib/stores/photobooth';
	import { STRIP_COLORS } from '$lib/stores/photobooth';

	export let layout: Layout;
	export let stripColor: StripColor = 'white';
	export let photos: string[] = [];
	export let size: 'sm' | 'md' | 'lg' = 'md';

	$: colorEntry = STRIP_COLORS.find((c) => c.id === stripColor) ?? STRIP_COLORS[0];
	$: isLight = ['white', 'yellow', 'nude', 'lavender'].includes(stripColor);

	const sizeMap = {
		sm: { pad: 'p-1.5', gap: 'gap-1', border: 'rounded-xl' },
		md: { pad: 'p-2', gap: 'gap-1.5', border: 'rounded-2xl' },
		lg: { pad: 'p-3', gap: 'gap-2', border: 'rounded-3xl' }
	};

	$: sz = sizeMap[size];

	function getCellStyle(index: number): string {
		return `grid-column: span 1; grid-row: span 1;`;
	}
</script>

<div
	class="photo-strip {sz.border} {sz.pad} shadow-2xl transition-all duration-300"
	style="background-color: {colorEntry.hex};"
>
	<div
		class="grid {sz.gap}"
		style="grid-template-columns: repeat({layout.grid.cols}, 1fr); grid-template-rows: repeat({layout.grid.rows}, 1fr);"
	>
		{#each Array(layout.photoCount) as _, i}
			<div class="aspect-[3/2] rounded-lg overflow-hidden bg-black/20">
				{#if photos[i]}
					<img src={photos[i]} alt="Photo {i + 1}" class="w-full h-full object-cover" />
				{:else}
					<div
						class="w-full h-full flex items-center justify-center"
						style="background-color: {isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'};"
					>
						<svg
							class="w-4 h-4 opacity-30"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							style="color: {isLight ? '#000' : '#fff'};"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- FLIQ branding on strip -->
	<div class="mt-1.5 text-center">
		<span
			class="text-[8px] font-mono font-bold tracking-[0.2em] uppercase opacity-40"
			style="color: {isLight ? '#000' : '#fff'};"
		>
			FLIQ
		</span>
	</div>
</div>
