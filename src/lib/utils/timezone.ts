import tzdata from './tzdata.json';
export type TimeZone = {
	group: string;
	name: string;
	description: string;
	offsetString: string;
};

export const getUserTimeZone = () => {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getZoneOffsetString = (timeZone: string) => {
	return new Date()
		.toLocaleDateString('en-US', {
			timeZone,
			day: '2-digit',
			timeZoneName: 'short'
		})
		.slice(4);
};

const timeZoneFrom = (name: string, description: string) => {
	const group = name.split('/')[0];
	const offsetString = getZoneOffsetString(name); // e.g. 'GMT+1:00'
	return {
		group,
		name,
		description,
		offsetString
	} satisfies TimeZone;
};

export const getTimezones = (): TimeZone[] => {
	const timezones = tzdata.reduce((acc, curr) => {
		const zoneItems = Object.keys(curr.zones).map((description) =>
			timeZoneFrom(curr.zones[description], description)
		);
		acc = acc.concat(zoneItems);
		return acc;
	}, []);
	timezones.unshift({
		...timeZoneFrom(getUserTimeZone()),
		description: 'User TimeZone',
		group: 'User TimeZone'
	});
	return timezones;
};
