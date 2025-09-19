import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function buttonEffectClasses() {
	return "transition-all duration-300 transform hover:scale-[1.02]";
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
