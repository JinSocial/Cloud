import reader from "any-text";

export async function getFileContent(path: string, fileName: string): string | null {
    const filePath = path + '/' + fileName;
    try {
        const text = await reader.getText(filePath);
        return text;
    } catch (err) {
        return null;
    }
}