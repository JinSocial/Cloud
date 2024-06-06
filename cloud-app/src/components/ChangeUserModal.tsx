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
import admin from "../api/admin";
import User from "../api/types/User";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

type Form = {
	first_name: string;
	last_name: string;
	middle_name: string;
	email: string;
	new_password: string;
};

export default function ChangeUserModal({
	user,
	isOpen,
	onClose,
}: {
	user: User;
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
			await admin.editUser(
				{
					user: user.id,
					full_name:
						`${data.last_name} ${data.first_name} ${data.middle_name}`.trim(),
					email: data.email,
					new_password: data.new_password,
				},
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
		setValue("email", user.email);
		setValue("first_name", user.full_name.split(" ")[1] || "");
		setValue("last_name", user.full_name.split(" ")[0] || "");
		setValue("middle_name", user.full_name.split(" ")[2] || "");
	}, [user]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Изменить пользователя
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<Stack direction={"column"} spacing={2}>
							<FormControl isInvalid={errors.last_name ? true : false}>
								<FormLabel>Фамилия</FormLabel>
								<Input
									isDisabled={isSubmitting}
									{...register("last_name", { required: true })}
								/>
								{errors.last_name && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<FormControl isInvalid={errors.first_name ? true : false}>
								<FormLabel>Имя</FormLabel>
								<Input
									isDisabled={isSubmitting}
									{...register("first_name", { required: true })}
								/>
								{errors.first_name && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<FormControl isInvalid={errors.middle_name ? true : false}>
								<FormLabel>Отчество</FormLabel>
								<Input
									isDisabled={isSubmitting}
									{...register("middle_name", { required: false })}
								/>
								{errors.middle_name && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<FormControl isInvalid={errors.email ? true : false}>
								<FormLabel>Email</FormLabel>
								<Input
									isDisabled={isSubmitting}
									type="email"
									{...register("email", { required: true })}
								/>
								{errors.email && (
									<FormErrorMessage>Это поле обязательное</FormErrorMessage>
								)}
							</FormControl>
							<FormControl isInvalid={errors.new_password ? true : false}>
								<FormLabel>Новый пароль</FormLabel>
								<Input
									isDisabled={isSubmitting}
									type="password"
									autoComplete="off"
									{...register("new_password", { required: false })}
								/>
								{errors.new_password && (
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
