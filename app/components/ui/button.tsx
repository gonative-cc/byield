import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/util/tailwind";
import { LoaderCircle } from "lucide-react";

const buttonVariants = cva(
	"cursor-pointer inline-flex border rounded-md items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-hidden focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary border-white/10 shadow-[inset_0_4px_10px_0_rgba(255,255,255,0.35),inset_0_-4px_10px_0_rgba(255,255,255,0.25)] hover:bg-primary-foreground",
				destructive:
					"bg-destructive text-white shadow-2xs hover:bg-destructive-foreground focus-visible:ring-destructive/20",
				outline:
					"border-primary bg-background hover:bg-accent shadow-2xs hover:border-primary-foreground hover:text-accent-foreground",
				secondary: "bg-secondary text-secondary-foreground shadow-2xs hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "border-0 text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
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
	asChild = false,
	isLoading = false,
	children,
	...props
}: ButtonProps) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
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
