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
		folder: FileItem | null;
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/explorer/files`, {
		params,
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getFolders(token: string): Promise<
	BasicResponse & {
		folders: { id: number; name: string; sub_folders: number[] }[];
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/explorer/folders`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getFile(
	id: number,
	token: string
): Promise<BasicResponse & { item: FileItem }> {
	const { data } = await axios.get(`${config.apiUrl}/explorer/file`, {
		params: { item_id: id },
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function uploadFile(
	params: {
		file: File;
		folder_id?: number;
	},
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.postForm(
		`${config.apiUrl}/explorer/upload_file`,
		params,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function createFolder(
	params: { name: string; folder_id?: number },
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/create_folder`,
		{ ...params, is_public: false },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function renameFile(
	file_id: number,
	new_name: string,
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/rename`,
		{ item_id: file_id, new_name },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function moveFile(
	file_id: number,
	folder_id: number | null,
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/move`,
		{ item_id: file_id, folder_id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function deleteFile(
	file_id: number,
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/delete`,
		{ item_id: file_id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function shareFile(
	file_id: number,
	token: string
): Promise<BasicResponse & { hash: string }> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/share`,
		{ item_id: file_id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function unshareFile(
	file_id: number,
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/unshare`,
		{ item_id: file_id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function getSharedFile(
	hash: string
): Promise<BasicResponse & { item: FileItem }> {
	const { data } = await axios.get(`${config.apiUrl}/shared/get?hash=${hash}`);

	return data;
}

async function getFavoriteFiles(
	params: {
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
	const { data } = await axios.get(`${config.apiUrl}/explorer/favorite`, {
		params,
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function favoriteToggle(
	id: number,
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/explorer/favorite/toggle`,
		{ item_id: id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const explorer = {
	getFiles,
	getFolders,
	getFile,
	createFolder,
	moveFile,
	uploadFile,
	renameFile,
	deleteFile,
	shareFile,
	unshareFile,
	getSharedFile,
	favorite: {
		toggle: favoriteToggle,
		getFiles: getFavoriteFiles,
	},
};

export default explorer;
