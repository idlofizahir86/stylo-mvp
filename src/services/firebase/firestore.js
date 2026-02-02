import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc 
} from 'firebase/firestore';

const wardrobeRef = collection(db, 'wardrobe');

export const wardrobeService = {

  // Add new clothing item
  async addItem(itemData) {
    try {
      console.log('➕ Adding item to Firestore:', itemData);
      
      const itemToSave = {
        name: itemData.name || 'Unnamed Item',
        type: itemData.type || 'top',
        color: itemData.color || '#000000',
        category: itemData.category || 'casual',
        imageUrl: itemData.imageUrl || '',
        
        // Cloudinary data (jika ada)
        cloudinaryUrl: itemData.cloudinaryUrl || '',
        cloudinaryPublicId: itemData.cloudinaryPublicId || '',
        thumbUrl: itemData.thumbUrl || '',
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        favorite: itemData.favorite || false,
        wornCount: itemData.wornCount || 0,
        
        // Additional fields dari form
        season: itemData.season || '',
        brand: itemData.brand || '',
        price: itemData.price || 0,
        notes: itemData.notes || '',
        tags: itemData.tags || [],
        material: itemData.material || '',
        size: itemData.size || '',
        condition: itemData.condition || 'new'
      };

      const docRef = await addDoc(wardrobeRef, itemToSave);
      console.log('✅ Item added with ID:', docRef.id);
      
      return { 
        id: docRef.id, 
        ...itemToSave,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error adding item:', error);
      throw new Error(`Failed to add item: ${error.message}`);
    }
  },

  // Get all wardrobe items
  async getItems() {
    try {
      console.log('📋 Fetching items from Firestore...');
      
      let q;
      try {
        q = query(wardrobeRef, orderBy('createdAt', 'desc'));
      } catch (error) {
        console.warn('Cannot order by createdAt:', error);
        q = query(wardrobeRef);
      }
      
      const snapshot = await getDocs(q);
      console.log(`✅ Found ${snapshot.docs.length} items`);
      
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Item',
          type: data.type || 'top',
          color: data.color || '#000000',
          category: data.category || 'casual',
          imageUrl: data.imageUrl || data.cloudinaryUrl || '', // Gunakan cloudinaryUrl jika ada
          thumbUrl: data.thumbUrl || '',
          
          // Additional fields
          season: data.season || '',
          brand: data.brand || '',
          price: data.price || 0,
          notes: data.notes || '',
          tags: data.tags || [],
          
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          favorite: data.favorite || false,
          wornCount: data.wornCount || 0
        };
      });
      
      return items;
    } catch (error) {
      console.error('❌ Error getting items:', error);
      return [];
    }
  },

  // Update item
  async updateItem(id, updates) {
    try {
      const itemRef = doc(db, 'wardrobe', id);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },  

  // Delete item
  async deleteItem(id) {
    try {
      await deleteDoc(doc(db, 'wardrobe', id));
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Test Firestore connection
  async testConnection() {
    try {
      const testDoc = await addDoc(collection(db, '_test'), {
        test: true,
        timestamp: serverTimestamp()
      });
      await deleteDoc(testDoc);
      return true;
    } catch (error) {
      console.error('Firestore connection test failed:', error);
      return false;
    }
  }
};