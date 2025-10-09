// app/util/tailwind.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function buttonEffectClasses() {
	return "transition-all duration-300 transform hover:scale-[1.02]";
}

export function primaryBadgeClasses() {
	return "px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 font-semibold text-primary";
}

export function pageBgClasses() {
	return "bg-gradient-to-br from-background via-azure-20 to-azure-25";
}

export function avatarGradientClasses() {
	return "w-10 h-10 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center";
}

export function primaryHeadingClasses() {
	return "text-2xl font-bold text-primary";
}

export function cardShowcaseClasses() {
	return "shadow-2xl card-border transition-all duration-300";
}

export function infoBoxClasses() {
	return "p-3 bg-primary/10 rounded-lg border border-primary/20";
}

export function gradientCardClasses() {
	return "card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20";
}

export function azureCardClasses() {
	return "bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15";
}

export function defaultCardClasses() {
	return "card bg-card border border-border";
}

export function alertPrimaryClasses() {
	return "alert bg-primary border-primary";
}

export const orangeInfoCardClasses =
	"bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10";

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
