<script lang="ts">
	import { goto } from '$app/navigation';
	import { photobooth } from '$lib/stores/photobooth';

	function start() {
		photobooth.reset();
		goto('/users');
	}
</script>

<main class="relative min-h-screen bg-[#080810] flex flex-col overflow-hidden select-none">

	<!-- ── Background layers ───────────────────────────── -->
	<!-- Deep radial glow -->
	<div class="absolute inset-0 pointer-events-none">
		<div class="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120vw] h-[70vh] rounded-full"
			style="background: radial-gradient(ellipse at center, rgba(0,230,118,0.07) 0%, transparent 65%);" />
	</div>

	<!-- Grid lines -->
	<div class="absolute inset-0 opacity-[0.025] pointer-events-none"
		style="background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
               background-size: 48px 48px;" />

	<!-- Floating accent dots -->
	<div class="absolute top-24 right-16 w-1.5 h-1.5 rounded-full bg-[#00e676] opacity-70" />
	<div class="absolute top-40 right-28 w-1 h-1 rounded-full bg-[#4daaff] opacity-50" />
	<div class="absolute top-32 left-20 w-1 h-1 rounded-full bg-[#9B5DE5] opacity-50" />
	<div class="absolute bottom-48 left-16 w-1.5 h-1.5 rounded-full bg-[#ff4d8d] opacity-60" />
	<div class="absolute bottom-28 right-24 w-1 h-1 rounded-full bg-[#00e676] opacity-40" />


	<!-- ── Header ──────────────────────────────────────── -->
	<header class="relative z-10 flex items-center justify-between px-6 pt-7">
		<!-- Logo -->
		<div class="flex items-center gap-2">
			<div class="w-8 h-8 rounded-xl bg-[#00e676] flex items-center justify-center">
				<svg class="w-4.5 h-4.5 text-[#080810]" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/>
					<path fill-rule="evenodd" d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9zm3 15a5 5 0 110-10 5 5 0 010 10z" clip-rule="evenodd"/>
				</svg>
			</div>
			<span class="font-display font-bold text-2xl tracking-tight text-white">FLIQ</span>
		</div>

		<!-- Live indicator -->
		<div class="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
			<div class="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
			<span class="text-[11px] font-mono text-white/40 uppercase tracking-widest">Ready</span>
		</div>
	</header>


	<!-- ── Hero ────────────────────────────────────────── -->
	<section class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-6">

		<!-- Central photobooth mockup -->
		<div class="relative mb-10">

			<!-- Main camera body -->
			<div class="relative w-44 h-44 mx-auto">

				<!-- Glow behind -->
				<div class="absolute inset-0 rounded-[2.5rem] blur-2xl opacity-20"
					style="background: #00e676;" />

				<!-- Body -->
				<div class="relative w-full h-full rounded-[2.5rem] flex items-center justify-center"
					style="background: linear-gradient(145deg, #161628 0%, #0f0f20 100%);
                           border: 1px solid rgba(255,255,255,0.08);">

					<!-- Camera lens rings -->
					<div class="relative w-20 h-20">
						<div class="absolute inset-0 rounded-full border-2 border-white/5" />
						<div class="absolute inset-2 rounded-full border-2 border-white/8" />
						<div class="absolute inset-4 rounded-full bg-[#00e676]/10 border border-[#00e676]/30
                                    flex items-center justify-center">
							<div class="w-8 h-8 rounded-full bg-[#00e676]/20 border border-[#00e676]/50
                                        flex items-center justify-center">
								<div class="w-4 h-4 rounded-full bg-[#00e676]" />
							</div>
						</div>
					</div>

					<!-- Flash dot -->
					<div class="absolute top-5 right-7 w-3 h-3 rounded-full bg-[#FFD60A] opacity-80" />

					<!-- Viewfinder notch -->
					<div class="absolute top-5 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-white/8" />
				</div>
			</div>

			<!-- Floating photo strips -->
			<div class="absolute -right-10 top-2 w-14 rotate-12 opacity-80 shadow-2xl animate-float-r">
				<div class="rounded-xl overflow-hidden p-1.5" style="background: #FF4D8D;">
					{#each Array(3) as _}
						<div class="w-full aspect-video bg-black/30 rounded-sm mb-1 last:mb-0" />
					{/each}
					<div class="text-center mt-1">
						<span class="text-[7px] font-mono font-bold text-white/50 tracking-widest">FLIQ</span>
					</div>
				</div>
			</div>

			<div class="absolute -left-10 bottom-2 w-14 -rotate-12 opacity-80 shadow-2xl animate-float-l">
				<div class="rounded-xl overflow-hidden p-1.5" style="background: #4DAAFF;">
					{#each Array(4) as _}
						<div class="w-full aspect-video bg-black/30 rounded-sm mb-1 last:mb-0" />
					{/each}
					<div class="text-center mt-1">
						<span class="text-[7px] font-mono font-bold text-white/50 tracking-widest">FLIQ</span>
					</div>
				</div>
			</div>
		</div>


		<!-- Headline -->
		<h1 class="font-display font-extrabold text-[2.6rem] leading-[1.1] tracking-tight mb-3">
			Strike a<br />
			<span class="text-gradient">perfect pose.</span>
		</h1>

		<p class="text-white/40 text-base font-body max-w-[280px] mx-auto mb-10 leading-relaxed">
			Real-time photo strips with friends — from anywhere.
		</p>

		<!-- CTA -->
		<div class="relative w-full max-w-[280px]">
			<div class="absolute inset-0 rounded-2xl blur-xl opacity-25" style="background: #00e676;" />
			<button
				on:click={start}
				class="relative w-full btn-primary text-xl py-5 flex items-center justify-center gap-3"
			>
				<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
				Start Session
			</button>
		</div>

		<!-- Feature pills -->
		<div class="flex flex-wrap justify-center gap-2 mt-8">
			{#each ['Up to 2 users', '8 layouts', '12 strip colors', 'Live link sharing'] as f}
				<span class="text-[11px] font-display font-medium text-white/30 px-3 py-1 rounded-full
                             border border-white/8 bg-white/[0.02]">{f}</span>
			{/each}
		</div>
	</section>


	<!-- ── Film strip bottom decoration ───────────────── -->
	<div class="relative z-10 overflow-hidden h-14 opacity-[0.07] pointer-events-none">
		<div class="flex gap-3 absolute whitespace-nowrap" style="animation: filmScroll 18s linear infinite;">
			{#each Array(30) as _}
				<div class="w-20 h-14 flex-shrink-0 rounded bg-white/20 border border-white/20" />
			{/each}
		</div>
	</div>

</main>

<style>
	@keyframes filmScroll {
		from { transform: translateX(0); }
		to   { transform: translateX(-50%); }
	}
	@keyframes floatR {
		0%, 100% { transform: rotate(12deg) translateY(0); }
		50%       { transform: rotate(14deg) translateY(-6px); }
	}
	@keyframes floatL {
		0%, 100% { transform: rotate(-12deg) translateY(0); }
		50%       { transform: rotate(-14deg) translateY(-6px); }
	}
	.animate-float-r { animation: floatR 4s ease-in-out infinite; }
	.animate-float-l { animation: floatL 4s ease-in-out infinite 0.5s; }
</style>
