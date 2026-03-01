import { writable, derived } from 'svelte/store';

export type UserCount = 1 | 2;

export type LayoutId =
	| 'strip-2x2'
	| 'strip-4x1'
	| 'strip-3x1'
	| 'wide-2x2'
	| 'grid-3x2'
	| 'grid-2x3'
	| 'panorama'
	| 'classic-4';

export interface Layout {
	id: LayoutId;
	label: string;
	photoCount: number;
	grid: { cols: number; rows: number; spans?: number[] };
}

export type StripColor =
	| 'white'
	| 'black'
	| 'pink'
	| 'blue'
	| 'green'
	| 'purple'
	| 'yellow'
	| 'red'
	| 'orange'
	| 'teal'
	| 'nude'
	| 'lavender';

export interface PhotoboothState {
	userCount: UserCount;
	layout: Layout | null;
	stripColor: StripColor;
	photos: string[]; // base64 data URLs
	currentPhotoIndex: number;
}

export const LAYOUTS: Layout[] = [
	{
		id: 'classic-4',
		label: 'Classic Strip',
		photoCount: 4,
		grid: { cols: 1, rows: 4 }
	},
	{
		id: 'strip-3x1',
		label: '3 in a Row',
		photoCount: 3,
		grid: { cols: 1, rows: 3 }
	},
	{
		id: 'strip-2x2',
		label: '2×2 Grid',
		photoCount: 4,
		grid: { cols: 2, rows: 2 }
	},
	{
		id: 'wide-2x2',
		label: 'Wide Duo',
		photoCount: 2,
		grid: { cols: 2, rows: 1 }
	},
	{
		id: 'grid-3x2',
		label: '6-Shot Grid',
		photoCount: 6,
		grid: { cols: 3, rows: 2 }
	},
	{
		id: 'grid-2x3',
		label: 'Portrait Grid',
		photoCount: 6,
		grid: { cols: 2, rows: 3 }
	},
	{
		id: 'panorama',
		label: 'Panorama',
		photoCount: 2,
		grid: { cols: 1, rows: 2 }
	},
	{
		id: 'strip-4x1',
		label: 'Wide Strip',
		photoCount: 4,
		grid: { cols: 4, rows: 1 }
	}
];

export const STRIP_COLORS: { id: StripColor; label: string; hex: string }[] = [
	{ id: 'white', label: 'White', hex: '#FFFFFF' },
	{ id: 'black', label: 'Midnight', hex: '#0D0D1A' },
	{ id: 'pink', label: 'Blush', hex: '#FF4D8D' },
	{ id: 'blue', label: 'Sky', hex: '#4DAAFF' },
	{ id: 'green', label: 'Lime', hex: '#00E676' },
	{ id: 'purple', label: 'Grape', hex: '#9B5DE5' },
	{ id: 'yellow', label: 'Butter', hex: '#FFD60A' },
	{ id: 'red', label: 'Cherry', hex: '#FF4444' },
	{ id: 'orange', label: 'Peach', hex: '#FF6B35' },
	{ id: 'teal', label: 'Teal', hex: '#00BFA5' },
	{ id: 'nude', label: 'Nude', hex: '#D4A89A' },
	{ id: 'lavender', label: 'Lavender', hex: '#C8B2F0' }
];

const defaultState: PhotoboothState = {
	userCount: 1,
	layout: LAYOUTS[0],
	stripColor: 'white',
	photos: [],
	currentPhotoIndex: 0
};

function createPhotoboothStore() {
	const { subscribe, set, update } = writable<PhotoboothState>(defaultState);

	return {
		subscribe,
		setUserCount: (count: UserCount) => update((s) => ({ ...s, userCount: count })),
		setLayout: (layout: Layout) => update((s) => ({ ...s, layout })),
		setStripColor: (color: StripColor) => update((s) => ({ ...s, stripColor: color })),
		addPhoto: (dataUrl: string) =>
			update((s) => ({
				...s,
				photos: [...s.photos, dataUrl],
				currentPhotoIndex: s.currentPhotoIndex + 1
			})),
		setPhotos: (photos: string[]) => update((s) => ({ ...s, photos })),
		reset: () => set(defaultState)
	};
}

export const photobooth = createPhotoboothStore();

export const isSetupComplete = derived(photobooth, ($s) => $s.layout !== null && $s.photos.length > 0);
