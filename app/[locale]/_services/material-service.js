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
    updateDoc
} from "firebase/firestore";
import { db, storage } from "@/app/[locale]/_utils/firebase";
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

    if (!colorName.trim()) {
        return null;
    }

    if (querySnapshot.empty) {
        const newColorRef = await addDoc(colorsCollection, { name: colorName });
        return newColorRef.id;
    } else {
        return querySnapshot.docs[0].id;
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
        const shopId = await getOrAddShop(userId, materialObj.shop)

        // Reference to the materials collection
        const materialsCollection = collection(userRef, "materials");

        // Add material to Firestore
        const newMaterialRef = await addDoc(materialsCollection, {
            materialId: materialObj.materialId,
            name: materialObj.name,
            description: materialObj.description,
            color: materialObj.color,
            categories: materialObj.categories,
            images: materialObj.images,
            shop: materialObj.shop,
            quantity: materialObj.quantity,
            total: materialObj.total,
            currency: materialObj.currency,
            costPerUnit: materialObj.costPerUnit,
        });

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

        await deleteDoc(materialRef);
        console.log(`Material with ID ${materialId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting material:", error.message);
    }
}

export async function fetchMaterialById(userId, materialId, materialSetter) {
    if (!userId) return [];

    try {
        const materialRef = doc(db, "users", userId, "materials", materialId);

        const materialsSnapshot = await getDoc(materialRef);

        if (!materialsSnapshot.exists()) {
            console.warn(`Material with ID ${materialId} not found.`);
            return;
        }
        const materialData = {
            id: materialsSnapshot.id,
            ...materialsSnapshot.data(),
        };

        materialSetter(materialData)
        return materialData;
    } catch (error) {
        console.error("Error fetching materials:", error);
        return [];
    }
}

export async function updateMaterial(userId, materialId, updatedMaterialData) {
    try {
        const materialRef = doc(db, "users", userId, "materials", materialId);

        const categoryIds = await Promise.all(
            updatedMaterialData.categories.map(category => getOrAddCategory(userId, category))
        );
        const shopId = await getOrAddShop(userId, updatedMaterialData.shop)
        const colorId = await getOrAddColor(userId, updatedMaterialData.color);

        await updateDoc(materialRef, updatedMaterialData);
        console.log("Material document updated successfully!");
    } catch (error) {
        console.error("Error updating material:", error);
    }
};

export async function fetchMaterialsIds(userId, materialsIdsSetter) {
    try {
        const materialsRef = collection(db, 'users', userId, 'materials')
        const querySnapshot = await getDocs(materialsRef);

        const materialIds = querySnapshot.docs.map(material => material.data().materialId);

        materialsIdsSetter(materialIds);
        return materialIds;
    } catch (error) {
        console.error("Error while fetching materials ids: ", error.message)
    }
}

export async function fetchMaterialCategories(userId, materialCategoriesSetter) {
    try {
        const materialCategoriesRef = collection(db, 'users', userId, 'materialCategories');
        const querySnapshot = await getDocs(materialCategoriesRef);

        const materialCategories = querySnapshot.docs.map(categories => categories.data().name);

        materialCategoriesSetter(materialCategories);
        return materialCategories;
    } catch (error) {
        console.error("Error while fetching material categories: ", error.message)
    }
}

export async function fetchMaterialsForOrder(userId, materialsSetter) {
    try {
        const materialsRef = collection(db, "users", userId, "materials");
        const querySnapshot = await getDocs(materialsRef);

        const materials = querySnapshot.docs.map(material => ({
            id: material.id,
            materialId: material.data().materialId,
            name: material.data().name,
            quantity: material.data().quantity,
            images: material.data().images || [],
            total: material.data().total,
            currency: material.data().currency,
            costPerUnit: material.data().costPerUnit,
        }));

        materialsSetter(materials);
        return materials;

    } catch (error) {
        console.error("Error while fetching all materials:", error.message);
    }
}

export async function updateMaterialQuantity(userId, materialId, updatedMaterialData) {
    try {
        const materialRef = doc(db, "users", userId, "materials", materialId);
        await updateDoc(materialRef, updatedMaterialData);

    } catch (error) {
        console.error("Error while updating the quantity of the product:", error)
    }
}