import {
	Container,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
} from "@chakra-ui/react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { FileItem } from "../api/types/File";
import config from "../config";

function ViewFile({
	file,
	isOpen,
	onClose,
}: {
	file?: FileItem;
	isOpen: boolean;
	onClose: () => void;
}) {
	return file ? (
		<Modal size={"3xl"} isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader fontSize="lg" fontWeight="bold">
					Просмотр файла
				</ModalHeader>

				<ModalCloseButton />

				<ModalBody mb={3}>
					<Container>
						<DocViewer
							documents={[{ uri: config.apiUrl + `${file.file}` }]}
							pluginRenderers={DocViewerRenderers}
							config={{
								header: { disableFileName: true, disableHeader: true },
							}}
							theme={{
								primary: "#fff",
								secondary: "#333",
								tertiary: "#fff",
								text_primary: "#333",
								text_secondary: "#555",
								text_tertiary: "#fff",
								disableThemeScrollbar: false,
							}}
						/>
					</Container>
				</ModalBody>
			</ModalContent>
		</Modal>
	) : null;
}

export default ViewFile;
