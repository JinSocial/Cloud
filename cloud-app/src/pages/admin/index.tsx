import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import AdminExplorer from "./AdminExplorer";
import AdminUsers from "./AdminUsers";

function Admin() {
	return (
		<Tabs isLazy>
			<TabList>
				<Tab>Файлы</Tab>
				<Tab>Пользователи</Tab>
			</TabList>

			<TabPanels>
				<TabPanel>
					<AdminExplorer />
				</TabPanel>
				<TabPanel>
					<AdminUsers />
				</TabPanel>
			</TabPanels>
		</Tabs>
	);
}

export default Admin;
