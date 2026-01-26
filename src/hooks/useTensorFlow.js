import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export const useTensorFlow = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    initializeTensorFlow();
  }, []);

  const initializeTensorFlow = async () => {
    try {
      console.log('Loading TensorFlow.js...');
      
      // Set backend to WebGL for better performance
      await tf.setBackend('webgl');
      await tf.ready();
      
      console.log('TensorFlow.js loaded successfully');
      console.log('Backend:', tf.getBackend());
      
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load TensorFlow.js:', err);
      setError(err.message);
      setIsLoaded(false);
    }
  };

  const loadModel = async (modelUrl) => {
    if (!isLoaded) {
      throw new Error('TensorFlow.js not loaded');
    }

    try {
      console.log('Loading model:', modelUrl);
      // You can load custom models here
      // const loadedModel = await tf.loadLayersModel(modelUrl);
      // setModel(loadedModel);
      
      return null;
    } catch (err) {
      console.error('Failed to load model:', err);
      throw err;
    }
  };

  const preprocessImage = async (imageElement) => {
    return tf.tidy(() => {
      // Convert image to tensor
      const tensor = tf.browser.fromPixels(imageElement);
      
      // Resize if needed
      const resized = tf.image.resizeBilinear(tensor, [224, 224]);
      
      // Normalize to [-1, 1]
      const normalized = resized.toFloat().div(127.5).sub(1);
      
      // Add batch dimension
      return normalized.expandDims(0);
    });
  };

  return {
    isLoaded,
    error,
    model,
    loadModel,
    preprocessImage,
    tf // Expose tf for advanced usage
  };
};