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

// Gradient constants
export const GRADIENTS = {
	// Background gradients
	pageBg: "bg-gradient-to-br from-background via-azure-20 to-azure-25",
	azureCard: "bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15",
	azureCardReverse: "bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20",
	azureTable: "bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20",
	azureTableHeader: "bg-gradient-to-r from-azure-15 to-azure-20",

	// Primary gradients
	primaryCard: "bg-gradient-to-r from-primary/10 to-secondary/10",
	primaryAvatar: "bg-gradient-to-r from-primary to-orange-400",
	primaryNft: "bg-gradient-to-br from-primary/20 to-orange-400/20",
	primaryNftBg: "bg-gradient-to-br from-primary/5 to-yellow-400/5",
	primaryCollapse:
		"bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
	primarySelectedRow: "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
	primaryInfoCard: "bg-gradient-to-r from-primary/5 to-primary/10",

	// Status gradients
	purpleStatus: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
	orangeWarning: "bg-gradient-to-r from-orange-700/50 to-orange-700/40",
} as const;

export function avatarGradientClasses() {
	return `w-10 h-10 rounded-full ${GRADIENTS.primaryAvatar} flex items-center justify-center`;
}

export function primaryHeadingClasses() {
	return "text-2xl font-bold text-primary-foreground";
}

export function cardShowcaseClasses() {
	return "shadow-2xl card-border transition-all duration-300";
}

export function infoBoxClasses() {
	return "p-3 bg-primary/10 rounded-lg border border-primary/20";
}

export function gradientCardClasses() {
	return `card ${GRADIENTS.primaryCard} border border-primary/20`;
}

export function azureCardClasses() {
	return GRADIENTS.azureCard;
}

export function defaultCardClasses() {
	return "card bg-card border border-border";
}

export function alertPrimaryClasses() {
	return "alert bg-primary border-primary";
}

export const collapseGradientClasses = `${GRADIENTS.primaryCollapse} text-primary flex w-full items-center justify-between p-4 text-left text-lg hover:text-orange-400 lg:p-6 lg:text-xl`;

export const selectedRowGradientClasses = `${GRADIENTS.primarySelectedRow} border-l-4 border-primary shadow-lg scale-[1.02] relative z-10 animate-float`;

export const orangeInfoCardClasses = `${GRADIENTS.primaryInfoCard} rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10`;

export const heroTitle = "text-center text-2xl font-semibold md:text-3xl";

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
