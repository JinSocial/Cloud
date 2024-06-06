import {
	Button,
	Center,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import auth, { ChangePasswordBody } from "../api/auth";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

function ChangePassword() {
	const context = useContext(AppContext);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ChangePasswordBody>();
	const toast = useToast();

	const onSubmit: SubmitHandler<ChangePasswordBody> = async data => {
		try {
			const response = await auth.changePassword(
				data,
				context.props.auth?.token || ""
			);

			const profile = await auth.getProfile(response.token);

			if (!profile) {
				toast({
					title: "Unknown error",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				return;
			}

			if (context.setProps) {
				context.setProps({
					...context.props,
					auth: { profile, token: response.token },
				});
				reset();
			}
			toast({
				status: "success",
				title: "Успешно",
				description: "Пароль изменен!",
				duration: 3000,
				isClosable: true,
			});
		} catch (err: any) {
			errorHandler(err, toast);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Center>
				<Stack alignItems={"flex-start"} direction={"column"} spacing={2}>
					<Heading>Изменить пароль</Heading>
					<FormControl isInvalid={errors.old_password ? true : false}>
						<FormLabel>Старый пароль</FormLabel>
						<Input
							isDisabled={isSubmitting}
							type="password"
							{...register("old_password", { required: true })}
						/>
						{errors.old_password && (
							<FormErrorMessage>Это поле обязательное</FormErrorMessage>
						)}
					</FormControl>
					<FormControl isInvalid={errors.new_password ? true : false}>
						<FormLabel>Новый пароль</FormLabel>
						<Input
							isDisabled={isSubmitting}
							type="password"
							{...register("new_password", { required: true })}
						/>
						{errors.new_password && (
							<FormErrorMessage>Это поле обязательное</FormErrorMessage>
						)}
					</FormControl>

					<Button w="full" type="submit" isDisabled={isSubmitting}>
						Сохранить
					</Button>
				</Stack>
			</Center>
		</form>
	);
}

export default ChangePassword;
