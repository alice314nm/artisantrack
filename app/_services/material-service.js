import { addDoc, collection, doc, getDocs, query, where, setDoc, getDoc } from "firebase/firestore";
import { db } from "../_utils/firebase";

// Helper function to get or add a category
async function getOrAddCategory(userId, categoryName) {
    const categoriesCollection = collection(db, "users", userId, "materialCategories");
    const q = query(categoriesCollection, where("name", "==", categoryName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newCategoryRef = await addDoc(categoriesCollection, { name: categoryName });
        return newCategoryRef.id;
    } else {
        return querySnapshot.docs[0].id;
    }
}


// Helper function to get or add a shop
async function getOrAddShop(userId, shopName) {
    const shopsCollection = collection(db, "users", userId, "shops");
    const q = query(shopsCollection, where("name", "==", shopName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newShopRef = await addDoc(shopsCollection, { name: shopName });
        return newShopRef.id;
    } else {
        return querySnapshot.docs[0].id;
    }
}

// Helper function to get or add a color and return the color document ID
async function getOrAddColor(userId, colorName) {
    const colorsCollection = collection(db, "users", userId, "colors");
    const q = query(colorsCollection, where("name", "==", colorName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Color doesn't exist, so add a new document
        const newColorRef = await addDoc(colorsCollection, { name: colorName });
        return newColorRef.id;  // Return the new color document ID
    } else {
        return querySnapshot.docs[0].id;  // Color exists, return the existing color document ID
    }
}

// Function to add a material and handle its relationships
export async function dbAddMaterial(userId, materialObj) {
    try {
        // Ensure the user document exists
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        // Get category IDs
        const categoryIds = await Promise.all(
            materialObj.categories.map(category => getOrAddCategory(userId, category))
        );

        // Get or create the color and retrieve its ID
        const colorId = await getOrAddColor(userId, materialObj.color);  // Use color name to get or add the color

        // Get shop ID for the first costItem shop
        const shopId = (Array.isArray(materialObj.costItems) && materialObj.costItems.length > 0)
            ? await getOrAddShop(userId, materialObj.costItems[0].shop)
            : null;

        // Reference to the materials collection
        const materialsCollection = collection(userRef, "materials");

        // Add material to Firestore
        const newMaterialRef = await addDoc(materialsCollection, {
            name: materialObj.name,
            categories: categoryIds,
            color: colorId,  // Save the color ID, not the name
            total: materialObj.total,
            description: materialObj.description,
            // images: materialObj.images,
        });

        // Add costItems as a subcollection under the material
        const costItemsCollection = collection(newMaterialRef, "costItems");
        for (const costItem of materialObj.costItems) {
            const costShopId = await getOrAddShop(userId, costItem.shop); // Ensure the shop exists
            await addDoc(costItemsCollection, {
                shopId: costShopId,
                shopName: costItem.shop,
                price: costItem.price,
                currency: costItem.currency,
                quantity: costItem.quantity
            });
        }

        console.log("Material added successfully with ID:", newMaterialRef.id);
    } catch (error) {
        console.error("Error adding material:", error.message);
    }
}
