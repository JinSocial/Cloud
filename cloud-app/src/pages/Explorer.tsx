import {
	Box,
	Button,
	Center,
	Checkbox,
	Heading,
	IconButton,
	Input,
	Menu,
	MenuButton,
	MenuDivider,
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
import {
	FaArrowRightArrowLeft,
	FaChevronLeft,
	FaDownload,
	FaEye,
	FaFile,
	FaFolder,
	FaFolderPlus,
	FaLink,
	FaLock,
	FaLockOpen,
	FaPencil,
	FaPlus,
	FaRegStar,
	FaShare,
	FaStar,
	FaTrash,
} from "react-icons/fa6";
import { IoPeople } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useFilePicker } from "use-file-picker";
import explorer from "../api/explorer";
import publicExplorer from "../api/publicExplorer";
import { PaginationMeta } from "../api/types/BasicResponse";
import { FileItem } from "../api/types/File";
import AddFolderModal from "../components/AddFolderModal";
import DeleteFileAlert from "../components/DeleteAlert";
import MoveFolderModal from "../components/MoveFolderModal";
import RenameFileModal from "../components/RenameFileModal";
import ShareFileModal from "../components/ShareModal";
import ViewFile from "../components/ViewFile";
import config from "../config";
import { AppContext } from "../providers/AppProvider";
import errorHandler from "../utils/errorHandler";
import { downloadFile } from "../utils/utils";

function Explorer() {
	const { openFilePicker } = useFilePicker({
		onFilesSuccessfullySelected: async ({ plainFiles }: any) => {
			const file = plainFiles[0];
			if (file) {
				setLoading.on();
				try {
					await explorer.uploadFile(
						{ file, folder_id: params.folder as number | undefined },
						context.props.auth?.token || ""
					);
					await getFiles(meta?.current_page || 1);
				} catch (error) {
					errorHandler(error, toast);
				} finally {
					setLoading.off();
				}
			}
		},
	});
	const [files, setFiles] = useState<FileItem[]>([]);
	const [meta, setMeta] = useState<PaginationMeta | null>();
	const [search, setSearch] = useState<string>("");
	const [contentSearch, setContentSearch] = useState<boolean>(true);
	const [folder, setFolder] = useState<FileItem | null>();
	const params = useParams();
	const context = useContext(AppContext);
	const [loading, setLoading] = useBoolean();
	const toast = useToast();
	const navigate = useNavigate();

	const deleteAlert = useDisclosure();
	const addFolderModal = useDisclosure();
	const renameModal = useDisclosure();
	const moveModal = useDisclosure();
	const shareModal = useDisclosure();
	const viewModal = useDisclosure();
	const [selectedFile, setSelectedFile] = useState<FileItem>();

	const getFiles = async (page: number, search?: string, contentSearch?: boolean) => {
		try {
			const data = await explorer.getFiles(
				{
					search,
					contentSearch,
					folder_id: params.folder as number | undefined,
					limit: 50,
					page,
					sort: "desc",
				},
				context.props.auth?.token || ""
			);
			setFiles(data.items.data);
			setMeta(data.items.meta);
			setFolder(data.folder);
		} catch (error) {
			errorHandler(error, toast);
		}
	};

	useEffect(() => {
		setMeta(null);
		setFiles([]);
		getFiles(1);
	}, [params]);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			getFiles(1, search, contentSearch);
		}, 500);

		return () => clearTimeout(delayDebounceFn);
	}, [search, contentSearch]);

	return !meta ? (
		<Center>
			<Spinner size={"xl"} color="#333"></Spinner>
		</Center>
	) : (
		<>
			<Stack direction={"row"} justifyContent={"space-between"} spacing={2}>
				<Stack direction={"row"} spacing={1}>
					{folder && (
						<IconButton
							onClick={() => {
								if (folder.folder_id) {
									navigate(`/explorer/folder/${folder.folder_id}`);
								} else {
									navigate(`/explorer`);
								}
							}}
							aria-label="назад"
							icon={<FaChevronLeft />}
						/>
					)}
					<Stack direction={"row"} spacing={4}>
						<Input
							placeholder="Поиск..."
							value={search}
							onChange={e => setSearch(e.currentTarget.value)}
						/>
						<Checkbox size='lg' defaultChecked onChange={e => setContentSearch(e.currentTarget.checked)}>
							По&nbsp;содержимому
						</Checkbox>
					</Stack>
				</Stack>

				<Stack direction={"row"} spacing={1}>
					<IconButton
						aria-label="Загрузить файл"
						icon={<FaPlus />}
						isDisabled={loading}
						onClick={openFilePicker}
					></IconButton>
					<IconButton
						aria-label="Новая папка"
						icon={<FaFolderPlus />}
						isDisabled={loading}
						onClick={addFolderModal.onOpen}
					></IconButton>
				</Stack>
			</Stack>

			{(files.length !== 0 && (
				<Stack mt={3} direction={"column"} spacing={2}>
					<Box
						cursor={"pointer"}
						transitionProperty={"var(--aithercol-transition-property-common)"}
						transitionDuration={"var(--aithercol-transition-duration-normal)"}
						_hover={{ backgroundColor: "#e6e6e6" }}
						onClick={() => {
							navigate("/explorer/favorite");
						}}
					>
						<Stack
							p={3}
							direction={"row"}
							spacing={2}
							justifyContent={"space-between"}
							alignItems={"center"}
						>
							<Stack alignItems={"center"} direction={"row"} spacing={2}>
								<FaStar size={"24px"} />

								<Heading textAlign={"left"} size={"sm"}>
									Избранное
								</Heading>
							</Stack>
						</Stack>
					</Box>
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

									<Stack alignItems={"center"} direction={"row"} spacing={2}>
										{e.is_public && <IoPeople size={"20px"} />}
										{e.public_hash && <FaLink size={"20px"} />}
										{e.is_favorite && <FaStar size={"20px"} />}
										<Text textAlign={"end"} opacity={"0.8"}>
											{moment(e.created_at).format("DD.MM.YYYY HH:mm")}
										</Text>
									</Stack>
								</Stack>
							</MenuButton>
							<MenuList>
								{!e.is_folder && (
									<>
										<MenuItem
											onClick={() => {
												setSelectedFile(e);
												shareModal.onOpen();
											}}
											icon={<FaShare />}
										>
											Поделиться
										</MenuItem>

										<MenuItem
											onClick={async () => {
												try {
													await publicExplorer.toggle(
														e.id,
														context.props.auth?.token || ""
													);

													toast({
														status: "success",
														title: "Успешно",
														description: e.is_public
															? "Файл теперь приватный"
															: "Файл теперь публичный",
														duration: 3000,
														isClosable: true,
													});

													getFiles(1, search);
												} catch (error) {
													errorHandler(error, toast);
												}
											}}
											icon={e.is_public ? <FaLock /> : <FaLockOpen />}
										>
											{e.is_public ? "Сделать приватным" : "Сделать публичным"}
										</MenuItem>

										<MenuItem
											onClick={async () => {
												try {
													await explorer.favorite.toggle(
														e.id,
														context.props.auth?.token || ""
													);

													toast({
														status: "success",
														title: "Успешно",
														description: e.is_favorite
															? "Файл убран из избранного"
															: "Файл теперь в избранном",
														duration: 3000,
														isClosable: true,
													});

													await getFiles(1, search);
												} catch (error) {
													errorHandler(error, toast);
												}
											}}
											icon={e.is_favorite ? <FaRegStar /> : <FaStar />}
										>
											{e.is_favorite ? "Убрать из избранного" : "В избранное"}
										</MenuItem>

										<MenuDivider />
									</>
								)}
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
								<MenuDivider />
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
								<MenuItem
									onClick={() => {
										setSelectedFile(e);
										renameModal.onOpen();
									}}
									icon={<FaPencil />}
								>
									Переименовать
								</MenuItem>
								<MenuItem
									onClick={() => {
										setSelectedFile(e);
										moveModal.onOpen();
									}}
									icon={<FaArrowRightArrowLeft />}
								>
									Переместить
								</MenuItem>
								<MenuDivider />
								<MenuItem
									onClick={() => {
										setSelectedFile(e);
										deleteAlert.onOpen();
									}}
									icon={<FaTrash />}
								>
									Удалить
								</MenuItem>
							</MenuList>
						</Menu>
					))}

					{meta?.current_page !== meta?.last_page && (
						<Button
							isDisabled={loading}
							onClick={async () => {
								try {
									setLoading.on();
									const data = await explorer.getFiles(
										{
											search,
											folder_id: params.folder as number | undefined,
											limit: 50,
											page: meta.current_page + 1,
											sort: "desc",
										},
										context.props.auth?.token || ""
									);
									setFiles([...files, ...data.items.data]);
									setMeta(data.items.meta);
									setFolder(data.folder);
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

			<DeleteFileAlert
				isOpen={deleteAlert.isOpen}
				onClose={() => {
					getFiles(meta.current_page, search);
					deleteAlert.onClose();
				}}
				file={selectedFile}
			/>
			<AddFolderModal
				isOpen={addFolderModal.isOpen}
				onClose={() => {
					getFiles(meta.current_page, search);
					addFolderModal.onClose();
				}}
				folder_id={params.folder as any}
			/>
			<RenameFileModal
				isOpen={renameModal.isOpen}
				onClose={() => {
					getFiles(meta.current_page, search);
					renameModal.onClose();
				}}
				file={selectedFile}
			/>

			<MoveFolderModal
				isOpen={moveModal.isOpen}
				onClose={() => {
					getFiles(meta.current_page, search);
					moveModal.onClose();
				}}
				file={selectedFile}
			/>

			<ShareFileModal
				isOpen={shareModal.isOpen}
				onClose={() => {
					getFiles(meta.current_page, search);
					shareModal.onClose();
				}}
				file={selectedFile}
			/>
			<ViewFile
				file={selectedFile}
				isOpen={viewModal.isOpen}
				onClose={viewModal.onClose}
			/>
		</>
	);
}

export default Explorer;
