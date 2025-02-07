import { doc, getDoc, writeBatch, collection, getCountFromServer, query } from "firebase/firestore";
import { db } from "../_utils/firebase";

export const initializeUserData = async (user, db, displayName, tax) => {
    if (!user || !user.uid) {
        console.error("Invalid user data");
        return;
    }

    const userRef = doc(db, "users", user.uid);

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

        // Function to safely get document count, returning 0 if the collection does not exist
        const getCollectionCount = async (collectionPath, queryFilter) => {
          try {
            const snapshot = await getCountFromServer(queryFilter);
            return snapshot.data().count || 0;
          } catch (error) {
            console.warn(`Collection ${collectionPath} not found or empty.`);
            return 0;
          }
        };

        // Get references to subcollections
        const productsRef = collection(userRef, "products");
        const materialsRef = collection(userRef, "materials");
        const ordersRef = collection(userRef, "orders");

        // Queries to filter out placeholder documents
        const productQuery = query(productsRef);
        const materialQuery = query(materialsRef);
        const orderQuery = query(ordersRef);

        // Fetch counts, ensuring missing collections return 0
        const [productCount, materialCount, orderCount] = await Promise.all([
          getCollectionCount("products", productQuery),
          getCollectionCount("materials", materialQuery),
          getCollectionCount("orders", orderQuery),
        ]);

        // Combine all data into one object
        const userDataWithCounts = {
          ...userData,
          productCount,
          materialCount,
          orderCount,
        };

        setUserData(userDataWithCounts); // Update the state with the data
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  fetchUserData(); // Call the function to fetch data
};
