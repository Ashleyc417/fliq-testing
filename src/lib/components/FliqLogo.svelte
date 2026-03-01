<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let animated = false;

	const sizes = {
		sm: 'text-xl',
		md: 'text-3xl',
		lg: 'text-5xl',
		xl: 'text-7xl'
	};
</script>

<div class="flex items-center gap-2 {animated ? 'animate-fade-in' : ''}">
	<!-- Camera icon -->
	<div
		class="relative flex items-center justify-center {size === 'xl'
			? 'w-14 h-14'
			: size === 'lg'
				? 'w-10 h-10'
				: size === 'md'
					? 'w-8 h-8'
					: 'w-6 h-6'} bg-accent-green rounded-xl"
	>
		<svg
			class="{size === 'xl'
				? 'w-7 h-7'
				: size === 'lg'
					? 'w-5 h-5'
					: size === 'md'
						? 'w-4 h-4'
						: 'w-3 h-3'} text-surface"
			fill="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"
			/>
			<path
				fill-rule="evenodd"
				d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>

	<span class="font-display font-bold {sizes[size]} tracking-tight text-white">
		FLIQ
	</span>
</div>
