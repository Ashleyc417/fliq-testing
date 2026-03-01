<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import { photobooth } from '$lib/stores/photobooth';
	import { session } from '$lib/stores/session';
	import { destroyPeer } from '$lib/peer';
	import { get } from 'svelte/store';
	import type { SessionMessage } from '$lib/peer';

	const pbState = get(photobooth);
	const totalPhotos = pbState.layout?.photoCount ?? 4;
	const isHost = get(session).role === 'host';

	let localVideoEl: HTMLVideoElement;
	let remoteVideoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;

	let photos: string[] = [];
	let currentPhoto = 0;
	let countdown = 0;
	let isFlashing = false;
	let isShooting = false;
	let isComplete = false;
	let remoteReady = false;

	// Peer connection refs from session store
	let sessionState = get(session);
	const dataConn = sessionState.dataConn;
	const localStream = sessionState.localStream;
	const remoteStream = sessionState.remoteStream;

	onMount(() => {
		if (!localStream || !remoteStream) {
			goto(isHost ? '/session' : '/');
			return;
		}

		if (localVideoEl) localVideoEl.srcObject = localStream;
		if (remoteVideoEl) remoteVideoEl.srcObject = remoteStream;

		// Listen for data messages (countdown sync, capture trigger)
		dataConn?.on('data', (msg: unknown) => {
			const data = msg as SessionMessage;
			if (data.type === 'countdown') {
				countdown = data.payload as number;
			} else if (data.type === 'capture') {
				captureFrame();
			} else if (data.type === 'ready') {
				remoteReady = true;
			}
		});

		// Notify host that guest is ready
		if (!isHost) {
			dataConn?.send({ type: 'ready' });
		}
	});

	onDestroy(() => {
		localStream?.getTracks().forEach((t) => t.stop());
	});

	function startCountdown() {
		if (isShooting || isComplete) return;
		isShooting = true;
		countdown = 3;

		// Broadcast countdown to guest
		const tick = () => {
			dataConn?.send({ type: 'countdown', payload: countdown });
			if (countdown > 0) {
				setTimeout(() => {
					countdown--;
					tick();
				}, 1000);
			} else {
				// Trigger capture on both ends
				dataConn?.send({ type: 'capture' });
				captureFrame();
			}
		};
		tick();
	}

	function captureFrame() {
		if (!canvasEl) return;

		const lv = localVideoEl;
		const rv = remoteVideoEl;
		const ctx = canvasEl.getContext('2d')!;

		const vw = lv.videoWidth || 640;
		const vh = lv.videoHeight || 480;

		// Side-by-side: [local | remote]
		canvasEl.width = vw * 2;
		canvasEl.height = vh;

		// Draw local (mirrored)
		ctx.save();
		ctx.translate(vw, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(lv, 0, 0, vw, vh);
		ctx.restore();

		// Draw remote
		ctx.save();
		ctx.translate(vw, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(rv, -vw, 0, vw, vh);
		ctx.restore();

		const dataUrl = canvasEl.toDataURL('image/jpeg', 0.92);
		photos = [...photos, dataUrl];
		currentPhoto++;

		isFlashing = true;
		setTimeout(() => {
			isFlashing = false;
			isShooting = false;

			if (currentPhoto >= totalPhotos) {
				isComplete = true;
				photobooth.setPhotos(photos);
				setTimeout(() => {
					destroyPeer();
					goto('/result');
				}, 800);
			}
		}, 300);
	}

	$: progressPct = (currentPhoto / totalPhotos) * 100;
</script>

<main class="min-h-screen bg-surface flex flex-col overflow-hidden">
	<!-- Header -->
	<div class="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
		<button
			on:click={() => {
				destroyPeer();
				session.reset();
				goto('/');
			}}
			class="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-display"
		>
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Exit
		</button>
		<FliqLogo size="sm" />
		<div class="font-mono text-sm text-white/40">
			<span class="text-white font-bold">{currentPhoto}</span>/{totalPhotos}
		</div>
	</div>

	<!-- Progress -->
	<div class="px-6 mb-3 flex-shrink-0">
		<div class="h-1 bg-white/10 rounded-full overflow-hidden">
			<div class="h-full bg-accent-green rounded-full transition-all duration-500" style="width:{progressPct}%" />
		</div>
		<div class="flex gap-1.5 mt-2">
			{#each Array(totalPhotos) as _, i}
				<div class="flex-1 h-1.5 rounded-full transition-all duration-300
                    {i < currentPhoto ? 'bg-accent-green' : 'bg-white/10'}" />
			{/each}
		</div>
	</div>

	<!-- Dual camera view -->
	<div class="relative flex-1 mx-4 mb-4 min-h-0 flex gap-2">
		<!-- Local feed -->
		<div class="relative flex-1 rounded-2xl overflow-hidden bg-black">
			<video
				bind:this={localVideoEl}
				autoplay
				playsinline
				muted
				class="w-full h-full object-cover"
				style="transform: scaleX(-1);"
			/>
			<!-- Label -->
			<div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
				<span class="text-xs font-display font-semibold text-white">
					{isHost ? 'You (Host)' : 'You'}
				</span>
			</div>
			<!-- Corner guides -->
			<div class="absolute inset-3 pointer-events-none">
				<div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
				<div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
				<div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
				<div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
			</div>
		</div>

		<!-- Remote feed -->
		<div class="relative flex-1 rounded-2xl overflow-hidden bg-black">
			<video
				bind:this={remoteVideoEl}
				autoplay
				playsinline
				muted
				class="w-full h-full object-cover"
				style="transform: scaleX(-1);"
			/>
			<!-- Label -->
			<div class="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
				<span class="text-xs font-display font-semibold text-white">
					{isHost ? 'Friend' : 'Host'}
				</span>
			</div>
			<!-- Corner guides -->
			<div class="absolute inset-3 pointer-events-none">
				<div class="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
				<div class="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
				<div class="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
				<div class="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
			</div>
		</div>

		<!-- Countdown overlay (full width) -->
		{#if countdown > 0}
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div class="relative">
					<div class="absolute inset-0 rounded-full animate-ping" style="background:rgba(0,230,118,0.2);transform:scale(1.5);" />
					<div class="w-28 h-28 rounded-full flex items-center justify-center border-4 border-accent-green"
						style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);">
						<span class="font-display font-black text-6xl text-accent-green animate-countdown">{countdown}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Flash -->
		{#if isFlashing}
			<div class="absolute inset-0 bg-white animate-flash pointer-events-none rounded-2xl" />
		{/if}

		<!-- Complete overlay -->
		{#if isComplete}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl"
				style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);">
				<div class="w-14 h-14 rounded-full bg-accent-green flex items-center justify-center">
					<svg class="w-7 h-7 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<p class="font-display font-bold text-white text-lg">All done!</p>
				<p class="text-white/50 text-sm">Creating your strip...</p>
			</div>
		{/if}

		<!-- Captured thumbnails -->
		{#if photos.length > 0}
			<div class="absolute bottom-3 right-3 flex gap-1.5">
				{#each photos as photo, i}
					<div class="w-14 h-10 rounded-lg overflow-hidden border-2 border-accent-green shadow-lg animate-slide-up"
						style="animation-delay:{i*50}ms">
						<img src={photo} alt="Shot {i+1}" class="w-full h-full object-cover" />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Hidden canvas -->
	<canvas bind:this={canvasEl} class="hidden" />

	<!-- Controls -->
	<div class="flex-shrink-0 flex items-center justify-center pb-8 gap-8">
		<!-- Retake last -->
		{#if photos.length > 0 && !isComplete && isHost}
			<button
				on:click={() => { photos = photos.slice(0, -1); currentPhoto = Math.max(0, currentPhoto - 1); }}
				class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40 hover:text-white hover:border-white/40 transition-all"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
				</svg>
			</button>
		{:else}
			<div class="w-12 h-12" />
		{/if}

		<!-- Shutter — only host triggers -->
		{#if isHost}
			<button
				on:click={startCountdown}
				disabled={isShooting || isComplete}
				class="relative w-20 h-20 rounded-full transition-all duration-200
                    {isShooting || isComplete ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}"
			>
				<div class="absolute inset-0 rounded-full border-4 border-white/80" />
				<div class="absolute inset-2 rounded-full transition-colors duration-200 {isShooting ? 'bg-accent-green' : 'bg-white'}" />
				{#if isShooting}
					<div class="absolute inset-2 rounded-full border-4 border-transparent border-t-surface animate-spin" />
				{/if}
			</button>
		{:else}
			<!-- Guest sees a "waiting for host" state -->
			<div class="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
				<div class="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
			</div>
		{/if}

		<div class="w-12 h-12 flex items-center justify-center">
			{#if isHost}
				<p class="text-white/30 text-xs font-mono text-center leading-tight">TAP<br>TO<br>SHOOT</p>
			{:else}
				<p class="text-white/30 text-xs font-mono text-center leading-tight">HOST<br>SHOOTS</p>
			{/if}
		</div>
	</div>
</main>
