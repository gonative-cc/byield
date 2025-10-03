import { useToast } from '~/hooks/use-toast';
import { CircleX, Info, TriangleAlert } from 'lucide-react';
import { cva } from 'class-variance-authority';

const toastVariants = cva('alert', {
	variants: {
		variant: {
			default: 'alert-success',
			info: 'alert-info',
			destructive: 'alert-error',
			warning: 'alert-warning',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

interface ToastIconProps {
	variant: 'default' | 'destructive' | 'warning' | 'info' | null | undefined;
}

function ToastIcon({ variant }: ToastIconProps) {
	switch (variant) {
		case 'destructive':
			return <CircleX />;
		case 'warning':
			return <TriangleAlert />;
		default:
			return <Info />;
	}
}

export function Toaster() {
	const { toasts, dismiss } = useToast();

	return (
		// TODO: replace daisyui classes with react-daisyui component when it supports daisyui 5.
		<div className="toast toast-bottom toast-end">
			{toasts.map(({ id, title, description, variant }) => (
				<div key={id} className={toastVariants({ variant })}>
					<ToastIcon variant={variant} />
					<div className="flex flex-col gap-2">
						{title && <span>{title}</span>}
						{description && <span>{description}</span>}
					</div>
					<button className="btn btn-ghost" onClick={() => dismiss(id)}>
						X
					</button>
				</div>
			))}
		</div>
	);
}
