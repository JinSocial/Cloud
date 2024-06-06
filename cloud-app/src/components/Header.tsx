import {
	Avatar,
	Heading,
	Link,
	Menu,
	MenuButton,
	MenuGroup,
	MenuItem,
	MenuList,
	Stack,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Link as RLink, useLocation } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { AppContext } from "../providers/AppProvider";

function Header() {
	const { pathname } = useLocation();
	const context = useContext(AppContext);
	const isMobile = useIsMobile();

	return (
		<Stack
			direction={"row"}
			justifyContent={"space-between"}
			alignItems={"center"}
			padding={3}
		>
			<Stack direction={"column"} spacing={0}>
				<Heading size={"md"}>Электронный архив</Heading>
			</Stack>

			{!isMobile && (
				<Stack alignItems={"center"} direction={"row"} spacing={2}>
					<Link
						fontWeight={pathname.startsWith("/explorer") ? 700 : 500}
						opacity={pathname.startsWith("/explorer") ? "1" : "0.5"}
						as={RLink}
						to="/explorer"
					>
						Файлы
					</Link>
					<Link
						fontWeight={pathname.startsWith("/public/explorer") ? 700 : 500}
						opacity={pathname.startsWith("/public/explorer") ? "1" : "0.5"}
						as={RLink}
						to="/public/explorer"
					>
						Публичные файлы
					</Link>
					{context.props.auth?.profile.is_admin && (
						<Link
							fontWeight={pathname.startsWith("/admin") ? 700 : 500}
							opacity={pathname.startsWith("/admin") ? "1" : "0.5"}
							as={RLink}
							to="/admin"
						>
							Администрирование
						</Link>
					)}
					<Menu>
						<MenuButton as={Link}>
							<Avatar
								size={"sm"}
								name={context.props.auth?.profile.full_name}
							></Avatar>
						</MenuButton>
						<MenuList>
							<MenuGroup title="Аккаунт">
								<MenuItem as={RLink} to="/profile">
									Редактировать
								</MenuItem>
								<MenuItem
									onClick={() => {
										window.localStorage.removeItem("auth-token");
										window.location.reload();
									}}
								>
									Выйти
								</MenuItem>
							</MenuGroup>
						</MenuList>
					</Menu>
				</Stack>
			)}
		</Stack>
	);
}

export default Header;
