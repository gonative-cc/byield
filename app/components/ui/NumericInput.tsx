import * as React from "react";
import { cn } from "~/util/tailwind";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";

export interface NumericInputProps extends NumericFormatProps {
	leftAdornments?: React.ReactNode;
	rightAdornments?: React.ReactNode;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
	({ className, type, leftAdornments, rightAdornments, ...props }, ref) => {
		return (
			<div className="border-white-10 focus-within:ring-ring bg-azure-25 relative flex items-center rounded-2xl border-2 px-2 focus-within:ring-1">
				{leftAdornments}
				<NumericFormat
					type={type}
					getInputRef={ref}
					className={cn(
						"border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-2xl border bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						"border-0 shadow-none focus-visible:ring-0",
						className,
					)}
					{...props}
				/>
				{rightAdornments}
			</div>
		);
	},
);
NumericInput.displayName = "NumericInput";

export { NumericInput };
