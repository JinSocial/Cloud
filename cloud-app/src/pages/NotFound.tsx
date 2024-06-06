import { Center, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RLink } from "react-router-dom";

function NotFound() {
	return (
		<Center minH="100vh">
			<Stack
				textAlign={"center"}
				alignItems={"center"}
				direction={"column"}
				spacing={2}
			>
				<Heading>404</Heading>
				<Text>Страница не найдена</Text>
				<Link as={RLink} to="/">
					На главную
				</Link>
			</Stack>
		</Center>
	);
}

export default NotFound;
