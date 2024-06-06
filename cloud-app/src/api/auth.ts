import axios from "axios";
import config from "../config";
import { BasicResponse } from "./types/BasicResponse";
import User from "./types/User";

async function getProfile(token: string): Promise<User | null> {
	try {
		const { data } = await axios.get(`${config.apiUrl}/auth/profile`, {
			headers: { Authorization: `Bearer ${token}` },
		});

		return data.profile;
	} catch (error) {
		return null;
	}
}

async function login(
	email: string,
	password: string
): Promise<BasicResponse & { token: string }> {
	const { data } = await axios.post(`${config.apiUrl}/auth/login`, {
		email,
		password,
	});

	return data;
}

async function register(
	full_name: string,
	email: string,
	password: string
): Promise<BasicResponse & { token: string }> {
	const { data } = await axios.post(`${config.apiUrl}/auth/register`, {
		full_name,
		email,
		password,
	});

	return data;
}

async function editProfile(
	full_name: string,
	email: string,
	token: string
): Promise<BasicResponse & { token: string }> {
	const { data } = await axios.post(
		`${config.apiUrl}/auth/edit_profile`,
		{
			full_name,
			email,
		},
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	return data;
}

export interface ChangePasswordBody {
	old_password: string;
	new_password: string;
}

async function changePassword(
	body: ChangePasswordBody,
	token: string
): Promise<BasicResponse & { token: string }> {
	const { data } = await axios.post(
		`${config.apiUrl}/auth/change_password`,
		body,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	return data;
}

const auth = {
	login,
	register,
	getProfile,
	editProfile,
	changePassword,
};

export default auth;
