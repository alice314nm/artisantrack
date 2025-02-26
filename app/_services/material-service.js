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

        // Get color ID
        const colorId = await getOrAddColor(userId, materialObj.color);

        // Get shop ID (if applicable)
        const shopId = (materialObj.costItems.length > 0)
            ? await getOrAddShop(userId, materialObj.costItems[0].shop)
            : null;

        // Reference to the materials collection
        const materialsCollection = collection(userRef, "materials");

        // Add material to Firestore
        const newMaterialRef = await addDoc(materialsCollection, {
            materialId: materialObj.materialId,
            name: materialObj.name,
            categories: categoryIds,
            color: colorId,
            total: materialObj.total,
            currency: materialObj.currency,
            quantity: materialObj.quantity,
            description: materialObj.description,
            images: materialObj.images 
        });

        // Add costItems as subcollection
        const costItemsCollection = collection(newMaterialRef, "costItems");
        for (const costItem of materialObj.costItems) {
            const costShopId = await getOrAddShop(userId, costItem.shop);
            await addDoc(costItemsCollection, {
                shopId: costShopId,
                shopName: costItem.shop,
                price: costItem.price,
            });
        }

        console.log("Material added successfully with ID:", newMaterialRef.id);
    } catch (error) {
        console.error("Error adding material:", error.message);
    }
}

export async function dbDeleteMaterialById(userId, materialId) {
    try {     
        const materialRef = doc(db, "users", userId, "materials", materialId);
        
        const materialDoc = await getDoc(materialRef);
        if (!materialDoc.exists()) {
            throw new Error(`Material with ID ${materialId} does not exist.`);
        }

        const materialData = materialDoc.data();

        // Delete images from Firebase Storage
        if (materialData.images && Array.isArray(materialData.images)) {
            const deleteImagePromises = materialData.images.map(async (image) => {
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

        const costItemsCollection = collection(materialRef, "costItems");
        const costItemsSnapshot = await getDocs(costItemsCollection);
        const deleteCostItemsPromises = costItemsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deleteCostItemsPromises);

        await deleteDoc(materialRef);
        console.log(`Material with ID ${materialId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting material:", error.message);
    }
}

export async function fetchMaterials(userId) {
    if (!userId) return [];

    const materialsCollection = collection(db, `users/${userId}/materials`);

    try {
        const materialsSnapshot = await getDocs(materialsCollection);
        const materialsData = materialsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const materialsWithDetails = await Promise.all(
            materialsData.map(async (material) => {
                // Fetch category names
                const categoryNames = await Promise.all(
                    material.categories.map(async (categoryId) => {
                        const categoryDocRef = doc(db, `users/${userId}/materialCategories/${categoryId}`);
                        const categoryDoc = await getDoc(categoryDocRef);
                        return categoryDoc.exists() ? categoryDoc.data().name : "No set categories";
                    })
                );

                // Fetch color names
                let colorNames = [];
                if (Array.isArray(material.color)) {
                    colorNames = await Promise.all(
                        material.color.map(async (colorId) => {
                            const colorDocRef = doc(db, `users/${userId}/colors/${colorId}`);
                            const colorDoc = await getDoc(colorDocRef);
                            return colorDoc.exists() ? colorDoc.data().name : "No set colors";
                        })
                    );
                } else if (material.color) {
                    const colorDocRef = doc(db, `users/${userId}/colors/${material.color}`);
                    const colorDoc = await getDoc(colorDocRef);
                    colorNames = colorDoc.exists() ? [colorDoc.data().name] : ["No set colors"];
                }

                // Extract images
                const imageUrls = material.images?.map((image) => ({
                    url: image.url,
                    path: image.path,
                })) || [];

                // Fetch pricing details
                const pricingCollection = collection(db, `users/${userId}/materials/${material.id}/costItems`);
                const pricingSnapshot = await getDocs(pricingCollection);

                const pricingDetails = pricingSnapshot.docs.map((pricingDoc) => ({
                    id: pricingDoc.id,
                    price: pricingDoc.data().price || 0,
                    shopId: pricingDoc.data().shopId || "",
                    shopName: pricingDoc.data().shopName || "",
                }));

                return {
                    ...material,
                    categories: categoryNames,
                    colors: colorNames,
                    images: imageUrls,
                    pricing: pricingDetails.length > 0 ? pricingDetails : [],
                };
            })
        );

        return materialsWithDetails;
    } catch (error) {
        console.error("Error fetching materials:", error);
        return [];
    }
}

export const updateMaterial = async (userId, materialId, updatedMaterialData) => {
    try {
        const materialRef = doc(db, "users", userId, "materials", materialId);

        const { costItems, ...materialDataWithoutCostItems } = updatedMaterialData;
        await updateDoc(materialRef, materialDataWithoutCostItems);
        console.log("Material document updated successfully!");

        if (costItems) {
            const costItemsCollectionRef = collection(materialRef, "costItems");

            // Get existing cost items
            const existingDocs = await getDocs(costItemsCollectionRef);

            // Delete all existing cost items
            const deletePromises = existingDocs.docs.map(docSnap => deleteDoc(docSnap.ref));
            await Promise.all(deletePromises);

            // Add new cost items
            const addPromises = costItems.map(async (costItem) => {
                const newDocRef = doc(costItemsCollectionRef);
                await addDoc(costItemsCollectionRef, {
                    shopId: await getOrAddShop(userId, costItem.shop),
                    shopName: costItem.shop,
                    price: costItem.price,
                });
            });

            await Promise.all(addPromises);
            console.log("CostItems subcollection updated successfully!");
        }

    } catch (error) {
        console.error("Error updating material:", error);
    }
};

export async function fetchMaterialsIds(userId, materialsIdsSetter){
    try{
        const materialsRef = collection(db, 'users', userId, 'materials')
        const querySnapshot = await getDocs(materialsRef);

        const materialIds = querySnapshot.docs.map(material => material.data().materialId);

        materialsIdsSetter(materialIds);
        return materialIds;
    } catch(error){
        console.error("Error while fetching materials ids: ", error.message)
    }
}

export async function fetchMaterialCategories(userId, materialCategoriesSetter){
    try{
        const materialCategoriesRef = collection(db, 'users', userId, 'materialCategories');
        const querySnapshot = await getDocs(materialCategoriesRef);

        const materialCategories = querySnapshot.docs.map(categories => categories.data().name);

        materialCategoriesSetter(materialCategories);
        return materialCategories;
    } catch(error){
        console.error("Error while fetching material categories: ", error.message)
    }
}
