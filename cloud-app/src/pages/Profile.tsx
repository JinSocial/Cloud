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
import { Link as RLink } from "react-router-dom";
import auth from "../api/auth";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";
import { updateProfile } from "../utils/utils";

type Form = {
	first_name: string;
	last_name: string;
	middle_name: string;
	email: string;
};

function Profile() {
	const context = useContext(AppContext);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Form>({
		defaultValues: {
			email: context.props.auth?.profile.email,
			first_name: context.props.auth?.profile.full_name.split(" ")[1],
			last_name: context.props.auth?.profile.full_name.split(" ")[0],
			middle_name: context.props.auth?.profile.full_name.split(" ")[2],
		},
	});
	const toast = useToast();

	const onSubmit: SubmitHandler<Form> = async data => {
		try {
			await auth.editProfile(
				`${data.last_name} ${data.first_name} ${data.middle_name}`.trim(),
				data.email,
				context.props.auth?.token || ""
			);
			await updateProfile(context, toast);
			toast({
				status: "success",
				title: "Успешно",
				description: "Профиль сохранен!",
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
					<Heading>Профиль</Heading>
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

					<Button w="full" type="submit" isDisabled={isSubmitting}>
						Сохранить
					</Button>

					<Link as={RLink} to="/profile/password">
						Изменить пароль
					</Link>
				</Stack>
			</Center>
		</form>
	);
}

export default Profile;
