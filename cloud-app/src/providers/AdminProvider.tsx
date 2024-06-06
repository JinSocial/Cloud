import { useContext } from "react";
import { AppContext } from "./AppProvider";
import AuthProvider from "./AuthProvider";

function AdminProvider({ children }: { children: React.ReactNode }) {
	const context = useContext(AppContext);

	return (
		<AuthProvider>
			{context.props.auth?.profile.is_admin ? children : <></>}
		</AuthProvider>
	);
}

export default AdminProvider;
