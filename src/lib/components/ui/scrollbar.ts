import { cva } from 'class-variance-authority';

export const scrollBarVariants = cva('scrollbar relative overflow-y-auto  scrollbar-w-3', {
	variants: {
		variant: {
			default:
				'sm:scrollbar-thumb-muted-foreground sm:scrollbar-track-rounded-md sm:scrollbar-track-muted/50 sm:scrollbar-thumb-rounded-md'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});
