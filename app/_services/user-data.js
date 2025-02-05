import { doc, getDoc, writeBatch, collection, getCountFromServer } from "firebase/firestore";
import { db } from "../_utils/firebase";

export const initializeUserData = async (user, db, displayName, tax) => {
    if (!user || !user.uid) {
        console.error("Invalid user data");
        return;
    }

    const userRef = doc(db, "users", user.uid);

    // Subcollections
    const subcollections = [
        "products",
        "materials",
        "orders",
        "clients",
        "productCategories",
        "materialCategories",
        "shops",
        "documents",
        "colors"
    ];

    const batch = writeBatch(db);

    try {
        // Check if the user already exists
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            batch.set(userRef, {
                email: user.email,
                displayName: displayName || "",  // Store the name
                tax: tax || null,   // Store the tax
                createdAt: new Date().toISOString(),
            });

            // Initialize empty subcollections
            subcollections.forEach((sub) => {
                const subRef = doc(collection(userRef, sub)); // Creates empty refs
                batch.set(subRef, {"isEmpty": true}); 
            });

            await batch.commit();
            console.log("User data initialized successfully.");
        } else {
            console.log("User data already exists.");
        }
    } catch (error) {
        console.error("Error initializing user data:", error.message);
    }
};

export const getUserData = async (user, setUserData) => {
    const userRef = doc(db, "users", user.uid);
  
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
  
          // Get counts for products, materials, and orders
          const productsRef = collection(userRef, "products");
          const materialsRef = collection(userRef, "materials");
          const ordersRef = collection(userRef, "orders");
  
          // Get the count of documents in each subcollection
          const productCount = await getCountFromServer(productsRef);
          const materialCount = await getCountFromServer(materialsRef);
          const orderCount = await getCountFromServer(ordersRef);
  
          // Combine all data into one object
          const userDataWithCounts = {
            ...userData,
            productCount: productCount.data().count,
            materialCount: materialCount.data().count,
            orderCount: orderCount.data().count,
          };
  
          setUserData(userDataWithCounts);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };
  
    fetchUserData();
  };