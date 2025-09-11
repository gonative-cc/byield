import { useEffect, useState, type ReactNode } from "react";

type ToasterToast = {
	id: string;
	title?: ReactNode;
	description?: ReactNode;
	variant?: "default" | "destructive" | "warning" | "info" | null;
};

let count = 0;

function genId() {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}

const listeners: Array<(toasts: ToasterToast[]) => void> = [];
let memoryState: ToasterToast[] = [];

function dispatch(toasts: ToasterToast[]) {
	memoryState = toasts;
	listeners.forEach((listener) => listener(toasts));
}

function toast(props: Omit<ToasterToast, "id">) {
	const id = genId();
	const newToast = { ...props, id };
	dispatch([...memoryState, newToast]);
	return id;
}

function dismiss(id: string) {
	dispatch(memoryState.filter((t) => t.id !== id));
}

function useToast() {
	const [toasts, setToasts] = useState<ToasterToast[]>(memoryState);

	useEffect(() => {
		listeners.push(setToasts);
		return () => {
			const index = listeners.indexOf(setToasts);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, []);

	return { toasts, dismiss };
}

export { useToast, toast };
