import { writable } from 'svelte/store';
import type { MediaConnection, DataConnection } from 'peerjs';

export type ConnectionStatus = 'idle' | 'creating' | 'waiting' | 'connecting' | 'connected' | 'error';

export interface SessionState {
	role: 'host' | 'guest' | null;
	roomId: string | null;
	status: ConnectionStatus;
	localStream: MediaStream | null;
	remoteStream: MediaStream | null;
	mediaConn: MediaConnection | null;
	dataConn: DataConnection | null;
	error: string | null;
}

const defaultState: SessionState = {
	role: null,
	roomId: null,
	status: 'idle',
	localStream: null,
	remoteStream: null,
	mediaConn: null,
	dataConn: null,
	error: null
};

function createSessionStore() {
	const { subscribe, set, update } = writable<SessionState>(defaultState);

	return {
		subscribe,
		setRole: (role: 'host' | 'guest') => update((s) => ({ ...s, role })),
		setRoomId: (roomId: string) => update((s) => ({ ...s, roomId })),
		setStatus: (status: ConnectionStatus) => update((s) => ({ ...s, status })),
		setLocalStream: (stream: MediaStream | null) => update((s) => ({ ...s, localStream: stream })),
		setRemoteStream: (stream: MediaStream | null) => update((s) => ({ ...s, remoteStream: stream })),
		setConnections: (mediaConn: MediaConnection | null, dataConn: DataConnection | null) =>
			update((s) => ({ ...s, mediaConn, dataConn })),
		setError: (error: string) => update((s) => ({ ...s, status: 'error', error })),
		reset: () => set(defaultState)
	};
}

export const session = createSessionStore();
