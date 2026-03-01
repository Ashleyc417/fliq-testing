<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import FliqLogo from '$lib/components/FliqLogo.svelte';
	import { session } from '$lib/stores/session';
	import { photobooth } from '$lib/stores/photobooth';
	import { createPeer, destroyPeer } from '$lib/peer';
	import type { DataConnection, MediaConnection } from 'peerjs';

	const roomId = $page.params.roomId;
	let peerStatus: 'connecting' | 'connected' | 'error' = 'connecting';
	let statusMsg = 'Connecting to session...';

	// Both settings and remote stream must arrive before navigating
	let gotSettings = false;
	let gotRemoteStream = false;
	let pendingMediaConn: MediaConnection | null = null;
	let pendingDataConn: DataConnection | null = null;
	let navigated = false;

	function tryNavigate() {
		if (navigated || !gotSettings || !gotRemoteStream) return;
		navigated = true;
		peerStatus = 'connected';
		statusMsg = 'Connected! Starting session...';
		setTimeout(() => goto('/capture/dual'), 600);
	}

	onMount(async () => {
		session.setRole('guest');
		session.setRoomId(roomId);
		session.setStatus('connecting');

		try {
			const peer = await createPeer();

			peer.on('open', async () => {
				statusMsg = 'Getting your camera ready...';

				let localStream: MediaStream;
				try {
					localStream = await navigator.mediaDevices.getUserMedia({
						video: { facingMode: 'user' },
						audio: false
					});
				} catch {
					peerStatus = 'error';
					statusMsg = 'Camera access denied — allow camera and try again';
					session.setError('Camera denied');
					return;
				}

				session.setLocalStream(localStream);
				statusMsg = 'Joining session...';

				// ── Data channel — carries settings from host ─────────────
				const dataConn: DataConnection = peer.connect(roomId, { reliable: true });
				pendingDataConn = dataConn;

				dataConn.on('data', (msg: unknown) => {
					const data = msg as { type: string; payload: unknown };
					if (data.type === 'settings') {
						const p = data.payload as { layout: unknown; stripColor: unknown; userCount: unknown };
						if (p.layout) photobooth.setLayout(p.layout as Parameters<typeof photobooth.setLayout>[0]);
						if (p.stripColor) photobooth.setStripColor(p.stripColor as Parameters<typeof photobooth.setStripColor>[0]);
						gotSettings = true;
						tryNavigate();
					}
				});

				// Fallback: if host never sends settings (e.g. already past that step), unblock after 2s
				const settingsFallback = setTimeout(() => {
					if (!gotSettings) { gotSettings = true; tryNavigate(); }
				}, 2000);

				dataConn.on('close', () => clearTimeout(settingsFallback));

				// ── Media call — carries the video stream ─────────────────
				const mediaConn: MediaConnection = peer.call(roomId, localStream);
				pendingMediaConn = mediaConn;

				mediaConn.on('stream', (remoteStream) => {
					session.setRemoteStream(remoteStream);
					session.setConnections(mediaConn, dataConn);
					session.setStatus('connected');
					gotRemoteStream = true;
					tryNavigate();
				});

				mediaConn.on('error', () => {
					peerStatus = 'error';
					statusMsg = 'Failed to connect video — host may have left';
				});

				// Timeout if we never get a stream (host offline / wrong room ID)
				setTimeout(() => {
					if (!gotRemoteStream) {
						peerStatus = 'error';
						statusMsg = 'No response from host — check the link and try again';
					}
				}, 15000);
			});

			peer.on('error', (err) => {
				peerStatus = 'error';
				statusMsg = err.type === 'peer-unavailable'
					? 'Room not found — check the link and try again'
					: `Connection failed: ${err.message}`;
				session.setError(err.message);
			});
		} catch {
			peerStatus = 'error';
			statusMsg = 'Failed to initialize — please refresh';
			session.setError('Init failed');
		}
	});

	onDestroy(() => {
		if (peerStatus !== 'connected') destroyPeer();
	});
</script>

<main class="min-h-screen bg-[#080810] flex flex-col items-center justify-center px-6 relative overflow-hidden">
	<!-- Glow -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
		style="background: radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 70%);" />

	<div class="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
		<!-- Logo -->
		<div class="flex items-center gap-2 mb-12">
			<div class="w-9 h-9 rounded-xl bg-[#00e676] flex items-center justify-center">
				<svg class="w-5 h-5 text-[#080810]" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/>
					<path fill-rule="evenodd" d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z" clip-rule="evenodd"/>
				</svg>
			</div>
			<span class="font-display font-bold text-2xl tracking-tight">FLIQ</span>
		</div>

		<!-- Status icon -->
		<div class="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transition-all duration-300
            {peerStatus === 'connected' ? 'bg-[#00e676]/15 border border-[#00e676]/30'
            : peerStatus === 'error'    ? 'bg-red-500/10 border border-red-500/20'
            :                            'bg-[#0f0f20] border border-white/8'}">
			{#if peerStatus === 'connecting'}
				<div class="w-8 h-8 rounded-full border-[3px] border-white/15 border-t-[#00e676] animate-spin" />
			{:else if peerStatus === 'connected'}
				<svg class="w-9 h-9 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			{:else}
				<svg class="w-9 h-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>

		<h1 class="font-display font-bold text-2xl mb-2">
			{peerStatus === 'connected' ? "You're in!" : peerStatus === 'error' ? 'Connection failed' : 'Joining session'}
		</h1>
		<p class="text-white/40 text-sm font-body mb-8 leading-relaxed max-w-[260px]">{statusMsg}</p>

		<!-- Room badge -->
		<div class="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0f0f20] border border-white/8 mb-8">
			<span class="text-white/30 text-xs font-display uppercase tracking-widest">Room</span>
			<span class="font-mono font-bold text-[#00e676] tracking-[0.2em]">{roomId.replace('fliq-', '').toUpperCase()}</span>
		</div>

		{#if peerStatus === 'error'}
			<button on:click={() => window.location.reload()} class="btn-primary w-full">
				Try Again
			</button>
		{/if}
	</div>
</main>
