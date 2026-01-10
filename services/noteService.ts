
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  addDoc, 
  deleteDoc, 
  doc,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Note } from '../types';

const COLLECTION_NAME = 'arm_notes';

export const addNote = async (content: string, author: string, priority: Note['priority'] = 'medium') => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      content,
      author,
      priority,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding note:", error);
    throw error;
  }
};

export const getRecentNotes = async (maxCount: number = 10) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'), limit(maxCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};

export const deleteNote = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};
