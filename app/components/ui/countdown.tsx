import React, { useState, useEffect } from "react";
import type { WritableStreamDefaultWriter } from "stream/web";

function calcLeft(target: number) {
	const diff = target - new Date().getTime();
	if (diff <= 0) return 0;
	return Math.floor(diff / 1000);
}

// Helper for daisyUI countdown CSS variable
const styleV = (value: number) => ({ "--value": value }) as React.CSSProperties;

export interface CountdownProps {
	/// target epoch time in ms
	targetTime: number;
	onTimeUp?: () => void; // Optional callback function
	// Optional extra classes for the outer wrapper
	className?: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetTime, onTimeUp, className }) => {
	const [secLeft, setSecLeft] = useState<number | null>(null);

	useEffect(() => {
		let stop = false;
		const updateTime = () => {
			if (stop) return;
			const s = calcLeft(targetTime);
			setSecLeft(s);
			if (s <= 0) onTimeUp?.();
			else setTimeout(updateTime, 1000);
		};
		updateTime();
		return () => {
			stop = true;
		};
	}, [targetTime, onTimeUp]);

	if (secLeft === null) return;

	const hours = Math.floor(secLeft / 3600);
	const minutes = Math.floor((secLeft % 3600) / 60);
	const seconds = secLeft % 60;
	let cls = "countdown font-mono ";
	if (className) cls += className;

	return (
		<span className={cls} role="timer" aria-live="polite">
			<span style={styleV(hours)}>{hours}</span>:<span style={styleV(minutes)}>{minutes}</span>:
			<span style={styleV(seconds)}>{seconds}</span>
		</span>
	);
};
