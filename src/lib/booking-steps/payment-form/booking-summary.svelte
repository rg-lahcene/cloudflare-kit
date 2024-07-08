<script lang="ts">
	import { store } from '$lib/store';
	import type { AppointmentType, Nullable } from '$lib/types';
	import Badge from '$components/ui/badge/badge.svelte';
	import * as Card from '$components/ui/card/index';
	import Separator from '$components/ui/separator/separator.svelte';
	import { CalendarIcon, MailIcon, PhoneCallIcon, UserIcon, UserRoundIcon } from 'lucide-svelte';
	import { getExternalImageUrl } from '$lib/utils/external-image.utils';
	import * as Avatar from '$components/ui/avatar/index';
	// const
	const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };

	// public
	// store
	const { clientForm, appointmentType, therapist, appointmentDateAndTime } = store;
	$: client = $clientForm.data;

	$: avatarUrl = getExternalImageUrl($therapist?.avatar ?? '');
	$: initials = `${$therapist?.firstName?.[0]}${$therapist?.lastName?.[0]}`.toUpperCase();
	$: fullName = [$therapist?.firstName, $therapist?.lastName].filter(Boolean).join(' ');
</script>

<Card.Root class="w-full">
	<Card.Content class="mt-4">
		<!-- appointment details -->
		<div>
			<div class=" flex gap-2 justify-between items-center flex-wrap mt-2">
				<h2 class="text-lg font-semibold">{$appointmentType?.name}</h2>

				<Badge
					variant={$appointmentType?.refundableDeposit ? 'success' : 'danger'}
					class="py-1 text-sm"
				>
					<span class=" font-semibold text-sm">
						{$appointmentType?.refundableDeposit ? 'Refundable deposit' : 'Non refundable deposit'}
					</span>
				</Badge>
			</div>
			<p class="text-sm text-muted-foreground">{$appointmentType?.description}</p>
		</div>
		<Separator class="my-2" />
		<!-- therapise details -->
		<div class="flex gap-2 items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold">
					<span class="text-muted-foreground">Appointment with</span>
					{fullName}
				</h2>
				<span class="text-muted-foreground text-sm flex gap-2 items-center">
					<CalendarIcon class="w-4 h-4"></CalendarIcon>
					{$appointmentDateAndTime}
				</span>
			</div>
			<Avatar.Root class="w-10 h-10">
				<Avatar.Image src={avatarUrl} alt={fullName} />
				<Avatar.Fallback>{initials}</Avatar.Fallback>
			</Avatar.Root>
		</div>
		<Separator class="my-2" />
		<!-- user details -->

		<div class="flex flex-col gap-2">
			<h2 class="text-lg font-semibold">Your details:</h2>
			<div>
				<p class="text-muted-foreground text-sm flex gap-2 items-center">
					<UserRoundIcon class="w-4 h-4" />
					{client.firstName}
					{client.lastName}
				</p>
				<p class="text-muted-foreground text-sm flex gap-2 items-center">
					<MailIcon class="w-4 h-4" />
					{client.email}
				</p>
				<p class="text-muted-foreground text-sm flex gap-2 items-center">
					<PhoneCallIcon class="w-4 h-4" />
					{client.phoneNumber?.formattedNumber}
				</p>
			</div>
		</div>
	</Card.Content>
</Card.Root>
