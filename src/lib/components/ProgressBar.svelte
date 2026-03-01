<script lang="ts">
	export let currentStep: number;
	export let totalSteps: number = 5;

	const steps = [
		{ label: 'Users', step: 1 },
		{ label: 'Layout', step: 2 },
		{ label: 'Style', step: 3 },
		{ label: 'Shoot', step: 4 },
		{ label: 'Result', step: 5 }
	];
</script>

<div class="w-full px-6 pt-4 pb-3">
	<div class="flex items-center max-w-sm mx-auto">
		{#each steps as { label, step }, i}
			<!-- Dot -->
			<div class="flex flex-col items-center gap-1.5 relative z-10">
				<div
					class="transition-all duration-300 flex items-center justify-center font-display font-bold text-[11px]
                    {step < currentStep
						? 'w-6 h-6 rounded-full bg-[#00e676] text-[#080810]'
						: step === currentStep
							? 'w-7 h-7 rounded-full bg-[#00e676] text-[#080810] ring-4 ring-[#00e676]/25 scale-110'
							: 'w-6 h-6 rounded-full bg-[#161628] text-white/25 border border-white/10'}"
				>
					{#if step < currentStep}
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					{:else}
						{step}
					{/if}
				</div>
				<span
					class="text-[9px] font-display font-semibold tracking-wide uppercase
                    {step === currentStep ? 'text-[#00e676]' : step < currentStep ? 'text-white/50' : 'text-white/20'}"
				>
					{label}
				</span>
			</div>

			<!-- Connector line (between dots) -->
			{#if i < steps.length - 1}
				<div class="flex-1 h-px mx-1.5 -mt-4 transition-all duration-500
                    {step < currentStep ? 'bg-[#00e676]' : 'bg-white/8'}" />
			{/if}
		{/each}
	</div>
</div>
