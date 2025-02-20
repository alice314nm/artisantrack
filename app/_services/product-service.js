import { 
    addDoc, 
    collection, 
    doc, 
    getDocs, 
    query, 
    where, 
    setDoc, 
    getDoc, 
    deleteDoc, 
    updateDoc} from "firebase/firestore";
import { db, storage } from "../_utils/firebase";
import { deleteObject, ref } from "firebase/storage";


export async function dbDeleteProductById(userId, productId) {
    try {     
        const productRef = doc(db, "users", userId, "materials", productId);
        
        const productDoc = await getDoc(productId);
        if (!productDoc.exists()) {
            throw new Error(`Product with ID ${productId} does not exist.`);
        }

        const productData = productDoc.data();

        // Delete images from Firebase Storage
        if (productDoc.images && Array.isArray(productDoc.images)) {
            const deleteImagePromises = productDoc.images.map(async (image) => {
                if (image.path) {
                    const imageRef = ref(storage, image.path);
                    try {
                        await deleteObject(imageRef);
                        console.log(`Deleted image: ${image.path}`);
                    } catch (storageError) {
                        console.warn(`Failed to delete image: ${image.path}`, storageError);
                    }
                }
            });
            await Promise.all(deleteImagePromises);
        }


        await deleteDoc(productRef);
        console.log(`Product with ID ${productId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}

