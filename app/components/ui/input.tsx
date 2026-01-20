import * as React from "react";
import { cn } from "~/tailwind";

export interface InputProps extends React.ComponentProps<"input"> {
	leftAdornments?: React.ReactNode;
	rightAdornments?: React.ReactNode;
	containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, leftAdornments, rightAdornments, containerClassName, ...props }, ref) => {
		return (
			<div
				className={cn(
					"bg-azure-25 border-white-10 focus-within:ring-ring relative flex items-center rounded-2xl border-2 px-2 focus-within:ring-1",
					containerClassName,
				)}
			>
				{leftAdornments}
				<input
					type={type}
					className={cn(
						"border-input file:text-foreground placeholder:text-base-content/75 focus-visible:ring-ring flex w-full rounded-2xl bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						"shadow-none focus-visible:ring-0",
						className,
					)}
					ref={ref}
					{...props}
				/>
				{rightAdornments}
			</div>
		);
	},
);
Input.displayName = "Input";

export { Input };
