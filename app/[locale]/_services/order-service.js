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
import { db } from "@/app/[locale]/_utils/firebase";

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

export async function getCustomers(userId, customersSetter) {
    try {
        const customerCollection = collection(db, "users", userId, "customers");
        const querySnapshot = await getDocs(customerCollection);

        const customersNames = querySnapshot.docs.map(customer => customer.data().name);

        customersSetter(customersNames);
        return customersNames;

    } catch (error) {
        console.error("Error while fetching all customers Names:", error.message);
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

        // Subtract materials used from their quantities
        const materialsCollection = collection(userRef, "materials");

        for (let i = 0; i < orderObj.quantities.length; i++) {
            const materialId = orderObj.quantities[i].id;
            const quantityUsed = orderObj.quantities[i].quantity;

            const materialDocRef = doc(materialsCollection, materialId);
            const materialSnapshot = await getDoc(materialDocRef);

            if (materialSnapshot.exists()) {
                const materialData = materialSnapshot.data();
                const currentQty = materialData.quantity || 0;
                const costPerUnit = materialData.costPerUnit || 0;
                const currentTotal = materialData.total || 0;
        
                const updatedQty = currentQty - quantityUsed;
                const costToSubtract = quantityUsed * costPerUnit;
                const updatedTotal = currentTotal - costToSubtract;
        
                if (updatedQty < 0) {
                    console.warn(`Material "${materialId}" has insufficient quantity.`);
                }
        
                await updateDoc(materialDocRef, {
                    quantity: updatedQty >= 0 ? updatedQty : 0,
                    total: updatedTotal >= 0 ? updatedTotal : 0,
                });
            } else {
                console.warn(`Material with ID "${materialId}" not found.`);
            }
        }
        return newOrderRef.id;
    } catch (error) {
        console.error("Error creating order:", error.message);
        throw error;
    }
}


export async function dbDeleteOrderById(userId, orderId) {
    try {
        const userRef = doc(db, "users", userId); // Define userRef
        const orderRef = doc(db, "users", userId, "orders", orderId);

        const orderDoc = await getDoc(orderRef);
        if (!orderDoc.exists()) {
            throw new Error(`Order with ID ${orderId} does not exist.`);
        }

        const orderData = orderDoc.data(); // Extract order data
        const materialsCollection = collection(userRef, "materials");

        for (let i = 0; i < orderData.quantities.length; i++) {
            const materialId = orderData.quantities[i].id;
            const quantityUsed = orderData.quantities[i].quantity;

            const materialDocRef = doc(materialsCollection, materialId);
            const materialSnapshot = await getDoc(materialDocRef);

            if (materialSnapshot.exists()) {
                const materialData = materialSnapshot.data();
                const currentQty = materialData.quantity || 0;
                const costPerUnit = materialData.costPerUnit || 0;
                const currentTotal = materialData.total || 0;
        
                const updatedQty = currentQty + quantityUsed;
                const costToSubtract = quantityUsed * costPerUnit;
                const updatedTotal = currentTotal + costToSubtract;

                await updateDoc(materialDocRef, {
                    quantity: updatedQty,
                    total: updatedTotal >= 0 ? updatedTotal : 0,
                });
            } else {
                console.warn(`Material with ID "${materialId}" not found.`);
            }
        }

        await deleteDoc(orderRef);
        console.log(`Order with ID ${orderId} and its associated data were deleted.`);
    } catch (error) {
        console.error("Error deleting order:", error.message);
        throw error;
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
                    productImages: productSnapshot.data().productImages || [],
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

export async function dbUpdateOrder(userId, orderId, orderObj) {
    try {
        console.log("Attempting to update order for user:", userId);
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            throw new Error(`User with ID ${userId} does not exist.`);
        }

        const orderRef = doc(db, `users/${userId}/orders/${orderId}`);
        const orderDoc = await getDoc(orderRef);
        if (!orderDoc.exists()) {
            throw new Error(`Order with ID ${orderId} does not exist.`);
        }

        // Get the previous order data
        const previousOrder = orderDoc.data();
        
        // STEP 1: Return materials from previous order back to inventory
        if (previousOrder.quantities && Array.isArray(previousOrder.quantities)) {
            const materialsCollection = collection(userRef, "materials");
            
            for (const materialItem of previousOrder.quantities) {
                const materialId = materialItem.id;
                const quantityUsed = parseFloat(materialItem.quantity) || 0;
                
                if (!materialId || quantityUsed <= 0) continue;
                
                const materialDocRef = doc(materialsCollection, materialId);
                const materialSnapshot = await getDoc(materialDocRef);
                
                if (materialSnapshot.exists()) {
                    const materialData = materialSnapshot.data();
                    const currentQty = parseFloat(materialData.quantity) || 0;
                    const costPerUnit = parseFloat(materialData.costPerUnit) || 0;
                    const currentTotal = parseFloat(materialData.total) || 0;
                    
                    // Return the previously used quantity back to inventory
                    const updatedQty = currentQty + quantityUsed;
                    const updatedTotal = currentTotal + (quantityUsed * costPerUnit);
                    
                    console.log(`Returning ${quantityUsed} of material ${materialId} to inventory`);
                    
                    await updateDoc(materialDocRef, {
                        quantity: updatedQty,
                        total: updatedTotal
                    });
                }
            }
        }
        
        const customerId = await getOrAddCustomer(userId, orderObj.customerName);
        
        // STEP 2: Update the order document
        await updateDoc(orderRef, orderObj);
        
        // STEP 3: Subtract new materials from inventory
        if (orderObj.quantities && Array.isArray(orderObj.quantities)) {
            const materialsCollection = collection(userRef, "materials");
            
            for (const materialItem of orderObj.quantities) {
                const materialId = materialItem.id;
                const quantityUsed = parseFloat(materialItem.quantity) || 0;
                
                if (!materialId || quantityUsed <= 0) continue;
                
                const materialDocRef = doc(materialsCollection, materialId);
                const materialSnapshot = await getDoc(materialDocRef);
                
                if (materialSnapshot.exists()) {
                    const materialData = materialSnapshot.data();
                    const currentQty = parseFloat(materialData.quantity) || 0;
                    const costPerUnit = parseFloat(materialData.costPerUnit) || 0;
                    const currentTotal = parseFloat(materialData.total) || 0;
                    
                    // Subtract the new quantity from inventory
                    const updatedQty = Math.max(0, currentQty - quantityUsed);
                    const costToSubtract = quantityUsed * costPerUnit;
                    const updatedTotal = Math.max(0, currentTotal - costToSubtract);
                    
                    console.log(`Removing ${quantityUsed} of material ${materialId} from inventory`);
                    
                    await updateDoc(materialDocRef, {
                        quantity: updatedQty,
                        total: updatedTotal
                    });
                } else {
                    console.warn(`Material with ID "${materialId}" not found.`);
                }
            }
        }
        
        console.log("Order updated successfully with ID:", orderId);
        return orderId;
    } catch (error) {
        console.error("Error updating order:", error.message);
        throw error;
    }
}