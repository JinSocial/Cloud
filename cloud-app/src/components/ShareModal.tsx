import {
	Button,
	IconButton,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Stack,
	useBoolean,
	useToast,
} from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa6";
import explorer from "../api/explorer";
import { FileItem } from "../api/types/File";
import config from "../config";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";
import { sleep } from "../utils/utils";

export default function ShareFileModal({
	file,
	isOpen,
	onClose,
}: {
	file?: FileItem;
	isOpen: boolean;
	onClose: () => void;
}) {
	const toast = useToast();
	const context = useContext(AppContext);
	const [link, setLink] = useState<string>("Загрузка...");
	const [copied, setCopied] = useBoolean();

	useEffect(() => {
		const update = async () => {
			if (copied) {
				await sleep(2000);
				setCopied.off();
			}
		};
		update();
	}, [copied]);

	useEffect(() => {
		if (file && isOpen) {
			const getShareLink = async () => {
				setLink("Загрузка...");
				try {
					const data = await explorer.shareFile(
						file?.id || 0,
						context.props.auth?.token || ""
					);
					setLink(`${config.appUrl}/s/${data.hash}`);
				} catch (error) {
					errorHandler(error, toast);
				}
			};

			getShareLink();
		}
	}, [isOpen]);

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Ссылка на файл
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<Stack direction={"row"} spacing={1}>
						<Input isReadOnly value={link} />
						<IconButton
							aria-label="Скопировать"
							icon={copied ? <FaCheck /> : <FaCopy />}
							onClick={() => {
								if (!copied) {
									window.navigator.clipboard.writeText(link);
									setCopied.on();
								}
							}}
						/>
					</Stack>

					<Button
						w="full"
						onClick={async () => {
							try {
								await explorer.unshareFile(
									file?.id || 0,
									context.props.auth?.token || ""
								);
								onClose();
							} catch (error) {
								errorHandler(error, toast);
							}
						}}
						mt={2}
					>
						Закрыть доступ
					</Button>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
}
