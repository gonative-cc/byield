import { useLayoutEffect, useState } from "react";

export const useMobile = () => {
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [mobileOS, setMobileOS] = useState<"android" | "ios" | null>(null);

	useLayoutEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
			const userAgent = navigator.userAgent.toLowerCase();
			if (/android/.test(userAgent)) {
				setMobileOS("android");
			} else if (/iphone|ipad|ipod/.test(userAgent)) {
				setMobileOS("ios");
			} else {
				setMobileOS(null);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return { isMobile, mobileOS };
};
