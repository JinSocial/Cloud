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

type LoginForm = {
	email: string;
	password: string;
};

function Login() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>();
	const toast = useToast();
	const context = useContext(AppContext);
	const navigate = useNavigate();

	const onSubmit: SubmitHandler<LoginForm> = async data => {
		try {
			const tokenData = await auth.login(data.email, data.password);
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
					<Heading>Авторизация</Heading>
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
						<FormLabel>Пароль</FormLabel>
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
						Войти
					</Button>

					<Link as={RLink} to="/register">
						Зарегистрироваться
					</Link>
				</Stack>
			</Center>
		</form>
	);
}

export default Login;
