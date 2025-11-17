import { X } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { cn } from "~/util/tailwind";

interface ModalProps {
	id: string;
	open?: boolean;
	handleClose?: () => void;
	title?: string | React.ReactNode;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

function openModal(id: string, operation: "open" | "close") {
	const modal = document?.getElementById(id) as HTMLDialogElement;
	if (modal) {
		if (operation === "open") {
			modal.showModal();
		}
		if (operation === "close") {
			modal.close();
		}
	} else {
		console.error(`modal id ${id} not found`);
	}
}

export function Modal({ id, open, title, description, children, handleClose, className }: ModalProps) {
	useEffect(() => {
		if (open === undefined) return;
		if (open) {
			openModal(id, "open");
		} else {
			openModal(id, "close");
		}
	}, [handleClose, id, open]);

	return (
		<dialog id={id} className="modal">
			<div className={cn("modal-box", className)}>
				<button
					className="btn btn-sm btn-circle btn-ghost absolute top-1 right-2"
					onClick={() => openModal(id, "close")}
				>
					<X />
				</button>
				{typeof title === "string" ? <h3 className="mb-2 text-lg font-bold">{title}</h3> : title}
				{description && <p className="mb-2">{description}</p>}
				{children}
			</div>
			<form method="dialog" className="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
	);
}

interface ModalTriggerButtonProps {
	id: string;
	className?: string;
	children: React.ReactNode;
}

export function ModalTriggerButton({ id, className, children }: ModalTriggerButtonProps) {
	return (
		<button className={cn("btn", className)} onClick={() => openModal(id, "open")}>
			{children}
		</button>
	);
}
