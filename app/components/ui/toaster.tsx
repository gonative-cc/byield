import { useToast } from "~/hooks/use-toast";
import { CircleX, Info, TriangleAlert } from "lucide-react";
import { Alert, Button, Toast } from "react-daisyui";
import { cva } from "class-variance-authority";

const toastVariants = cva("alert-outline", {
	variants: {
		variant: {
			default: "",
			info: "alert-info",
			destructive: "alert-error",
			warning: "alert-warning",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface ToastIconProps {
	variant: "default" | "destructive" | "warning" | "info" | null | undefined;
}

function ToastIcon({ variant }: ToastIconProps) {
	switch (variant) {
		case "destructive":
			return <CircleX />;
		case "warning":
			return <TriangleAlert />;
		default:
			return <Info />;
	}
}

export function Toaster() {
	const { toasts, dismiss } = useToast();

	return (
		<Toast vertical="bottom" horizontal="end">
			{toasts.map(({ id, title, description, variant }) => (
				<div key={id} className={toastVariants({ variant })}>
					<Alert>
						<ToastIcon variant={variant} />
						<div className="flex flex-col gap-2">
							{title && <span>{title}</span>}
							{description && <span>{description}</span>}
						</div>
						<Button color="ghost" onClick={() => dismiss(id)}>
							X
						</Button>
					</Alert>
				</div>
			))}
		</Toast>
	);
}
