import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadImage(file: Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  try {
    await uploadBytes(storageRef, file);
  } catch (e) {
    const message = (e as Error)?.message ?? "erro desconhecido";
    throw new Error(`Falha ao enviar imagem: ${message}`);
  }
  return getDownloadURL(storageRef);
}
