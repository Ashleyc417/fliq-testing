import type { Peer, DataConnection, MediaConnection } from 'peerjs';

export interface SessionMessage {
	type: 'settings' | 'countdown' | 'capture' | 'ready' | 'retake';
	payload?: unknown;
}

// STUN + TURN servers required for NAT traversal on real internet connections.
// STUN alone fails through symmetric NATs (most mobile carriers, corporate networks).
// Using Open Relay's free public TURN servers.
const ICE_SERVERS = [
	{ urls: 'stun:stun.l.google.com:19302' },
	{ urls: 'stun:stun1.l.google.com:19302' },
	{
		urls: 'turn:openrelay.metered.ca:80',
		username: 'openrelayproject',
		credential: 'openrelayproject'
	},
	{
		urls: 'turn:openrelay.metered.ca:443',
		username: 'openrelayproject',
		credential: 'openrelayproject'
	},
	{
		urls: 'turn:openrelay.metered.ca:443?transport=tcp',
		username: 'openrelayproject',
		credential: 'openrelayproject'
	}
];

let peerInstance: Peer | null = null;

export async function createPeer(id?: string): Promise<Peer> {
	const { default: PeerJS } = await import('peerjs');
	const opts = { config: { iceServers: ICE_SERVERS } };
	peerInstance = id ? new PeerJS(id, opts) : new PeerJS(opts);
	return peerInstance;
}

export function getPeer(): Peer | null {
	return peerInstance;
}

export function destroyPeer() {
	peerInstance?.destroy();
	peerInstance = null;
}

export function generateRoomId(): string {
	return `fliq-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildJoinUrl(roomId: string): string {
	if (typeof window === 'undefined') return '';
	return `${window.location.origin}/join/${roomId}`;
}
