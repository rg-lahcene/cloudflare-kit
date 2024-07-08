import { z } from 'zod';

export const schema = z.object({
	firstName: z.string().min(1, 'First name is missing'),
	lastName: z.string().min(1, 'Last name is missing'),
	phoneNumber: z.object({
		countryCode: z.string(),
		isValid: z.boolean(),
		isPossible: z.boolean(),
		phoneNumber: z.string(),
		countryCallingCode: z.string(),
		formattedNumber: z.string(),
		nationalNumber: z.string(),
		formatInternational: z.string(),
		formatOriginal: z.string(),
		formatNational: z.string(),
		uri: z.string(),
		e164: z.string()
	}),
	email: z.string().email('Please enter a valid email address'),
	confirmationItems: z.array(z.string()).min(1, 'You need to accept the terms')
});

export default schema;
export type ClientFormSchema = z.infer<typeof schema>;
