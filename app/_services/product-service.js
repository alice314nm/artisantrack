import { 
    addDoc, 
    collection, 
    getDocs, 
    query, 
    where, 
    doc, 
    getDoc 
} from "firebase/firestore";
import { db } from "../_utils/firebase";

// Helper function to get or add categories
async function getOrAddCategory(userId, categoryNames) {
    const categoriesCollection = collection(db, "users", userId, "productCategories");
    const categoryIds = [];

    for (const categoryName of categoryNames) {
        const q = query(categoriesCollection, where("name", "==", categoryName));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const newCategoryRef = await addDoc(categoriesCollection, { name: categoryName });
            categoryIds.push(newCategoryRef.id);
        } else {
            categoryIds.push(querySnapshot.docs[0].id);
        }
    }

    return categoryIds;
}

// Function to add a product and handle its relationships
export async function dbAddProduct(userId, productObj) {
    try {
        // Ensure the user document exists
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        // Get category IDs
        const categoryIds = await getOrAddCategory(userId, productObj.category); 

        // Reference to the products collection
        const productsCollection = collection(userRef, "products");

        // Add product to Firestore
        const newProductRef = await addDoc(productsCollection, {
            productId: productObj.productId,
            name: productObj.name,
            category: categoryIds, // Now an array of category IDs
            averageCost: productObj.averageCost,
            description: productObj.description,
            images: productObj.images
        });

        console.log("Product added successfully with ID:", newProductRef.id);
        return newProductRef.id; // Return the product ID if needed
    } catch (error) {
        console.error("Error adding product:", error.message);
        throw error; // Rethrow error so calling function can handle it
    }
}



