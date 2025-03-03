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

export async function dbAddOrder(userId, orderObj) {
    try {
        console.log("Attempting to add order for user:", userId);
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        const ordersCollection = collection(db, `users/${userId}/orders`);// Direct:const ordersCollection = collection(db, "orders");

        // Create new order
        const newOrderRef = await addDoc(ordersCollection, {
            orderName: orderObj.orderName,
            startDate: orderObj.startDate,
            deadline: orderObj.deadline,
            daysUntilDeadline: orderObj.daysUntilDeadline, 
            customerName: orderObj.customerName,
            description: orderObj.description,
            selectedProduct: orderObj.selectedProduct,
            selectedMaterials: orderObj.selectedMaterials,
            materialCost: orderObj.materialCost, 
            productCost: orderObj.productCost, 
            workCost: orderObj.workCost,
            totalCost: orderObj.totalCost, 
        });

        console.log("Order created successfully with ID:", newOrderRef.id);
        return newOrderRef.id;
    } catch (error) {
        console.error("Error creating order:", error.message);
        throw error;
    }
}
