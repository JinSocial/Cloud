export interface FileItem {
	id: number;
	user_id: number;
	is_folder: boolean;
	is_public: boolean;
	is_favorite: boolean;
	folder_id: number | null;
	name: string;
	file: string | null;
	public_hash: string | null;
	created_at: string;
	updated_at: string;
}
