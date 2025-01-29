import { collection, deleteDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../_utils/firebase";

export async function dbDeleteOrderById(userId, orderId){
    try {
        const orderRef = collection(db, 'users', userId, 'orders', orderId)
        const documentSnapshot = await getDoc(orderRef);
        
        if (documentSnapshot.exists()) {
            await deleteDoc(orderRef);
          } else {
            console.log("The order in the database does not exist under user");
          }

    } catch (error) {
        console.error("Error fetching order:", error);
    }
}

export async function dbEditOrderById(userId, orderId, newOrderData) {
  try {
      const orderRef = doc(db, 'users', userId, 'orders', orderId);
      
      const documentSnapshot = await getDoc(orderRef);

      if (documentSnapshot.exists()) {
          await updateDoc(orderRef, newOrderData);
          console.log("Order updated successfully.", orderId);
      } else {
          console.log("The order does not exist in the database under user.", userId);
      }
  } catch (error) {
      console.error("Error updating order:", error);
  }
}
