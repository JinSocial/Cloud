import {
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import explorer from "../api/explorer";
import { FileItem } from "../api/types/File";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

type Form = {
	new_name: string;
};

export default function RenameFileModal({
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
			await explorer.renameFile(
				file?.id || 0,
				data.new_name,
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

	useEffect(() => {
		if (file) {
			setValue("new_name", file.name);
		}
	}, [file]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Переименовать файл
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack direction={"column"} spacing={2}>
							<FormControl isInvalid={errors.new_name ? true : false}>
								<FormLabel>Имя файла</FormLabel>
								<Input
									placeholder="Введите имя"
									{...register("new_name", { required: true })}
								></Input>
								{errors.new_name && (
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
