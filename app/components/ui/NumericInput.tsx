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
			<div className="relative flex items-center rounded-2xl border-2 border-white-10 focus-within:ring-1 focus-within:ring-ring px-2 bg-azure-25">
				{leftAdornments}
				<NumericFormat
					type={type}
					getInputRef={ref}
					className={cn(
						"flex w-full rounded-2xl border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
						"border-0 focus-visible:ring-0 shadow-none",
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
