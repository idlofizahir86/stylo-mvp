import { useState, useEffect } from 'react';
import { wardrobeService } from '../services/firebase/firestore';

export const useFirestore = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wardrobeService.getItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData) => {
    setLoading(true);
    try {
      const newItem = await wardrobeService.addItem(itemData);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, updates) => {
    setLoading(true);
    try {
      await wardrobeService.updateItem(id, updates);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      await wardrobeService.deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems
  };
};