import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Select,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import explorer from "../api/explorer";
import { FileItem } from "../api/types/File";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

type Form = {
	folder_id: number;
};

export default function MoveFolderModal({
	file,
	isOpen,
	onClose,
}: {
	file?: FileItem;
	isOpen: boolean;
	onClose: () => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
		setValue,
	} = useForm<Form>();

	const onSubmit: SubmitHandler<Form> = async data => {
		try {
			await explorer.moveFile(
				file?.id || 0,
				data.folder_id,
				context.props.auth?.token || ""
			);
			reset();
			onClose();
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	const toast = useToast();
	const context = useContext(AppContext);
	const [folders, setFolders] = useState<
		{ id: number; name: string; sub_folders: number[] }[]
	>([]);

	useEffect(() => {
		if (file) {
			setValue("folder_id", file.folder_id || 0);
		}
	}, [file]);

	useEffect(() => {
		const getFolders = async () => {
			try {
				const data = await explorer.getFolders(context.props.auth?.token || "");
				setFolders(data.folders);
			} catch (error) {
				errorHandler(error, toast);
			}
		};
		getFolders();
	}, [isOpen]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Переместить файл
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack direction={"column"} spacing={2}>
							<FormControl isInvalid={errors.folder_id ? true : false}>
								<FormLabel>Папка</FormLabel>
								<Select {...register("folder_id", { required: true })}>
									<option value={"0"}>/</option>
									{folders.map(e => {
										if (
											e.id === file?.id ||
											e.sub_folders.includes(file?.id || 0)
										) {
											return <></>;
										}

										return <option value={e.id}>{e.name}</option>;
									})}
								</Select>
								{errors.folder_id && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<Button isDisabled={isSubmitting} type="submit">
								Сохранить
							</Button>
						</Stack>
					</form>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
