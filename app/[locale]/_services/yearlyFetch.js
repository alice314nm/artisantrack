import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { app } from "../_utils/firebase";

// Fetch Orders for the year
export const fetchOrders = async (user, currentYear) => {
  const db = getFirestore(app);
  const ordersCollection = collection(db, `users/${user.uid}/orders`);
  const ordersSnapshot = await getDocs(ordersCollection);
  const ordersData = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
  const endOfYear = new Date(currentYear + 1, 0, 0); // December 31st of current year

  const filteredOrders = ordersData.filter((order) => {
    if (order.startDate?.seconds) {
      const orderDate = new Date(order.deadline.seconds * 1000);
      return orderDate >= startOfYear && orderDate <= endOfYear;
    }
    return false;
  });

  const productIds = filteredOrders.flatMap((order) => order.orderImages || []);
  const productImagesMap = {};

  if (productIds.length > 0) {
    const productPromises = productIds.map(async (productId) => {
      const productRef = doc(db, `users/${user.uid}/products/${productId}`);
      const productSnapshot = await getDoc(productRef);
      if (productSnapshot.exists()) {
        productImagesMap[productId] =
          productSnapshot.data()?.productImages?.[0]?.url || "Unknown";
      }
    });

    await Promise.all(productPromises);
  }

  // Now, set imageUrl for each order
  filteredOrders.forEach((order) => {
    order.imageUrl = productImagesMap[order.productId] || "Unknown";
  });

  return filteredOrders;
};

// Fetch Products for the year
export const fetchProducts = async (user, currentYear) => {
  const db = getFirestore(app);
  const ordersCollection = collection(db, `users/${user.uid}/orders`);
  const ordersSnapshot = await getDocs(ordersCollection);
  const ordersData = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
  const endOfYear = new Date(currentYear + 1, 0, 0); // December 31st of current year

  const filteredOrders = ordersData.filter((order) => {
    if (order.startDate?.seconds) {
      const orderDate = new Date(order.startDate.seconds * 1000);
      return orderDate >= startOfYear && orderDate <= endOfYear;
    }
    return false;
  });

  const productIds = [
    ...new Set(filteredOrders.map((order) => order.productId).filter(Boolean)),
  ];

  if (productIds.length === 0) {
    return [];
  }

  const productPromises = productIds.map(async (productId) => {
    const productRef = doc(db, `users/${user.uid}/products/${productId}`);
    const productSnapshot = await getDoc(productRef);
    if (productSnapshot.exists()) {
      return {
        id: productId,
        ...productSnapshot.data(),
      };
    }
    return null;
  });

  let fetchedProducts = (await Promise.all(productPromises)).filter(Boolean);

  const categoryIds = [
    ...new Set(fetchedProducts.flatMap((product) => product.categories || [])),
  ];

  const categoryPromises = categoryIds.map(async (categoryId) => {
    const categoryRef = doc(
      db,
      `users/${user.uid}/productCategories/${categoryId}`
    );
    const categorySnapshot = await getDoc(categoryRef);
    if (categorySnapshot.exists()) {
      return { id: categoryId, name: categorySnapshot.data().name };
    }
    return null;
  });

  const fetchedCategories = (await Promise.all(categoryPromises)).filter(
    Boolean
  );
  const categoryMap = Object.fromEntries(
    fetchedCategories.map((cat) => [cat.id, cat.name])
  );

  fetchedProducts = fetchedProducts.map((product) => ({
    ...product,
    categories: product.categories
      ? product.categories.map((catId) => categoryMap[catId] || "Unknown")
      : [],
  }));

  return fetchedProducts;
};

// Fetch Materials for the year
export const fetchMaterials = async (user, currentYear) => {
  const db = getFirestore(app);
  const ordersCollection = collection(db, `users/${user.uid}/orders`);
  const ordersSnapshot = await getDocs(ordersCollection);
  const ordersData = ordersSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const startOfYear = new Date(currentYear, 0, 1); // January 1st of current year
  const endOfYear = new Date(currentYear + 1, 0, 0); // December 31st of current year

  const filteredOrders = ordersData.filter((order) => {
    if (order.startDate?.seconds) {
      const orderDate = new Date(order.startDate.seconds * 1000);
      return orderDate >= startOfYear && orderDate <= endOfYear;
    }
    return false;
  });

  const materialIds = [
    ...new Set(filteredOrders.flatMap((order) => order.materialIds || [])),
  ];

  if (materialIds.length === 0) {
    return [];
  }

  const materialPromises = materialIds.map(async (materialId) => {
    const materialRef = doc(db, `users/${user.uid}/materials/${materialId}`);
    const materialSnapshot = await getDoc(materialRef);
    if (materialSnapshot.exists()) {
      return {
        id: materialId,
        ...materialSnapshot.data(),
      };
    }
    return null;
  });

  let fetchedMaterials = (await Promise.all(materialPromises)).filter(Boolean);

  const categoryIds = [
    ...new Set(
      fetchedMaterials.flatMap((material) => material.categories || [])
    ),
  ];

  const categoryPromises = categoryIds.map(async (categoryId) => {
    const categoryRef = doc(
      db,
      `users/${user.uid}/materialCategories/${categoryId}`
    );
    const categorySnapshot = await getDoc(categoryRef);
    if (categorySnapshot.exists()) {
      return { id: categoryId, name: categorySnapshot.data().name };
    }
    return null;
  });

  const fetchedCategories = (await Promise.all(categoryPromises)).filter(
    Boolean
  );
  const categoryMap = Object.fromEntries(
    fetchedCategories.map((cat) => [cat.id, cat.name])
  );

  fetchedMaterials = fetchedMaterials.map((material) => ({
    ...material,
    categories: material.categories
      ? material.categories.map((catId) => categoryMap[catId] || "Unknown")
      : [],
  }));

  return fetchedMaterials;
};
