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
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import explorer from "../api/explorer";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

type Form = {
	name: string;
};

export default function AddFolderModal({
	folder_id,
	isOpen,
	onClose,
}: {
	folder_id?: number;
	isOpen: boolean;
	onClose: () => void;
}) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<Form>();

	const onSubmit: SubmitHandler<Form> = async data => {
		try {
			await explorer.createFolder(
				{ name: data.name, folder_id },
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

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Новая папка
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack direction={"column"} spacing={2}>
							<FormControl isInvalid={errors.name ? true : false}>
								<FormLabel>Имя папки</FormLabel>
								<Input
									placeholder="Введите имя"
									{...register("name", { required: true })}
								></Input>
								{errors.name && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<Button isDisabled={isSubmitting} type="submit">
								Создать
							</Button>
						</Stack>
					</form>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
