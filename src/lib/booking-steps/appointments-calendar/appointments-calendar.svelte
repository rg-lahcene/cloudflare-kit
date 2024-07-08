<script lang="ts">
	import { store, type Step } from '$lib/store';
	import { fade, fly } from 'svelte/transition';
	import { cn } from '$lib/utils';
	import Calendar from '$components/ui/calendar/calendar.svelte';
	import {
		getLocalTimeZone,
		startOfMonth,
		endOfMonth,
		CalendarDate,
		today
	} from '@internationalized/date';
	import type { ListAvailableAppointmentSlotsResponse } from '$lib/parse-server';
	import { Skeleton } from '$components/ui/skeleton';
	import type { AppointmentType } from '$lib/types';
	import { flip } from 'svelte/animate';

	// types
	type Slot = ListAvailableAppointmentSlotsResponse[number]['slots'][number];

	// public
	export let hash: string;

	// state
	const { appointmentType, currentStep, appointmentDate } = store;
	// const invalideInSeconds = 60;

	// reactive
	$: slots$ = fetchAvailableSlots(selectedDate, $appointmentType, $currentStep);
	let selectedDate: CalendarDate = today(store.timeZone);

	// fields
	let selectedSlot: Slot | null = null;
	const userTimeZone = getLocalTimeZone();
	const cache = new Map<string, ListAvailableAppointmentSlotsResponse>();

	// functions
	async function fetchAvailableSlots(
		calendarDate: CalendarDate,
		appointmentType: AppointmentType | null,
		currentStep: Step
	): Promise<Slot[]> {
		const appointmentTypeId = appointmentType?.objectId;
		if (!calendarDate || !appointmentTypeId || !hash || currentStep !== 'select-date-time')
			return [];

		const startDateIso = startOfMonth(calendarDate).toDate(userTimeZone).toISOString();
		const endDate = endOfMonth(calendarDate).toDate(userTimeZone);
		endDate.setHours(23, 59, 59);
		const endDateIso = endDate.toISOString();

		const cacheKey = `${appointmentTypeId}-${startDateIso}-${endDate}`;
		// TODO: invalidate cache after x seconds
		if (cache.has(cacheKey) && cache.get(cacheKey)?.length) {
			return getSlotsOfDate(
				cache.get(cacheKey) as ListAvailableAppointmentSlotsResponse,
				calendarDate
			);
		}

		const { data, error } = (await fetch('/api/list-available-time-slots', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				appointmentTypeId,
				startDate: startDateIso,
				endDate: endDateIso,
				userTimeZone,
				hash
			})
		}).then((res) => res.json())) as { data: ListAvailableAppointmentSlotsResponse } & {
			error: Error;
		};
		if (error) {
			throw error;
		}
		cache.set(cacheKey, data);
		return getSlotsOfDate(data, calendarDate);
	}

	function getSlotsOfDate(data: ListAvailableAppointmentSlotsResponse, date: CalendarDate): Slot[] {
		return (
			data?.find(({ date: isoDate }) => {
				const d = new Date(isoDate);
				return (
					d.getDate() === date.day &&
					d.getMonth() === date.month - 1 && // CalendarDate first monnth is 1 and not 0
					d.getFullYear() === date.year
				);
			})?.slots ?? []
		);
	}

	function handleSlotSelect(slot: Slot) {
		selectedSlot = slot;
		store.selectAppointmentDate(new Date(slot.from), new Date(slot.to));
	}
</script>

<div>
	<div class="grid md:grid-cols-[auto_auto] grid-cols-1 items-start justify-start md:gap-8 gap-4">
		<div class="flex flex-col items-center">
			<Calendar
				unselectable={'off'}
				bind:value={selectedDate}
				class="bg-gray-50 dark:bg-gray-900 rounded-xl"
			/>
		</div>
		<div class="flex flex-col items-center">
			<div class="flex flex-wrap gap-2">
				{#await slots$}
					<div>
						<p class="text-muted-foreground text-xl">Fetching available slots...</p>
						<div class="flex items-center space-x-4 mt-6">
							<Skeleton class="h-12 w-12 " />
							<div class="space-y-2">
								<Skeleton class="h-4 w-[250px]" />
								<Skeleton class="h-4 w-[200px]" />
							</div>
							<Skeleton class="h-12 w-12 " />
						</div>
					</div>
				{:then slots}
					<div class=" flex sm:justify-start gap-4 justify-center flex-wrap">
						{#each slots as slot, i (slot.fromLocal)}
							<button
								on:click={() => handleSlotSelect(slot)}
								class={cn('time-slot', {
									selected: slot.from === selectedSlot?.from
								})}
							>
								<div class="text-inherit flex items-center justify-center gap-2">
									<span class=" transition-all"> {slot.fromLocal}</span>
									{#if slot.from === selectedSlot?.from}
										<span class=" border-l h-5 border-white/80" />
										<span
											in:fly={{ x: -10, duration: 200 }}
											out:fly={{ x: 10, duration: 200 }}
											class="text-xs"
										>
											{slot.toLocal}</span
										>
									{/if}
								</div>
								<span class="bg"></span>
							</button>
						{:else}
							<p class="text-center text-muted-foreground m-auto">No available time slots</p>
						{/each}
					</div>
				{:catch error}
					<p class="text-red-500 text-xl">Failed to fetch slots!</p>
					<code> {error.message} </code>
				{/await}
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.time-slot {
		@apply rounded-lg font-medium px-4 py-4 w-36 relative transition-all focus:scale-105 text-gray-700;
		.bg {
			@apply bg-muted inset-0 absolute rounded-lg opacity-5 transition-all bg-primary -z-[1]  duration-300;
		}

		&.selected {
			@apply text-white;
			.bg {
				@apply opacity-100;
			}
		}
		&::before,
		&::after {
			@apply absolute transition-all w-16 h-[1px]  left-1/2 -translate-x-1/2 content-[''] opacity-0;
			@apply bg-gradient-to-r from-transparent via-primary to-transparent;
		}
		&::before {
			@apply bottom-[-1px];
		}
		&::after {
			@apply top-[-1px];
		}
		&:hover {
			/* .bg {
				@apply rounded-xl opacity-10;
			} */
			&::before {
				@apply opacity-100 bottom-0;
			}
			&::after {
				@apply opacity-100 top-0;
			}
		}
	}
</style>
