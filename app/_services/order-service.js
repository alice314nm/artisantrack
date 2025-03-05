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
            customerId: customerId,
            description: orderObj.description,
            productId: orderObj.productId,
            materialIds: orderObj.materialIds, 
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
            throw new Error(`Product with ID ${productId} does not exist.`);
        }

        await deleteDoc(productRef);
        console.log(`Product with ID ${productId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting product:", error.message);
    }
}