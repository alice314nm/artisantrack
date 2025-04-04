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
import { db } from "../_utils/firebase";

async function getOrAddCustomer(userId, customerName) {
    const customerCollection = collection(db, "users", userId, "customers");
    const q = query(customerCollection, where("name", "==", customerName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        const newCustomerRef = await addDoc(customerCollection, { name: customerName });
        return newCustomerRef.id;
    } else {
        return querySnapshot.docs[0].id;
    }
}

export async function dbAddOrder(userId, orderObj) {
    try {
        console.log("Attempting to add order for user:", userId);
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        const ordersCollection = collection(db, `users/${userId}/orders`);

        const customerId = await getOrAddCustomer(userId, orderObj.customerName);

        const newOrderRef = await addDoc(ordersCollection, {
            nameOrder: orderObj.nameOrder, 
            startDate: orderObj.startDate,
            deadline: orderObj.deadline,
            daysUntilDeadline: orderObj.daysUntilDeadline,
            customerName: orderObj.customerName,
            description: orderObj.description,
            productId: orderObj.productId,
            materialIds: orderObj.materialIds, 
            quantities: orderObj.quantities,
            materialsCost: orderObj.materialsCost, 
            productCost: orderObj.productCost,
            workCost: orderObj.workCost,
            totalCost: orderObj.totalCost,
            completed: orderObj.completed, 
            paid: orderObj.paid, 
            currency: orderObj.currency,
            orderImages: orderObj.orderImages,
        });
        
        console.log("Order created successfully with ID:", newOrderRef.id);
        return newOrderRef.id;
    } catch (error) {
        console.error("Error creating order:", error.message);
        throw error;
    }
}


export async function dbDeleteOrderById(userId, orderId) {
    try {     
        const productRef = doc(db, "users", userId, "orders", orderId);
        
        const productDoc = await getDoc(productRef);
        if (!productDoc.exists()) {
            throw new Error(`Order with ID ${orderId} does not exist.`);
        }

        await deleteDoc(productRef);
        console.log(`Order with ID ${orderId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}


export async function dbGetOrderById(userId, orderId, orderSetter) {
    if (!userId || !orderId) {
        console.warn("Invalid userId or orderId provided.");
        return null;
    }

    try {
        const orderRef = doc(db, "users", userId, "orders", orderId);
        const orderSnapshot = await getDoc(orderRef);

        if (!orderSnapshot.exists()) {
            console.warn(`Order with ID ${orderId} not found.`);
            return null;
        }

        const orderData = {
            id: orderSnapshot.id,
            ...orderSnapshot.data(),
        };

        console.log("Fetched order:", orderData);

        // Fetch related product
        let productForOrderData = {};
        if (orderData.productId) {
            const productRef = doc(db, "users", userId, "products", orderData.productId);
            const productSnapshot = await getDoc(productRef);

            if (productSnapshot.exists()) {
                productForOrderData = {
                    id: productSnapshot.id,
                    productImages:productSnapshot.data().productImages || [],
                    patternImages: productSnapshot.data().patternImages || [],
                    productName: productSnapshot.data().name,
                    productId: productSnapshot.data().productId,
                };
            }
        }

        // Fetch related materials
        let materialsForOrderData = [];
        if (Array.isArray(orderData.materialIds) && orderData.materialIds.length > 0) {
            const materialsRef = collection(db, "users", userId, "materials");
            const materialsSnapshot = await getDocs(materialsRef);

            materialsForOrderData = materialsSnapshot.docs
                .filter(material => orderData.materialIds.includes(material.id))
                .map(material => ({
                    id: material.id,
                    materialImage: material.data().images[0] || [],
                    materialName: material.data().name,
                    materialId: material.data().materialId,
                }));
        }

        // Attach product and materials to order data
        orderData.productForOrderData = productForOrderData;
        orderData.materialsForOrderData = materialsForOrderData;

        console.log("Final order data:", orderData);

        if (orderSetter) {
            orderSetter(orderData);
        }

        return orderData;
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
}

export const toggleOrderPaid = async (userId, orderId, currentPaid) => {
    try {
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      await updateDoc(orderRef, { paid: !currentPaid });
      return !currentPaid; // Return the new state
    } catch (error) {
      console.error("Error updating paid status:", error);
      throw error;
    }
  };
  

export const toggleOrderCompleted = async (userId, orderId, currentCompleted) => {
    try {
      const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
      await updateDoc(orderRef, { completed: !currentCompleted });
      return !currentCompleted;
    } catch (error) {
      console.error("Error updating completed status:", error);
      throw error;
    }
  };

