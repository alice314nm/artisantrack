import { collection, getDoc } from "firebase/firestore";

export async function dbDeleteProductById(userId, productId, productSetter){
    try {
        const productIdLesson = collection(db, 'users', userId, 'products', productId)
        const documentSnapshot = await getDoc(productIdLesson);
        
        if (documentSnapshot.exists()) {
            const productData = documentSnapshot.data();
            return productSetter(productData);
          } else {
            console.log("The product in the database fdoes not exist under user");
          }

    } catch (error) {
        console.error("Error fetching random lesson:", error);
    }
}

