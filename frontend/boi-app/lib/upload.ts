import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(uri: string, path: string): Promise<string> {
  // Turn the local file into binary data
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error('Não foi possível ler a imagem selecionada.');
  }
  const blob = await response.blob();

  // Create storage reference with the file path
  const storageRef = ref(storage, path);

  // Upload the data to Firebase Storage
  try {
    await uploadBytes(storageRef, blob);
  } catch (e: any) {
    throw new Error(`Falha ao enviar imagem: ${e.message}`);
  }

  // Return the public download URL
  return getDownloadURL(storageRef);
}
