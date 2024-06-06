import {
	AlertDialog,
	AlertDialogBody,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Button,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useContext } from "react";
import admin from "../api/admin";
import explorer from "../api/explorer";
import { FileItem } from "../api/types/File";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";

export default function DeleteFileAlert({
	file,
	isOpen,
	onClose,
	isAdmin,
}: {
	file?: FileItem;
	isOpen: boolean;
	onClose: () => void;
	isAdmin?: boolean;
}) {
	const [loading, setLoading] = useBoolean();
	const toast = useToast();
	const context = useContext(AppContext);

	return (
		<AlertDialog
			isOpen={isOpen}
			leastDestructiveRef={null as any}
			onClose={onClose}
		>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize="lg" fontWeight="bold">
						Удалить файл
					</AlertDialogHeader>

					<AlertDialogBody>
						Вы действительно хотите удалить файл {file?.name}? Это действие
						нельзя отменить!
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button onClick={onClose}>Отмена</Button>
						<Button
							colorScheme="red"
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									if (!isAdmin) {
										await explorer.deleteFile(
											file?.id || 0,
											context.props.auth?.token || ""
										);
									} else {
										await admin.deleteFile(
											file?.id || 0,
											context.props.auth?.token || ""
										);
									}
									onClose();
								} catch (error) {
									errorHandler(error, toast);
								} finally {
									setLoading.off();
								}
							}}
							ml={3}
						>
							Удалить
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	);
}
