import axios from "axios";
import auth from "../api/auth";
import { AppContextType } from "../providers/AppProvider";
import errorHandler from "./errorHandler";

export async function downloadFile(name: string, link: string) {
	if (
		link.toLowerCase().endsWith(".png") ||
		link.toLowerCase().endsWith(".jpg") ||
		link.toLowerCase().endsWith(".gif") ||
		link.toLowerCase().endsWith(".pdf")
	) {
		const { data: blob } = await axios.get(link, { responseType: "blob" });
		const url = window.URL.createObjectURL(new Blob([blob]));
		const linkItem = document.createElement("a");
		linkItem.href = url;
		linkItem.download = name;
		document.body.appendChild(linkItem);

		linkItem.click();

		document.body.removeChild(linkItem);
		window.URL.revokeObjectURL(url);
	} else {
		const linkItem = document.createElement("a");
		linkItem.href = link;
		linkItem.setAttribute("download", name);
		document.body.appendChild(linkItem);
		linkItem.click();
		document.body.removeChild(linkItem);
	}
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const updateProfile = async (context: AppContextType, toast: any) => {
	try {
		const profile = await auth.getProfile(context.props.auth?.token || "");

		if (!profile) {
			toast({
				title: "Неизвестная ошибка",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (context.setProps) {
			context.setProps({
				...context.props,
				auth: { profile, token: context.props.auth?.token || "" },
			});
		}
	} catch (error) {
		errorHandler(error, toast);
	}
};
