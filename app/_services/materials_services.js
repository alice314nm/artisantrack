import { collection, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../_utils/firebase";


export async function dbDeleteMaterialById(userId, materialId) {
    try {
        const materialRef = doc(db, 'users', userId, 'materials', materialId);
        
        const documentSnapshot = await getDoc(materialRef);

        if (documentSnapshot.exists()) {
            await deleteDoc(materialRef);
            console.log("Material deleted successfully.");
        } else {
            console.log("The material does not exist in the database.");
        }
    } catch (error) {
        console.error("Error deleting material:", error);
    }
}

export async function dbEditMaterialById(userId, materialId, newMaterialData) {
  try {
      const materialRef = doc(db, 'users', userId, 'materials', materialId);
      
      const documentSnapshot = await getDoc(materialRef);

      if (documentSnapshot.exists()) {
          await updateDoc(materialRef, newMaterialData);
          console.log("Material updated successfully.", materialId);
      } else {
          console.log("The material does not exist in the database under user.", userId);
      }
  } catch (error) {
      console.error("Error updating material:", error);
  }
}
