// app/util/tailwind.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function buttonEffectClasses() {
	return "transition-all duration-300 transform hover:scale-[1.02]";
}

export const cardVariants = {
	gradient: "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20",
	azure: "bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15",
	default: "bg-card border border-border",
} as const;

export const alertVariants = {
	orange_info: "bg-primary border-primary",
} as const;

export function getCardClasses(
	variant: keyof typeof cardVariants = "default",
	additionalClasses?: string,
) {
	return cn("card", cardVariants[variant], additionalClasses);
}

export function getAlertClasses(
	variant: keyof typeof alertVariants = "orange_info",
	additionalClasses?: string,
) {
	return cn("alert", alertVariants[variant], additionalClasses);
}

export function classNames(
	...args: (string | { [key: string]: boolean } | undefined | null)[]
): string {
	const classes: string[] = [];

	args.forEach((arg) => {
		if (!arg) return;

		if (typeof arg === "string") {
			classes.push(arg);
		} else if (typeof arg === "object") {
			Object.entries(arg).forEach(([className, condition]) => {
				if (condition) classes.push(className);
			});
		}
	});

	return classes.filter(Boolean).join(" ");
}
