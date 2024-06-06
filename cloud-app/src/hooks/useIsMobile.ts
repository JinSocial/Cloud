import { useEffect, useState } from "react";

const useIsMobile = (): boolean => {
	const [width, setWidth] = useState<number>(window.innerWidth);

	useEffect(() => {
		const handleWindowSizeChange = () => {
			setWidth(window.innerWidth);
		};
		window.addEventListener("resize", handleWindowSizeChange);
		return () => {
			window.removeEventListener("resize", handleWindowSizeChange);
		};
	}, []);
	const isMobile = width <= 768;

	return isMobile;
};

export default useIsMobile;
