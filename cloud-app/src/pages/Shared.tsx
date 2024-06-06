import {
	Button,
	Center,
	Container,
	Heading,
	Spinner,
	Stack,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaDownload, FaEye, FaFile } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import explorer from "../api/explorer";
import { FileItem } from "../api/types/File";
import ViewFile from "../components/ViewFile";
import config from "../config";
import errorHandler from "../utils/errorHandler";
import { downloadFile } from "../utils/utils";

function Shared() {
	const params = useParams();
	const toast = useToast();
	const navigate = useNavigate();
	const [file, setFile] = useState<FileItem>();

	const viewModal = useDisclosure();

	useEffect(() => {
		const getFile = async () => {
			try {
				const data = await explorer.getSharedFile(params.hash || "");
				setFile(data.item);
			} catch (error) {
				errorHandler(error, toast);
				navigate("/404");
			}
		};

		getFile();
	}, []);

	return !file ? (
		<Center minH={"100vh"}>
			<Spinner size={"xl"} color="black" />
		</Center>
	) : (
		<Center minH="100vh">
			<Container p={"24px"} alignItems={"center"} textAlign={"center"}>
				<Stack alignItems={"center"} direction={"column"} spacing={6}>
					<Heading size={"md"}>{file.name}</Heading>
					<FaFile size={"64px"} />
					<Stack direction={"row"} spacing={2}>
						<Button onClick={viewModal.onOpen} leftIcon={<FaEye />}>
							Открыть
						</Button>
						<Button
							isDisabled={!file.file}
							leftIcon={<FaDownload />}
							onClick={async () => {
								await downloadFile(file.name, config.apiUrl + file.file);
							}}
						>
							Скачать
						</Button>
					</Stack>
				</Stack>
			</Container>

			<ViewFile
				file={file}
				isOpen={viewModal.isOpen}
				onClose={viewModal.onClose}
			/>
		</Center>
	);
}

export default Shared;
