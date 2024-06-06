import {
	Button,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import admin from "../../api/admin";
import User from "../../api/types/User";
import ChangeUserModal from "../../components/ChangeUserModal";
import { AppContext } from "../../providers/AppProvider";
import errorHandler from "../../utils/errorHandler";
import AdminExplorer from "./AdminExplorer";

function AdminUsers() {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const filesModal = useDisclosure();
	const changeModal = useDisclosure();
	const context = useContext(AppContext);
	const toast = useToast();

	const getData = async () => {
		try {
			const data = await admin.getUsers(context.props.auth?.token || "");
			setUsers(data.users);
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	return (
		<TableContainer>
			<Table variant="simple">
				<Thead>
					<Tr>
						<Th>#</Th>
						<Th>Имя</Th>
						<Th>Email</Th>
						<Th>Статус</Th>
						<Th>Создан</Th>
						<Th></Th>
					</Tr>
				</Thead>
				<Tbody>
					{users.map(user => (
						<Tr>
							<Td>#{user.id}</Td>
							<Td>{user.full_name}</Td>
							<Td>{user.email}</Td>
							<Td>{user.is_admin ? "Админ" : "Пользователь"}</Td>
							<Td>{moment(user.created_at).format("LLL")}</Td>
							<Td>
								<Stack direction={"row"} spacing={1}>
									<Button
										size={"sm"}
										onClick={() => {
											setSelectedUser(user);
											filesModal.onOpen();
										}}
									>
										Файлы
									</Button>

									<Button
										size={"sm"}
										onClick={() => {
											setSelectedUser(user);
											changeModal.onOpen();
										}}
									>
										Изменить
									</Button>

									<Button
										size={"sm"}
										onClick={async () => {
											try {
												await admin.deleteUser(
													user.id,
													context.props.auth?.token || ""
												);
												await getData();
											} catch (error) {
												errorHandler(error, toast);
											}
										}}
									>
										Удалить
									</Button>
								</Stack>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>

			{selectedUser && (
				<ChangeUserModal
					user={selectedUser}
					isOpen={changeModal.isOpen}
					onClose={() => {
						getData();
						changeModal.onClose();
					}}
				/>
			)}

			<Modal
				size={"full"}
				isOpen={filesModal.isOpen}
				onClose={filesModal.onClose}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader fontSize="lg" fontWeight="bold">
						Просмотр файлов
					</ModalHeader>

					<ModalCloseButton />

					<ModalBody mb={3}>
						<AdminExplorer user={selectedUser?.id} />
					</ModalBody>
				</ModalContent>
			</Modal>
		</TableContainer>
	);
}

export default AdminUsers;
