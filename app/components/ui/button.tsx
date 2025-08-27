import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/util/tailwind";
import { LoaderCircle } from "lucide-react";

const buttonVariants = cva(
	"py-3 px-6 cursor-pointer border rounded-md text-center rounded-md text-sm font-medium  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"bg-primary border-white/10 shadow-[inset_0_4px_10px_0_rgba(255,255,255,0.35),inset_0_-4px_10px_0_rgba(255,255,255,0.25)] hover:bg-primary-foreground",
				destructive:
					"bg-destructive text-white shadow-2xs hover:bg-destructive-foreground focus-visible:ring-destructive/20",
				outline:
					"border-primary bg-background hover:bg-accent shadow-2xs hover:border-primary-foreground hover:text-accent-foreground border-primary/30 hover:border-primary hover:bg-primary/10",
				secondary: "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "border-0 text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "px-4 py-2 has-[>svg]:px-3",
				sm: "rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
			layout: {
				default: "",
				oneLine: "flex items-center justify-center whitespace-nowrap gap-1",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
			layout: "default",
		},
	},
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	isLoading?: boolean;
}

function Button({
	className,
	variant,
	size,
	layout,
	asChild = false,
	isLoading = false,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";
	const computedClasses = cn(buttonVariants({ variant, size, layout, className }));

	return (
		<Comp data-slot="button" className={computedClasses} {...props}>
			{isLoading ? (
				<>
					<LoaderCircle className="animate-spin" />
					{children}
				</>
			) : (
				children
			)}
		</Comp>
	);
}

export { Button, buttonVariants };
