import type { Peer, DataConnection, MediaConnection } from 'peerjs';

export type PeerRole = 'host' | 'guest';

export interface SessionMessage {
	type: 'settings' | 'countdown' | 'capture' | 'ready' | 'retake';
	payload?: unknown;
}

let peerInstance: Peer | null = null;

export async function createPeer(id?: string): Promise<Peer> {
	// Dynamically import PeerJS (browser-only)
	const { default: PeerJS } = await import('peerjs');
	peerInstance = id ? new PeerJS(id) : new PeerJS();
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
