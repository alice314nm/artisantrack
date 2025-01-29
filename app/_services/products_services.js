import { collection, getDoc, updateDoc } from "firebase/firestore";

export async function dbDeleteProductById(userId, productId){
    try {
        const productRef = collection(db, 'users', userId, 'products', productId)
        const documentSnapshot = await getDoc(productRef);
        
        if (documentSnapshot.exists()) {
            await deleteDoc(productRef);
          } else {
            console.log("The product in the database fdoes not exist under user");
          }

    } catch (error) {
        console.error("Error fetching random lesson:", error);
    }
}

export async function dbEditProductById(userId, productId, newProductData) {
  try {
      const productRef = doc(db, 'users', userId, 'products', productId);
      
      const documentSnapshot = await getDoc(productRef);

      if (documentSnapshot.exists()) {
          await updateDoc(productRef, newProductData);
          console.log("Product updated successfully.", productId);
      } else {
          console.log("The product does not exist in the database under user.", userId);
      }
  } catch (error) {
      console.error("Error updating product:", error);
  }
}
