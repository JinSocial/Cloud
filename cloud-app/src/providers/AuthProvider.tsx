import { Center, Spinner, useBoolean } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../api/auth";
import Header from "../components/Header";
import { AppContext } from "./AppProvider";
import BaseProvider from "./BaseProvider";

function AuthProvider({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useBoolean(true);
	const context = useContext(AppContext);
	const navigate = useNavigate();

	useEffect(() => {
		const getAuth = async () => {
			try {
				if (!context.props.auth) {
					setLoading.on();
					const token = window.localStorage.getItem("auth-token");
					if (token && context.setProps) {
						const profile = await auth.getProfile(token);

						if (profile === null) {
							navigate("/login");
						} else {
							context.setProps({ auth: { token: token, profile: profile } });
						}
					} else {
						navigate("/login");
					}
				}
			} catch (error) {
				navigate("/login");
			} finally {
				setLoading.off();
			}
		};

		getAuth();
	}, []);

	return loading ? (
		<BaseProvider>
			<Center h="80vh">
				<Spinner size="xl" color="#333333" />
			</Center>
		</BaseProvider>
	) : (
		<>
			<Header />
			<BaseProvider>{children}</BaseProvider>
		</>
	);
}

export default AuthProvider;
