import axios from "axios";
import config from "../config";
import { BasicResponse, PaginationMeta } from "./types/BasicResponse";
import { FileItem } from "./types/File";
import User from "./types/User";

async function getFiles(
	params: {
		search?: string;
		user?: number;
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
	const { data } = await axios.get(`${config.apiUrl}/admin/files`, {
		params,
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function getUsers(token: string): Promise<
	BasicResponse & {
		users: User[];
	}
> {
	const { data } = await axios.get(`${config.apiUrl}/admin/users`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function editUser(
	body: {
		user: number;
		full_name: string;
		email: string;
		new_password?: string;
	},
	token: string
): Promise<BasicResponse> {
	const { data } = await axios.post(`${config.apiUrl}/admin/edit_user`, body, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return data;
}

async function deleteUser(id: number, token: string): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/admin/delete_user`,
		{ user: id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

async function deleteFile(id: number, token: string): Promise<BasicResponse> {
	const { data } = await axios.post(
		`${config.apiUrl}/admin/delete`,
		{ item_id: id },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const admin = {
	getFiles,
	getUsers,
	deleteUser,
	editUser,
	deleteFile,
};

export default admin;
