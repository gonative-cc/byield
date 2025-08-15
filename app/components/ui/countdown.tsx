import React, { useState, useEffect } from "react";

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
	const [secLeft, setSecLeft] = useState<number>(calcLeft(targetTime));

	useEffect(() => {
		const timer = setInterval(() => {
			const s = calcLeft(targetTime);
			setSecLeft(s);
			if (s <= 0) {
				clearInterval(timer);
				onTimeUp?.();
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [targetTime, onTimeUp]);

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
