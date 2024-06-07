import reader from "any-text";

export async function getFileContent(path: string, fileName: string): string {
    const filePath = path + '/' + fileName;
    const text = await reader.getText(filePath);
    return text;
}