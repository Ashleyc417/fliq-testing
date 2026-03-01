<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { photobooth, STRIP_COLORS } from '$lib/stores/photobooth';
	import { get } from 'svelte/store';

	const state = get(photobooth);
	const layout = state.layout!;
	const photos = state.photos;
	const colorEntry = STRIP_COLORS.find((c) => c.id === state.stripColor) ?? STRIP_COLORS[0];
	const isLight = ['white', 'yellow', 'nude', 'lavender'].includes(state.stripColor);

	let stripCanvas: HTMLCanvasElement;
	let stripDataUrl = '';
	let isRendering = true;

	onMount(() => {
		if (!photos.length) { goto('/'); return; }
		setTimeout(renderStrip, 120);
	});

	async function renderStrip() {
		if (!stripCanvas) return;
		const ctx = stripCanvas.getContext('2d')!;
		const cols = layout.grid.cols;
		const rows = layout.grid.rows;
		const count = layout.photoCount;

		const cw = 400, ch = Math.round(cw * 9 / 16);
		const pad = 20, gap = 8, footer = 36;
		const W = cols * cw + (cols - 1) * gap + pad * 2;
		const H = rows * ch + (rows - 1) * gap + pad * 2 + footer;

		stripCanvas.width = W;
		stripCanvas.height = H;

		// Strip background
		ctx.fillStyle = colorEntry.hex;
		rr(ctx, 0, 0, W, H, 20);
		ctx.fill();

		// Load images
		const imgs = await Promise.all(
			photos.slice(0, count).map(
				(src) => new Promise<HTMLImageElement>((res) => {
					const i = new Image(); i.onload = () => res(i); i.src = src;
				})
			)
		);

		imgs.forEach((img, i) => {
			const col = i % cols, row = Math.floor(i / cols);
			const x = pad + col * (cw + gap), y = pad + row * (ch + gap);

			ctx.fillStyle = 'rgba(0,0,0,0.12)';
			rr(ctx, x, y, cw, ch, 8); ctx.fill();

			const scale = Math.max(cw / img.width, ch / img.height);
			const sw = cw / scale, sh = ch / scale;
			const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;

			ctx.save();
			rr(ctx, x, y, cw, ch, 8); ctx.clip();
			ctx.drawImage(img, sx, sy, sw, sh, x, y, cw, ch);
			ctx.restore();
		});

		// Footer branding
		ctx.font = `bold 13px "JetBrains Mono", monospace`;
		ctx.fillStyle = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
		ctx.textAlign = 'center';
		ctx.fillText('F L I Q', W / 2, H - pad / 2 + 5);

		stripDataUrl = stripCanvas.toDataURL('image/png');
		isRendering = false;
	}

	function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.quadraticCurveTo(x + w, y, x + w, y + r);
		ctx.lineTo(x + w, y + h - r);
		ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
		ctx.lineTo(x + r, y + h);
		ctx.quadraticCurveTo(x, y + h, x, y + h - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}

	function download() {
		const a = document.createElement('a');
		a.href = stripDataUrl;
		a.download = `fliq-${Date.now()}.png`;
		a.click();
	}

	async function share() {
		if (!navigator.share) { download(); return; }
		const blob = await (await fetch(stripDataUrl)).blob();
		const file = new File([blob], 'fliq-strip.png', { type: 'image/png' });
		await navigator.share({ files: [file], title: 'My FLIQ Strip' }).catch(() => {});
	}
</script>

<main class="min-h-screen bg-[#080810] flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 pt-6 pb-2">
		<div class="flex items-center gap-2">
			<div class="w-6 h-6 rounded-lg bg-[#00e676] flex items-center justify-center">
				<svg class="w-3.5 h-3.5 text-[#080810]" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/>
					<path fill-rule="evenodd" d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z" clip-rule="evenodd"/>
				</svg>
			</div>
			<span class="font-display font-bold text-lg tracking-tight">FLIQ</span>
		</div>
		<button on:click={() => { photobooth.reset(); goto('/'); }}
			class="text-white/30 hover:text-white transition-colors text-sm font-display flex items-center gap-1.5">
			New session
			<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
			</svg>
		</button>
	</div>

	<div class="flex-1 flex flex-col items-center px-6 pb-8 overflow-y-auto animate-slide-up">
		<!-- Title -->
		<div class="text-center mb-6 mt-4">
			<h1 class="font-display font-bold text-3xl mb-1">Your Strip!</h1>
			<p class="text-white/35 text-sm">Looking good — download or share it</p>
		</div>

		<!-- Strip preview -->
		<div class="mb-7 relative flex justify-center">
			{#if isRendering}
				<div class="w-48 aspect-[3/4] rounded-2xl bg-[#0f0f20] border border-white/8 flex flex-col items-center justify-center gap-3">
					<div class="w-7 h-7 border-2 border-[#00e676] border-t-transparent rounded-full animate-spin" />
					<p class="text-white/30 text-xs font-display">Developing...</p>
				</div>
			{:else}
				<div class="shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden">
					<img src={stripDataUrl} alt="Your photo strip" class="max-w-[200px] block rounded-2xl" />
				</div>
			{/if}
		</div>

		<canvas bind:this={stripCanvas} class="hidden" />

		<!-- Actions -->
		<div class="w-full max-w-xs space-y-3">
			<button on:click={download} disabled={isRendering}
				class="btn-primary w-full py-4 flex items-center justify-center gap-2.5">
				<svg class="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				Download Strip
			</button>

			<button on:click={share} disabled={isRendering} class="btn-ghost w-full py-4 flex items-center justify-center gap-2.5">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
				</svg>
				Share
			</button>

			<div class="flex items-center gap-3 py-1">
				<div class="flex-1 h-px bg-white/8" />
				<span class="text-white/20 text-xs font-display">or</span>
				<div class="flex-1 h-px bg-white/8" />
			</div>

			<button on:click={() => { photobooth.setPhotos([]); goto('/capture'); }}
				class="w-full text-center text-sm text-white/30 hover:text-[#00e676] transition-colors font-display py-2 flex items-center justify-center gap-2">
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				Shoot again with same settings
			</button>
		</div>

		<!-- Meta info -->
		<div class="mt-6 grid grid-cols-3 gap-px bg-white/6 rounded-2xl overflow-hidden w-full max-w-xs">
			{#each [
				{ label: 'Photos', value: String(photos.length) },
				{ label: 'Layout', value: layout.label },
				{ label: 'Color', value: colorEntry.label }
			] as item}
				<div class="bg-[#0f0f20] px-3 py-3 text-center">
					<p class="font-display font-bold text-white text-sm">{item.value}</p>
					<p class="text-white/30 text-[10px] font-body mt-0.5">{item.label}</p>
				</div>
			{/each}
		</div>
	</div>
</main>
