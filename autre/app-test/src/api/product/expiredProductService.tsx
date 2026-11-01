// expiredProductApi.js
import axiosInstance from "../../axiosBasec/axiosInstance";
import {ExpiredProduct} from "../../classe/Product";
import activityLogger from "../../classe/ActivityLoggerService";
import {username} from "../authService";

// Base configuration
const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:9055'}/api/expired-products`;



// API methods
export const expiredProductApi = {
    // Create expired product
    create: async (expiredProduct: ExpiredProduct) => {
        activityLogger.logActivity(`CREATE_EXPIRED_PRODUCT_${expiredProduct.productId}`, { username: username }, `User ${username} created an expired product with ID "${expiredProduct.productId}".`);
        try {
            const response = await axiosInstance.post(`${API_BASE_URL}`, expiredProduct);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update expired product
    update: async (id: number, expiredProduct: Partial<ExpiredProduct>) => {
        activityLogger.logActivity(`UPDATE_EXPIRED_PRODUCT`, { username: username }, `User ${username} updated expired product with ID "${id}".`);
        try {
            const response = await axiosInstance.put(`${API_BASE_URL}/${id}`, expiredProduct);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete expired product
    delete: async (id: number) => {
        activityLogger.logActivity(`DELETE_EXPIRED_PRODUCT_${id}`, { username: username }, `User ${username} deleted the expired product with ID "${id}".`);
        try {
            await axiosInstance.delete(`${API_BASE_URL}/${id}`);
            return true;
        } catch (error) {
            throw error;
        }
    },

    // Search expired products by expiration date
    searchByDate: async (expirationDate :ExpiredProduct) => {
        activityLogger.logActivity(`SEARCH_EXPIRED_PRODUCT_${expirationDate.productId}`, { username: username }, `User ${username} searched for expired products with product ID "${expirationDate.productId}".`);
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/search`, {
                params: { expirationDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all expired products
    getAll: async () => {
        activityLogger.logActivity(`GET_ALL_EXPIRED_PRODUCTS`, { username: username }, `User ${username} fetched all expired products.`);
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get expired product by ID
    getById: async (id : number) => {
        activityLogger.logActivity(`GET_EXPIRED_PRODUCT_BY_ID`, { username: username }, `User ${username} fetched expired product with ID "${id}".`);
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

// Usage examples in React components or vanilla JS:

/*
// Example 1: Create expired product
const createExpiredProduct = async () => {
  try {
    const newProduct = {
      name: "Expired Milk",
      expirationDate: "2024-01-15",
      category: "Dairy"
    };
    const created = await expiredProductApi.create(newProduct);
    console.log('Created:', created);
  } catch (error) {
    console.error('Error creating product:', error);
  }
};

// Example 2: Search by expiration date
const searchProducts = async () => {
  try {
    const products = await expiredProductApi.searchByDate("2024-01-15");
    console.log('Found products:', products);
  } catch (error) {
    console.error('Error searching products:', error);
  }
};

// Example 3: Update product
const updateProduct = async () => {
  try {
    const updatedProduct = {
      name: "Updated Expired Milk",
      expirationDate: "2024-01-16",
      category: "Dairy"
    };
    const result = await expiredProductApi.update(1, updatedProduct);
    console.log('Updated:', result);
  } catch (error) {
    console.error('Error updating product:', error);
  }
};

// Example 4: Delete product
const deleteProduct = async () => {
  try {
    await expiredProductApi.delete(1);
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

// Example 5: React component usage
import React, { useState, useEffect } from 'react';

const ExpiredProductsComponent = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await expiredProductApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await expiredProductApi.delete(id);
      loadProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Expired Products</h2>
      {products.map(product => (
        <div key={product.id}>
          <span>{product.name} - {product.expirationDate}</span>
          <button onClick={() => handleDelete(product.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
*/

export default expiredProductApi;