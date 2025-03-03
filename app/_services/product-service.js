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
    updateDoc,
    getFirestore} from "firebase/firestore";
import { app, db, storage } from "../_utils/firebase";
import { deleteObject, ref } from "firebase/storage";


async function getOrAddCategory(userId, categoryName) {
    const categoriesCollection = collection(db, "users", userId, "productCategories");
    const q = query(categoriesCollection, where("name", "==", categoryName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newCategoryRef = await addDoc(categoriesCollection, { name: categoryName });
        return newCategoryRef.id;
    } else {
        return querySnapshot.docs[0].id;
    }
}

// Function to add a product and handle its relationships
export async function dbAddProduct(userId, productObj) {
  try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        const categoryIds = await Promise.all(
            productObj.categories.map(category => getOrAddCategory(userId, category))
        );
        const productsCollection = collection(userRef, "products");

        const newProductRef = await addDoc(productsCollection, {
            productId: productObj.productId,
            name: productObj.name,
            categories: categoryIds,
            currency: productObj.currency,
            averageCost: productObj.averageCost,
            description: productObj.description,
            productImages: Array.isArray(productObj.productImages) ? productObj.productImages : [], // Ensure array
            patternImages: Array.isArray(productObj.patternImages) ? productObj.patternImages : [], // Ensure array
        });

        console.log("Product added successfully with ID:", newProductRef.id);
        return newProductRef.id;
    } catch (error) {
        console.error("Error adding product:", error.message);
        throw error;
    }
}

export async function fetchProductById(userId, productId, productSetter) {
    if (!userId || !productId) return;

    try {
        const db = getFirestore(app);
        const productDocRef = doc(db, `users/${userId}/products/${productId}`);
        const productDoc = await getDoc(productDocRef);

        if (!productDoc.exists()) {
            console.warn(`Product with ID ${productId} not found.`);
            return;
        }

        let productData = { id: productDoc.id, ...productDoc.data() };

        // Ensure categories is an array
        const categoryNames = await Promise.all(
            (productData.categories ?? []).map(async (categoryId) => {
                const categoryDocRef = doc(db, `users/${userId}/productCategories/${categoryId}`);
                const categoryDoc = await getDoc(categoryDocRef);
                return categoryDoc.exists() ? categoryDoc.data().name : null;
            })
        );

        const productImages = productData.productImages || [];
        const patternImages = productData.patternImages || [];

        const finalProduct = {
            ...productData,
            categories: categoryNames,
            productImages: productImages,
            patternImages: patternImages,
        };

        productSetter(finalProduct);
    } catch (error) {
        console.error("Error fetching product:", error);
    }
}

export async function dbDeleteProductById(userId, productId) {
    try {     
        const productRef = doc(db, "users", userId, "products", productId);
        
        const productDoc = await getDoc(productRef);
        if (!productDoc.exists()) {
            throw new Error(`Product with ID ${productId} does not exist.`);
        }

        const productData = productDoc.data();

        // Delete images from Firebase Storage
        if (productData.productImages && Array.isArray(productData.productImages)) {
            const deleteProductImagePromises = productData.productImages.map(async (image) => {
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
            await Promise.all(deleteProductImagePromises);
        }
        if (productData.patternImages && Array.isArray(productData.patternImages)) {
          const deletePatternImagePromises = productData.patternImages.map(async (image) => {
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
          await Promise.all(deletePatternImagePromises);
      }


        await deleteDoc(productRef);
        console.log(`Product with ID ${productId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}

export const updateProduct = async (userId, productId, updatedProductData) => {
    try {
        const productRef = doc(db, "users", userId, "products", productId);

        await updateDoc(productRef, updatedProductData);
        console.log("Material document updated successfully!");

    } catch (error) {
        console.error("Error updating material:", error);
    }
};

export async function fetchProductIds(userId, productIdsSetter) {
    try {
        const productsRef = collection(db, "users", userId, "products"); 
        const querySnapshot = await getDocs(productsRef);

        const productIds = querySnapshot.docs.map(product => product.data().productId);
        
        productIdsSetter(productIds);
        return productIds;

    } catch (error) {
        console.error("Error while fetching all product IDs:", error.message);
    }
}

export async function fetchProductsForOrder(userId, productsSetter) {
    try {
        const productsRef = collection(db, "users", userId, "products"); 
        const querySnapshot = await getDocs(productsRef);

        const products = querySnapshot.docs.map(product => ({
            id: product.id,
            productId: product.data().productId, 
            name: product.data().name,
            productImages: product.data().productImages || [], 
            averageCost:product.data().averageCost,
            currency: product.data().currency,
        }));

        productsSetter(products);
        return products;

    } catch (error) {
        console.error("Error while fetching all products:", error.message);
    }
}

export async function fetchProductCategories(userId, categoriesSetter){
    try {
        const productCategoriesRef = collection(db, "users", userId, "productCategories"); 
        const querySnapshot = await getDocs(productCategoriesRef);

        const productCategories = querySnapshot.docs.map(categories => categories.data().name);

        categoriesSetter(productCategories);
        return productCategories;

    } catch (error) {
        console.error("Error while fetching all product categories:", error.message);
    }
}