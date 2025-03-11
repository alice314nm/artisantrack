import {
  doc,
  getDoc,
  getDocs,
  writeBatch,
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
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
        displayName: displayName || "", // Store the name
        tax: tax || null, // Store the tax
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
  if (!user || !user.uid) {
    console.error("Invalid user data");
    return;
  }

  const userRef = doc(db, "users", user.uid);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Function to safely get document count, returning 0 if the collection does not exist
        const getCollectionCount = async (queryFilter) => {
          try {
            const snapshot = await getCountFromServer(queryFilter);
            return snapshot.data().count || 0;
          } catch (error) {
            console.warn("Collection query failed:", error);
            return 0;
          }
        };

        // Get references to subcollections
        const productsRef = collection(userRef, "products");
        const materialsRef = collection(userRef, "materials");
        const ordersRef = collection(userRef, "orders");

        // Queries
        const productQuery = query(productsRef);
        const materialQuery = query(materialsRef);
        const totalOrdersQuery = query(ordersRef);
        const inProgressOrderQuery = query(
          ordersRef,
          where("completed", "==", false)
        );
        const completedOrderQuery = query(
          ordersRef,
          where("completed", "==", true)
        );

        // Fetch counts
        const [
          productCount,
          materialCount,
          orderCount,
          inProgressOrders,
          completedOrders,
        ] = await Promise.all([
          getCollectionCount(productQuery),
          getCollectionCount(materialQuery),
          getCollectionCount(totalOrdersQuery),
          getCollectionCount(inProgressOrderQuery),
          getCollectionCount(completedOrderQuery),
        ]);

        // Calculate monthly/yearly income and expenses
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        let yearlyIncome = 0;
        let yearlyExpenses = 0;

        const ordersSnapshot = await getDocs(ordersRef);
        const ordersData = ordersSnapshot.docs.map((doc) => doc.data());

        ordersData.forEach((order) => {
          if (order.startDate?.seconds) {
            const orderDate = new Date(order.startDate.seconds * 1000);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();

            // Monthly calculations
            if (orderMonth === currentMonth) {
              monthlyIncome +=
                (parseFloat(order.productCost) || 0) +
                (parseFloat(order.workCost) || 0);
              monthlyExpenses += parseFloat(order.materialsCost) || 0;
            }

            // Yearly calculations
            if (orderYear === currentYear) {
              yearlyIncome +=
                (parseFloat(order.productCost) || 0) +
                (parseFloat(order.workCost) || 0);
              yearlyExpenses += parseFloat(order.materialsCost) || 0;
            }
          }
        });

        // Combine all data into one object
        const userDataWithCounts = {
          ...userData,
          productCount,
          materialCount,
          orderCount, // Total orders (completed + in-progress)
          inProgressOrders, // Orders still in progress
          completedOrders, // Successfully completed orders
          monthlyIncome,
          monthlyExpenses,
          yearlyIncome,
          yearlyExpenses,
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
