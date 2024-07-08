<script lang="ts">
	import logoImage from '$lib/assets/rehabgurulogo.png';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check, CircleX, CircleDot, HourglassIcon } from 'lucide-svelte';

	import { mediaQuery } from 'svelte-legos';
	import { store, type Step } from '$lib/store';
	import type {
		AppointmentDate,
		AppointmentStartEndDate,
		AppointmentType,
		ClientDetails,
		ClientForm,
		Nullable,
		User
	} from '$lib/types';
	import ClientDetailsForm from './client-details-form/client-details-form.svelte';

	// props
	export let logo: string;
	export let primaryColor: string;

	// reactive
	let open = false;
	$: imageUrl = logo || logoImage;

	let {
		appointmentType,
		appointmentDate,
		clientForm,
		therapist,
		currentStepTitle,
		currentStepIndex,
		appointmentDateAndTime
	} = store;

	// fields
	$: breadcrumbItems = getBreadcrumbItemms(
		$appointmentType,
		$appointmentDate,
		$clientForm,
		$therapist,
		$currentStepIndex,
		$appointmentDateAndTime
	);

	function getBreadcrumbItemms(
		appointmentType: Nullable<AppointmentType>,
		appointmentDate: Nullable<AppointmentStartEndDate>,
		clientForm: ClientForm,
		therapist: Nullable<User>,
		currentStepIndex: number,
		appointmentDateAndTime: string
	) {
		const items: { label: string; state: 'pending' | 'success' | 'error'; isCurrent: boolean }[] =
			[];
		const fullNameFn = (arr: string[]) => arr.filter(Boolean).join(' ');
		items.push({
			label: appointmentType ? appointmentType.name : 'Appointment type',
			state: currentStepIndex === 0 ? 'pending' : 'success',
			isCurrent: currentStepIndex === 0
		});
		items.push({
			label: therapist ? fullNameFn([therapist.firstName, therapist.lastName]) : 'Your therapist',
			state: currentStepIndex < 1 ? 'pending' : !therapist ? 'error' : 'success',
			isCurrent: currentStepIndex === 1
		});
		items.push({
			label: appointmentDateAndTime ? appointmentDateAndTime : 'Date & Time',
			state: currentStepIndex < 2 ? 'pending' : !appointmentDateAndTime ? 'error' : 'success',
			isCurrent: currentStepIndex === 2
		});

		const { data, isValid } = clientForm;

		items.push({
			label: isValid ? `${data.lastName.charAt(0)}.${data.firstName}` : 'Your Details',
			state: currentStepIndex < 3 ? 'pending' : isValid ? 'success' : 'error',
			isCurrent: currentStepIndex === 3
		});

		items.push({
			label: 'Confirmation & Payment ',
			state: currentStepIndex === 5 ? 'pending' : 'pending', // we will redirect on success (TODO: show error/success state)
			isCurrent: currentStepIndex === 4
		});

		return items;
	}

	let isDesktop = mediaQuery('(min-width: 768px)');
	$: ITEMS_TO_DISPLAY = $isDesktop ? 5 : 3;
</script>

<header class="flex flex-col gap-2 sticky top-0 bg-background">
	<div class="flex justify-between items-center gap-3">
		<h1 class="h1">{$currentStepTitle}</h1>
		<img src={imageUrl} class="md:w-44 w-20 rounded-md" alt="logo" />
	</div>

	<Breadcrumb.Root class="sm:block hidden mt-2">
		<Breadcrumb.List>
			<Breadcrumb.Item>
				<Breadcrumb.Page class="flex gap-1 items-center">
					<span class={breadcrumbItems[0].isCurrent ? 'animate-pulse' : ''}>
						{#if breadcrumbItems[0].state === 'success'}
							<Check class="text-green-500 w-5 h-5"></Check>
						{:else if breadcrumbItems[0].state === 'pending'}
							<CircleDot class="text-muted-foreground w-5 h-5 "></CircleDot>
						{:else}
							<HourglassIcon class="text-orange-500 w-5 h-5"></HourglassIcon>
						{/if}
					</span>
					{breadcrumbItems[0].label}
				</Breadcrumb.Page>
			</Breadcrumb.Item>
			<Breadcrumb.Separator />
			{#if breadcrumbItems.length > ITEMS_TO_DISPLAY}
				<Breadcrumb.Item>
					{#if $isDesktop}
						<DropdownMenu.Root bind:open>
							<DropdownMenu.Trigger class="flex items-center gap-1" aria-label="Toggle menu">
								<Breadcrumb.Ellipsis class="h-4 w-4" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								{#each breadcrumbItems.slice(1, -2) as item}
									<DropdownMenu.Item>
										{item.label}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					{:else}
						<Drawer.Root bind:open>
							<Drawer.Trigger aria-label="Toggle Menu">
								<Breadcrumb.Ellipsis class="h-4 w-4" />
							</Drawer.Trigger>
							<Drawer.Content>
								<Drawer.Header class="text-left">
									<Drawer.Title>Navigate to</Drawer.Title>
									<Drawer.Description>Select a page to navigate to.</Drawer.Description>
								</Drawer.Header>
								<div class="grid gap-1 px-4">
									{#each breadcrumbItems.slice(1, -2) as item}
										<a class="py-1 text-sm">
											{item.label}
										</a>
									{/each}
								</div>
								<Drawer.Footer class="pt-4">
									<Drawer.Close asChild let:builder>
										<Button variant="outline" builders={[builder]}>Close</Button>
									</Drawer.Close>
								</Drawer.Footer>
							</Drawer.Content>
						</Drawer.Root>
					{/if}
				</Breadcrumb.Item>
				<Breadcrumb.Separator />
			{/if}

			{#each breadcrumbItems.slice(-ITEMS_TO_DISPLAY + 1) as item, i}
				<Breadcrumb.Item>
					<Breadcrumb.Page class="flex gap-1 items-center max-w-20 truncate md:max-w-none">
						<span class={item.isCurrent ? 'animate-pulse' : ''}>
							{#if item.state === 'success'}
								<Check class="text-green-500 w-5 h-5"></Check>
							{:else if item.state === 'pending'}
								<CircleDot class="text-muted-foreground w-5 h-5"></CircleDot>
							{:else}
								<HourglassIcon class="text-orange-500 w-5 h-5"></HourglassIcon>
							{/if}
						</span>
						{item.label}
					</Breadcrumb.Page>
				</Breadcrumb.Item>
				{#if i < breadcrumbItems.slice(-ITEMS_TO_DISPLAY + 1).length - 1}
					<Breadcrumb.Separator />
				{/if}
			{/each}
		</Breadcrumb.List>
	</Breadcrumb.Root>
</header>
