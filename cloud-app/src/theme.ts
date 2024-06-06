import { extendTheme } from "@chakra-ui/react";
import "./css/theme.css";

export const theme = extendTheme({
	fonts: {
		heading: "'Nunito', sans-serif",
		body: "'Nunito', sans-serif",
	},
	styles: {
		global: {
			body: {
				color: "#333333",
				backgroundColor: "white",
			},
		},
	},
	config: {
		initialColorMode: "dark",
		useSystemColorMode: false,
		cssVarPrefix: "aithercol",
	},
});
