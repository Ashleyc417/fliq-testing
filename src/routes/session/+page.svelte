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
	let peer: Peer | null = null;
	let copied = false;
	let qrDataUrl = '';
	let peerStatus: 'creating' | 'waiting' | 'connected' | 'error' = 'creating';

	const state = get(photobooth);

	onMount(async () => {
		joinUrl = buildJoinUrl(roomId);
		session.setRole('host');
		session.setRoomId(roomId);
		session.setStatus('creating');

		// Generate QR code
		try {
			const QRCode = (await import('qrcode')).default;
			qrDataUrl = await QRCode.toDataURL(joinUrl, {
				width: 200,
				margin: 1,
				color: { dark: '#ffffff', light: '#13132A' }
			});
		} catch {
			// QR optional
		}

		// Start PeerJS as host
		try {
			peer = await createPeer(roomId);

			peer.on('open', () => {
				peerStatus = 'waiting';
				session.setStatus('waiting');
			});

			peer.on('connection', (dataConn: DataConnection) => {
				dataConn.on('open', () => {
					// Send current session settings to guest
					dataConn.send({
						type: 'settings',
						payload: {
							layout: state.layout,
							stripColor: state.stripColor,
							userCount: state.userCount
						}
					});
				});

				peer?.on('call', (mediaConn: MediaConnection) => {
					navigator.mediaDevices
						.getUserMedia({ video: { facingMode: 'user' }, audio: false })
						.then((stream) => {
							session.setLocalStream(stream);
							mediaConn.answer(stream);
							mediaConn.on('stream', (remoteStream) => {
								session.setRemoteStream(remoteStream);
								session.setConnections(mediaConn, dataConn);
								session.setStatus('connected');
								peerStatus = 'connected';

								// Navigate to dual capture after short delay
								setTimeout(() => goto('/capture/dual'), 800);
							});
						});
				});
			});

			peer.on('error', (err) => {
				peerStatus = 'error';
				session.setError(err.message);
			});
		} catch (err) {
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

<main class="min-h-screen bg-surface flex flex-col">
	<div class="flex items-center justify-between px-6 pt-6">
		<button
			on:click={goBack}
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
			<!-- Title -->
			<div class="text-center mb-8">
				<div class="w-14 h-14 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center mx-auto mb-4">
					<svg class="w-7 h-7 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
					</svg>
				</div>
				<h1 class="font-display font-bold text-3xl mb-2">Invite your friend</h1>
				<p class="text-white/40 text-sm font-body">Share this link so they can join your session</p>
			</div>

			<!-- QR Code -->
			{#if qrDataUrl}
				<div class="flex justify-center mb-6">
					<div class="p-3 rounded-2xl bg-surface-card border border-white/10">
						<img src={qrDataUrl} alt="Join QR Code" class="w-40 h-40 rounded-lg" />
					</div>
				</div>
			{/if}

			<!-- Room ID badge -->
			<div class="flex items-center justify-center gap-3 mb-4">
				<div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10">
					<span class="text-white/40 text-xs font-display uppercase tracking-widest">Room</span>
					<span class="font-mono font-bold text-accent-green tracking-widest text-sm">{roomId.replace('fliq-', '')}</span>
				</div>
			</div>

			<!-- Link copy box -->
			<div class="flex gap-2 mb-6">
				<div class="flex-1 px-4 py-3 rounded-xl bg-surface-card border border-white/10 text-sm font-mono text-white/50 truncate">
					{joinUrl}
				</div>
				<button
					on:click={copyLink}
					class="px-4 py-3 rounded-xl border transition-all duration-200 font-display text-sm font-medium flex-shrink-0
                    {copied
						? 'bg-accent-green text-surface border-accent-green'
						: 'border-white/10 text-white/60 hover:border-white/30 hover:text-white bg-surface-card'}"
				>
					{copied ? '✓ Copied' : 'Copy'}
				</button>
			</div>

			<!-- Status indicator -->
			<div class="p-4 rounded-2xl border text-center transition-all duration-500
                {peerStatus === 'connected'
					? 'bg-accent-green/10 border-accent-green/30'
					: peerStatus === 'error'
						? 'bg-red-500/10 border-red-500/30'
						: 'bg-surface-card border-white/10'}">
				{#if peerStatus === 'creating'}
					<div class="flex items-center justify-center gap-2 text-white/40">
						<div class="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
						<span class="text-sm font-display">Setting up room...</span>
					</div>
				{:else if peerStatus === 'waiting'}
					<div class="flex items-center justify-center gap-2 text-white/60">
						<div class="relative w-2 h-2">
							<div class="absolute inset-0 rounded-full bg-accent-green animate-ping" />
							<div class="w-2 h-2 rounded-full bg-accent-green" />
						</div>
						<span class="text-sm font-display">Waiting for friend to join...</span>
					</div>
				{:else if peerStatus === 'connected'}
					<div class="flex items-center justify-center gap-2 text-accent-green">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
						<span class="text-sm font-display font-semibold">Friend joined! Starting session...</span>
					</div>
				{:else}
					<div class="flex items-center justify-center gap-2 text-red-400">
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-sm font-display">Connection error — try again</span>
					</div>
				{/if}
			</div>

			<!-- Skip to solo -->
			<div class="mt-6 text-center">
				<button
					on:click={() => goto('/layout')}
					class="text-sm text-white/30 hover:text-white/60 transition-colors font-display"
				>
					Skip and shoot solo instead →
				</button>
			</div>
		</div>
	</div>
</main>
