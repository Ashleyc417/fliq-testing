<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { session } from '$lib/stores/session';
	import { photobooth } from '$lib/stores/photobooth';
	import { generateRoomId, buildJoinUrl, createPeer, destroyPeer } from '$lib/peer';
	import { get } from 'svelte/store';
	import type { Peer, DataConnection, MediaConnection } from 'peerjs';

	let roomId = generateRoomId();
	let joinUrl = '';
	let copied = false;
	let qrDataUrl = '';
	let peerStatus: 'creating' | 'waiting' | 'connected' | 'error' = 'creating';

	const pbState = get(photobooth);

	// Track both connections independently — they arrive in any order
	let pendingDataConn: DataConnection | null = null;
	let navigated = false;

	onMount(async () => {
		joinUrl = buildJoinUrl(roomId);
		session.setRole('host');
		session.setRoomId(roomId);
		session.setStatus('creating');

		try {
			const QRCode = (await import('qrcode')).default;
			qrDataUrl = await QRCode.toDataURL(joinUrl, {
				width: 200,
				margin: 1,
				color: { dark: '#ffffff', light: '#0f0f20' }
			});
		} catch { /* QR optional */ }

		try {
			const peer: Peer = await createPeer(roomId);

			peer.on('open', () => {
				peerStatus = 'waiting';
				session.setStatus('waiting');
			});

			// ── Data channel (arrives first, carries settings) ──────────
			peer.on('connection', (dataConn: DataConnection) => {
				pendingDataConn = dataConn;
				dataConn.on('open', () => {
					dataConn.send({
						type: 'settings',
						payload: {
							layout: pbState.layout,
							stripColor: pbState.stripColor,
							userCount: pbState.userCount
						}
					});
				});
			});

			// ── Media call (registered at top level — NOT nested) ────────
			// Previously nested inside peer.on('connection', ...) which caused
			// a race condition where the call could arrive before the data connection.
			peer.on('call', (mediaConn: MediaConnection) => {
				navigator.mediaDevices
					.getUserMedia({ video: { facingMode: 'user' }, audio: false })
					.then((stream) => {
						session.setLocalStream(stream);
						mediaConn.answer(stream);

						mediaConn.on('stream', (remoteStream) => {
							if (navigated) return;
							navigated = true;

							session.setRemoteStream(remoteStream);
							session.setConnections(mediaConn, pendingDataConn);
							session.setStatus('connected');
							peerStatus = 'connected';

							setTimeout(() => goto('/capture/dual'), 600);
						});

						mediaConn.on('error', () => {
							peerStatus = 'error';
							session.setError('Media connection failed');
						});
					})
					.catch(() => {
						peerStatus = 'error';
						session.setError('Camera access denied');
					});
			});

			peer.on('error', (err) => {
				peerStatus = 'error';
				session.setError(err.message);
			});
		} catch {
			peerStatus = 'error';
			session.setError('Failed to initialize connection');
		}
	});

	onDestroy(() => {
		if (peerStatus !== 'connected') destroyPeer();
	});

	async function copyLink() {
		await navigator.clipboard.writeText(joinUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function goBack() {
		destroyPeer();
		session.reset();
		goto('/users');
	}
</script>

<main class="min-h-screen bg-[#080810] flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button on:click={goBack}
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

	<ProgressBar currentStep={1} />

	<div class="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-slide-up">
		<div class="w-full max-w-sm">
			<div class="text-center mb-8">
				<div class="w-14 h-14 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center mx-auto mb-4">
					<svg class="w-7 h-7 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
				</div>
				<h1 class="font-display font-bold text-3xl mb-2">Invite your friend</h1>
				<p class="text-white/40 text-sm font-body">Share this link — works from any device</p>
			</div>

			<!-- QR Code -->
			{#if qrDataUrl}
				<div class="flex justify-center mb-5">
					<div class="p-3 rounded-2xl bg-[#0f0f20] border border-white/8">
						<img src={qrDataUrl} alt="Join QR Code" class="w-40 h-40 rounded-lg" />
					</div>
				</div>
			{:else if peerStatus === 'creating'}
				<div class="flex justify-center mb-5">
					<div class="w-40 h-40 rounded-2xl bg-[#0f0f20] border border-white/8 flex items-center justify-center">
						<div class="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
					</div>
				</div>
			{/if}

			<!-- Room ID -->
			<div class="flex justify-center mb-3">
				<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f0f20] border border-white/8">
					<span class="text-white/30 text-xs font-display uppercase tracking-widest">Room</span>
					<span class="font-mono font-bold text-[#00e676] tracking-[0.2em] text-sm">{roomId.replace('fliq-', '').toUpperCase()}</span>
				</div>
			</div>

			<!-- Link row -->
			<div class="flex gap-2 mb-5">
				<div class="flex-1 px-3 py-3 rounded-xl bg-[#0f0f20] border border-white/8 text-xs font-mono text-white/40 truncate">
					{joinUrl}
				</div>
				<button on:click={copyLink}
					class="px-4 py-3 rounded-xl border transition-all duration-200 font-display text-sm font-semibold flex-shrink-0
                    {copied
						? 'bg-[#00e676] text-[#080810] border-[#00e676]'
						: 'border-white/10 text-white/60 hover:border-white/25 hover:text-white bg-[#0f0f20]'}">
					{copied ? '✓ Copied' : 'Copy'}
				</button>
			</div>

			<!-- Status -->
			<div class="p-4 rounded-2xl border text-center transition-all duration-300
                {peerStatus === 'connected' ? 'bg-[#00e676]/8 border-[#00e676]/30'
				: peerStatus === 'error'    ? 'bg-red-500/8 border-red-500/25'
				                           : 'bg-[#0f0f20] border-white/8'}">
				{#if peerStatus === 'creating'}
					<div class="flex items-center justify-center gap-2 text-white/30">
						<div class="w-3.5 h-3.5 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
						<span class="text-sm font-display">Setting up room...</span>
					</div>
				{:else if peerStatus === 'waiting'}
					<div class="flex items-center justify-center gap-2 text-white/50">
						<span class="relative flex w-2 h-2">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-60" />
							<span class="relative inline-flex rounded-full w-2 h-2 bg-[#00e676]" />
						</span>
						<span class="text-sm font-display">Waiting for friend to join...</span>
					</div>
				{:else if peerStatus === 'connected'}
					<div class="flex items-center justify-center gap-2 text-[#00e676]">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-sm font-display font-semibold">Friend joined! Starting...</span>
					</div>
				{:else}
					<div class="flex items-center justify-center gap-2 text-red-400">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-sm font-display">Connection error —
							<button on:click={() => window.location.reload()} class="underline">retry</button>
						</span>
					</div>
				{/if}
			</div>

			<div class="mt-5 text-center">
				<button on:click={() => goto('/layout')}
					class="text-sm text-white/25 hover:text-white/50 transition-colors font-display">
					Skip — shoot solo instead →
				</button>
			</div>
		</div>
	</div>
</main>
