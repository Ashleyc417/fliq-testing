<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { photobooth } from '$lib/stores/photobooth';
	import { get } from 'svelte/store';

	const state = get(photobooth);
	const totalPhotos = state.layout?.photoCount ?? 4;

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let stream: MediaStream | null = null;

	let photos: string[] = [];
	let currentPhoto = 0;
	let countdown = 0;
	let isFlashing = false;
	let isShooting = false;
	let isComplete = false;
	let cameraError = '';
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	onMount(startCamera);
	onDestroy(stopCamera);

	async function startCamera() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
				audio: false
			});
			if (videoEl) videoEl.srcObject = stream;
		} catch {
			cameraError = 'Camera access denied. Allow camera permissions and refresh.';
		}
	}

	function stopCamera() {
		stream?.getTracks().forEach((t) => t.stop());
		if (countdownInterval) clearInterval(countdownInterval);
	}

	function startCountdown() {
		if (isShooting || isComplete) return;
		isShooting = true;
		countdown = 3;
		countdownInterval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(countdownInterval!);
				countdown = 0;
				capturePhoto();
			}
		}, 1000);
	}

	function capturePhoto() {
		if (!videoEl || !canvasEl) return;
		const ctx = canvasEl.getContext('2d')!;
		canvasEl.width = videoEl.videoWidth;
		canvasEl.height = videoEl.videoHeight;
		// Mirror the capture to match preview
		ctx.translate(canvasEl.width, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(videoEl, 0, 0);
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
				setTimeout(() => { stopCamera(); goto('/result'); }, 700);
			}
		}, 280);
	}

	$: progressPct = (currentPhoto / totalPhotos) * 100;
</script>

<main class="min-h-screen bg-[#080810] flex flex-col overflow-hidden">
	<!-- Header -->
	<div class="flex items-center justify-between px-5 pt-5 pb-2 flex-shrink-0">
		<button on:click={() => { stopCamera(); goto('/instructions'); }}
			class="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm font-display">
			<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Exit
		</button>

		<!-- Shot counter -->
		<div class="px-3 py-1.5 rounded-xl bg-[#0f0f20] border border-white/8">
			<span class="font-mono font-bold text-white text-sm">{currentPhoto}</span>
			<span class="font-mono text-white/30 text-sm">/{totalPhotos}</span>
		</div>
	</div>

	<!-- Progress -->
	<div class="px-5 mb-3 flex-shrink-0">
		<div class="h-0.5 bg-white/8 rounded-full overflow-hidden">
			<div class="h-full bg-[#00e676] rounded-full transition-all duration-500" style="width:{progressPct}%" />
		</div>
		<div class="flex gap-1.5 mt-1.5">
			{#each Array(totalPhotos) as _, i}
				<div class="flex-1 h-1 rounded-full transition-all duration-300
                    {i < currentPhoto ? 'bg-[#00e676]' : 'bg-white/8'}" />
			{/each}
		</div>
	</div>

	<!-- Viewfinder -->
	<div class="relative flex-1 mx-4 mb-4 rounded-3xl overflow-hidden bg-black min-h-0">
		{#if cameraError}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
				<div class="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
					<svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
					</svg>
				</div>
				<p class="text-white/50 text-sm font-body">{cameraError}</p>
				<button on:click={startCamera} class="btn-primary text-sm px-6 py-3">Try Again</button>
			</div>
		{/if}

		<video bind:this={videoEl} autoplay playsinline muted
			class="w-full h-full object-cover" style="transform:scaleX(-1);" />

		<!-- Corner guides -->
		<div class="absolute inset-5 pointer-events-none">
			<div class="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-white/50 rounded-tl-xl" />
			<div class="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-white/50 rounded-tr-xl" />
			<div class="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-white/50 rounded-bl-xl" />
			<div class="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-white/50 rounded-br-xl" />
		</div>

		<!-- Countdown -->
		{#if countdown > 0}
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div class="relative">
					<div class="absolute inset-0 rounded-full animate-ping opacity-30" style="background:#00e676;transform:scale(2);" />
					<div class="w-28 h-28 rounded-full flex items-center justify-center border-4 border-[#00e676]"
						style="background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);">
						<span class="font-display font-black text-6xl text-[#00e676] animate-countdown">{countdown}</span>
					</div>
				</div>
			</div>
		{/if}

		<!-- Flash -->
		{#if isFlashing}
			<div class="absolute inset-0 bg-white pointer-events-none animate-flash" />
		{/if}

		<!-- Complete overlay -->
		{#if isComplete}
			<div class="absolute inset-0 flex flex-col items-center justify-center gap-3"
				style="background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);">
				<div class="w-14 h-14 rounded-full bg-[#00e676] flex items-center justify-center">
					<svg class="w-7 h-7 text-[#080810]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<p class="font-display font-bold text-lg text-white">All done!</p>
				<p class="text-white/40 text-sm">Creating your strip...</p>
			</div>
		{/if}

		<!-- Thumbnails -->
		{#if photos.length > 0}
			<div class="absolute bottom-4 left-4 flex gap-2">
				{#each photos as photo, i}
					<div class="w-12 h-9 rounded-lg overflow-hidden border-2 border-[#00e676]/70 shadow-lg animate-slide-up"
						style="animation-delay:{i*50}ms">
						<img src={photo} alt="Shot {i+1}" class="w-full h-full object-cover" />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<canvas bind:this={canvasEl} class="hidden" />

	<!-- Shutter controls -->
	<div class="flex-shrink-0 flex items-center justify-center pb-8 gap-8">
		<!-- Retake -->
		{#if photos.length > 0 && !isComplete}
			<button
				on:click={() => { photos = photos.slice(0, -1); currentPhoto = Math.max(0, currentPhoto - 1); }}
				class="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all bg-[#0f0f20]"
			>
				<svg class="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
				</svg>
			</button>
		{:else}
			<div class="w-11 h-11" />
		{/if}

		<!-- Shutter -->
		<button
			on:click={startCountdown}
			disabled={isShooting || isComplete || !!cameraError}
			class="relative w-[76px] h-[76px] rounded-full transition-all duration-200
                {isShooting || isComplete || cameraError ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}"
		>
			<div class="absolute inset-0 rounded-full border-[3px] border-white/70" />
			<div class="absolute inset-[5px] rounded-full transition-colors duration-200
                {isShooting ? 'bg-[#00e676]' : 'bg-white'}" />
			{#if isShooting}
				<div class="absolute inset-[5px] rounded-full border-[3px] border-transparent border-t-[#080810] animate-spin" />
			{/if}
		</button>

		<div class="w-11 h-11 flex items-center justify-center">
			<p class="text-white/20 text-[10px] font-mono text-center leading-tight tracking-wider">TAP<br>TO<br>SHOOT</p>
		</div>
	</div>
</main>
