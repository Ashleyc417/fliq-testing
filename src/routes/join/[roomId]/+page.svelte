<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import { session } from '$lib/stores/session';
	import { photobooth } from '$lib/stores/photobooth';
	import { createPeer, destroyPeer } from '$lib/peer';
	import type { Peer, DataConnection, MediaConnection } from 'peerjs';

	const roomId = $page.params.roomId;
	let peerStatus: 'connecting' | 'connected' | 'error' = 'connecting';
	let statusMsg = 'Connecting to session...';
	let peer: Peer | null = null;

	onMount(async () => {
		session.setRole('guest');
		session.setRoomId(roomId);
		session.setStatus('connecting');

		try {
			// Guest gets a unique random peer ID
			peer = await createPeer();

			peer.on('open', async () => {
				statusMsg = 'Getting your camera ready...';

				const localStream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: 'user' },
					audio: false
				});
				session.setLocalStream(localStream);

				statusMsg = 'Joining session...';

				// Connect data channel
				const dataConn: DataConnection = peer!.connect(roomId);
				dataConn.on('data', (msg: unknown) => {
					const data = msg as { type: string; payload: unknown };
					if (data.type === 'settings') {
						const p = data.payload as {
							layout: unknown;
							stripColor: unknown;
							userCount: unknown;
						};
						// Sync settings from host
						if (p.layout) photobooth.setLayout(p.layout as Parameters<typeof photobooth.setLayout>[0]);
						if (p.stripColor) photobooth.setStripColor(p.stripColor as Parameters<typeof photobooth.setStripColor>[0]);
					}
				});

				// Call host with our local stream
				const mediaConn: MediaConnection = peer!.call(roomId, localStream);
				mediaConn.on('stream', (remoteStream) => {
					session.setRemoteStream(remoteStream);
					session.setConnections(mediaConn, dataConn);
					session.setStatus('connected');
					peerStatus = 'connected';
					statusMsg = 'Connected! Starting session...';

					setTimeout(() => goto('/capture/dual'), 800);
				});

				mediaConn.on('error', (err) => {
					peerStatus = 'error';
					statusMsg = 'Failed to connect to host';
				});
			});

			peer.on('error', (err) => {
				peerStatus = 'error';
				statusMsg = `Connection failed: ${err.message}`;
				session.setError(err.message);
			});
		} catch (err) {
			peerStatus = 'error';
			statusMsg = 'Could not access your camera';
			session.setError('Camera error');
		}
	});

	onDestroy(() => {
		if (peerStatus !== 'connected') destroyPeer();
	});
</script>

<main class="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
	<!-- Background glow -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10"
			style="background: radial-gradient(circle, #00E676 0%, transparent 70%);"
		/>
	</div>

	<div class="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
		<FliqLogo size="lg" animated />

		<div class="mt-10 mb-8">
			<!-- Animated status icon -->
			<div class="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center
                {peerStatus === 'connected' ? 'bg-accent-green/20' : peerStatus === 'error' ? 'bg-red-500/10' : 'bg-surface-card border border-white/10'}">
				{#if peerStatus === 'connecting'}
					<div class="w-8 h-8 border-3 border-white/20 border-t-accent-green rounded-full animate-spin" style="border-width: 3px;" />
				{:else if peerStatus === 'connected'}
					<svg class="w-10 h-10 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				{:else}
					<svg class="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				{/if}
			</div>

			<h1 class="font-display font-bold text-2xl mb-2">
				{peerStatus === 'connected' ? "You're in!" : peerStatus === 'error' ? 'Connection failed' : 'Joining session'}
			</h1>
			<p class="text-white/40 text-sm font-body">{statusMsg}</p>
		</div>

		<!-- Room badge -->
		<div class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface-card border border-white/10 mb-8">
			<span class="text-white/30 text-xs font-display uppercase tracking-widest">Room</span>
			<span class="font-mono font-bold text-accent-green tracking-widest">{roomId.replace('fliq-', '')}</span>
		</div>

		{#if peerStatus === 'error'}
			<button on:click={() => window.location.reload()} class="btn-primary w-full">
				Try Again
			</button>
		{/if}
	</div>
</main>
