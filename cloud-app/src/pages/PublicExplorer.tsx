import {
	Button,
	Center,
	Heading,
	Input,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Spinner,
	Stack,
	Text,
	useBoolean,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { FaDownload, FaEye, FaFile, FaFolder } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import publicExplorer from "../api/publicExplorer";
import { PaginationMeta } from "../api/types/BasicResponse";
import { FileItem } from "../api/types/File";
import ViewFile from "../components/ViewFile";
import config from "../config";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";
import { downloadFile } from "../utils/utils";

function PublicExlorer() {
	const [files, setFiles] = useState<FileItem[]>([]);
	const [meta, setMeta] = useState<PaginationMeta | null>();
	const [search, setSearch] = useState<string>("");

	const context = useContext(AppContext);
	const [loading, setLoading] = useBoolean();
	const toast = useToast();
	const navigate = useNavigate();

	const viewModal = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<FileItem>();

	const getFiles = async (page: number, search?: string) => {
		try {
			const data = await publicExplorer.getFiles(
				{
					search,
					limit: 50,
					page,
					sort: "desc",
				},
				context.props.auth?.token || ""
			);
			setFiles(data.items.data);
			setMeta(data.items.meta);
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			getFiles(1, search);
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [search]);

	return !meta ? (
		<Center>
			<Spinner size={"xl"} color="#333"></Spinner>
		</Center>
	) : (
		<>
			<Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
				<Stack direction={"row"} spacing={1}>
					<Input
						placeholder="Поиск..."
						value={search}
						onChange={e => setSearch(e.currentTarget.value)}
					/>
				</Stack>
			</Stack>

			{(files.length !== 0 && (
				<Stack
					mt={3}
					direction={"column"}
					spacing={2}
					gap={3}
					flexWrap={"wrap"}
				>
					{files.map(e => (
						<Menu>
							<MenuButton _hover={{ backgroundColor: "#e6e6e6" }}>
								<Stack
									p={3}
									direction={"row"}
									spacing={2}
									justifyContent={"space-between"}
									alignItems={"center"}
								>
									<Stack alignItems={"center"} direction={"row"} spacing={2}>
										{e.is_folder ? (
											<FaFolder size={"24px"} />
										) : (
											<FaFile size={"24px"} />
										)}
										<Heading textAlign={"left"} size={"sm"}>
											{e.name}
										</Heading>
									</Stack>

									<Stack direction={"row"} spacing={2}>
										<Text textAlign={"end"} opacity={"0.8"}>
											{moment(e.created_at).format("DD.MM.YYYY HH:mm")}
										</Text>
									</Stack>
								</Stack>
							</MenuButton>
							<MenuList>
								<MenuItem
									icon={<FaEye />}
									onClick={() => {
										if (e.is_folder) {
											navigate(`/explorer/folder/${e.id}`);
										} else {
											setSelectedFile(e);
											viewModal.onOpen();
										}
									}}
								>
									Открыть
								</MenuItem>

								{!e.is_folder && e.file && (
									<MenuItem
										onClick={async () => {
											await downloadFile(e.name, config.apiUrl + e.file);
										}}
										icon={<FaDownload />}
									>
										Скачать
									</MenuItem>
								)}
							</MenuList>
						</Menu>
					))}

					{meta?.current_page !== meta?.last_page && (
						<Button
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await publicExplorer.getFiles(
										{
											search,
											limit: 50,
											page: meta.current_page + 1,
											sort: "desc",
										},
										context.props.auth?.token || ""
									);
									setFiles([...files, ...data.items.data]);
									setMeta(data.items.meta);
								} catch (error) {
									errorHandler(error, toast);
								} finally {
									setLoading.off();
								}
							}}
						>
							Показать еще
						</Button>
					)}

					<Center>
						<Text>Найдено файлов: {meta.total}</Text>
					</Center>
				</Stack>
			)) || (
				<Center mt={3}>
					<Text textAlign={"center"} opacity={"0.5"}>
						Файлы не найдены
					</Text>
				</Center>
			)}

			<ViewFile
				file={selectedFile}
				isOpen={viewModal.isOpen}
				onClose={viewModal.onClose}
			/>
		</>
	);
}

export default PublicExlorer;
