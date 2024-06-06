import { Stack, useColorMode } from "@chakra-ui/react";
import moment from "moment";
import "moment/locale/ru";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword";
import Explorer from "./pages/Explorer";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import PublicExlorer from "./pages/PublicExplorer";
import Register from "./pages/Register";
import Shared from "./pages/Shared";
import Admin from "./pages/admin";
import AdminProvider from "./providers/AdminProvider";
import AuthProvider from "./providers/AuthProvider";
import BaseProvider from "./providers/BaseProvider";

function App() {
	moment.locale("ru");
	const { setColorMode } = useColorMode();

	useEffect(() => {
		setColorMode("light");
	}, []);

	return (
		<Stack direction={"column"} minH="100vh" justifyContent={"space-between"}>
			<Stack direction={"column"} spacing={0}>
				<Routes>
					<Route
						path="/"
						element={
							<AuthProvider>
								<Navigate to="/explorer" />
							</AuthProvider>
						}
					/>

					<Route
						path="/public/explorer"
						element={
							<AuthProvider>
								<PublicExlorer />
							</AuthProvider>
						}
					/>

					<Route
						path="/admin"
						element={
							<AdminProvider>
								<Admin />
							</AdminProvider>
						}
					/>

					<Route
						path="/explorer"
						element={
							<AuthProvider>
								<Explorer />
							</AuthProvider>
						}
					/>

					<Route
						path="/explorer/favorite"
						element={
							<AuthProvider>
								<Favorite />
							</AuthProvider>
						}
					/>

					<Route
						path="/explorer/folder/:folder"
						element={
							<AuthProvider>
								<Explorer />
							</AuthProvider>
						}
					/>

					<Route path="/s/:hash" element={<Shared />} />

					<Route
						path="/profile"
						element={
							<AuthProvider>
								<Profile />
							</AuthProvider>
						}
					/>
					<Route
						path="/profile/password"
						element={
							<AuthProvider>
								<ChangePassword />
							</AuthProvider>
						}
					/>

					<Route
						path="/login"
						element={
							<BaseProvider>
								<Login />
							</BaseProvider>
						}
					/>
					<Route
						path="/register"
						element={
							<BaseProvider>
								<Register />
							</BaseProvider>
						}
					/>

					<Route path="*" element={<NotFound />} />
				</Routes>
			</Stack>
		</Stack>
	);
}

export default App;
