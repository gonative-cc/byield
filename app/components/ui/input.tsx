import * as React from "react";
import { cn } from "~/util/tailwind";

export interface InputProps extends React.ComponentProps<"input"> {
	leftAdornments?: React.ReactNode;
	rightAdornments?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, leftAdornments, rightAdornments, ...props }, ref) => {
		return (
			<>
				<div className="relative flex items-center bg-dark-blue rounded-2xl border-2 border-white-10 focus-within:ring-1 focus-within:ring-ring px-2">
					{leftAdornments}
					<input
						type={type}
						className={cn(
							"flex w-full rounded-2xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
							"border-1 focus-visible:ring-0 shadow-none",
							className,
						)}
						ref={ref}
						{...props}
					/>
					{rightAdornments}
				</div>
			</>
		);
	},
);
Input.displayName = "Input";

export { Input };
