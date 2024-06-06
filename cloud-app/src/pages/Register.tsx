import {
	Button,
	Center,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Link,
	Stack,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link as RLink, useNavigate } from "react-router-dom";
import auth from "../api/auth";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

type RegisterForm = {
	first_name: string;
	last_name: string;
	middle_name: string;
	email: string;
	password: string;
};

function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterForm>();
	const toast = useToast();
	const context = useContext(AppContext);
	const navigate = useNavigate();

	const onSubmit: SubmitHandler<RegisterForm> = async data => {
		try {
			const tokenData = await auth.register(
				`${data.last_name} ${data.first_name} ${data.middle_name}`.trim(),
				data.email,
				data.password
			);
			const profile = await auth.getProfile(tokenData.token);

			if (!profile) {
				toast({
					title: "Неизвестная ошибка",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
				return;
			}

			if (context.setProps) {
				window.localStorage.setItem("auth-token", tokenData.token);
				context.setProps({ auth: { profile, token: tokenData.token } });
				navigate("/");
			}
		} catch (err: any) {
			errorHandler(err, toast);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Center h="80vh">
				<Stack alignItems={"flex-start"} direction={"column"} spacing={2}>
					<Heading>Регистрация</Heading>
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
					<FormControl isInvalid={errors.password ? true : false}>
						<FormLabel>Придумайте пароль</FormLabel>
						<Input
							isDisabled={isSubmitting}
							type="password"
							{...register("password", { required: true })}
						/>
						{errors.password && (
							<FormErrorMessage>Это поле обязательное</FormErrorMessage>
						)}
					</FormControl>

					<Button w="full" type="submit" isDisabled={isSubmitting}>
						Зарегистрироваться
					</Button>

					<Link as={RLink} to="/login">
						Войти
					</Link>
				</Stack>
			</Center>
		</form>
	);
}

export default Register;
