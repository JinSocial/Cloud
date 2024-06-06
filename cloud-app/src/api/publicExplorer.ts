import axios from "axios";
import config from "../config";
import { BasicResponse, PaginationMeta } from "./types/BasicResponse";
import { FileItem } from "./types/File";

async function getFiles(
	params: {
		search?: string;
		folder_id?: number;
		limit: number;
		page: number;
		sort: "desc" | "asc";
	},
	token: string
): Promise<
	BasicResponse & {
		items: { meta: PaginationMeta; data: FileItem[] };
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/public/explorer/files`, {
		params,
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getFile(
	id: number,
	token: string
): Promise<BasicResponse & { item: FileItem }> {
	const { data } = await axios.get(`${config.apiUrl}/public/explorer/file`, {
		params: { item_id: id },
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function toggle(
	id: number,
	token: string
): Promise<BasicResponse & { item: FileItem }> {
	const { data } = await axios.post(
		`${config.apiUrl}/public/explorer/toggle`,
		{ item_id: id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const publicExplorer = {
	getFiles,
	getFile,
	toggle,
};

export default publicExplorer;
