
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  limit, 
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Visitor } from '../types';

const COLLECTION_NAME = 'arm_visitors';

// Ma'lumotlarni formatlash funksiyasi (Eski ma'lumotlarni yangi formatga moslash)
const mapVisitorData = (doc: any): Visitor => {
  const data = doc.data();
  return {
    id: doc.id,
    firstName: data.firstName || data.name || 'Ism kiritilmagan',
    lastName: data.lastName || '',
    userType: data.userType || 'ichki',
    faculty: data.faculty || '',
    department: data.department || '',
    group: data.group || '',
    section: data.section || 'ARM ga tashrif',
    visitDate: data.visitDate || (data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    createdAt: data.createdAt || Timestamp.now(),
    updatedAt: data.updatedAt || null
  };
};

export const registerVisitor = async (visitor: Omit<Visitor, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...visitor,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error registering visitor:", error);
    throw error;
  }
};

export const updateVisitor = async (id: string, visitor: Partial<Visitor>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...visitor,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating visitor:", error);
    throw error;
  }
};

export const deleteVisitor = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting visitor:", error);
    throw error;
  }
};

export const getAllVisitors = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapVisitorData);
  } catch (error) {
    // Agar createdAt bo'yicha index hali tayyor bo'lmasa, oddiyroq query ishlatamiz
    console.warn("Index not ready or error, falling back to simple query");
    const qSimple = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(qSimple);
    return querySnapshot.docs.map(mapVisitorData);
  }
};

export const getRecentVisitors = async (maxCount: number = 200) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(maxCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(mapVisitorData);
};
