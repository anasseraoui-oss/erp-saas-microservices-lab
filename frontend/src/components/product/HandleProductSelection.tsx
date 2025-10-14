import React, { useState } from 'react';
import { getProductByName, getProductById, getProductByBarcode, getProductByPrice, getProductByQuantity } from "../../api/product/productService";
import {useDarkMode} from "../DarkModeProvider";
import ProductForm from './ProductForme';
interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    barcode: string;
}
const HandleProductSelection = () => {
    const [searchMethod, setSearchMethod] = useState('name');
    const [searchValue, setSearchValue] = useState('');
    const [productResults, setProductResults] = useState<Product[]>([]);


    const handleSearch = async () => {
        try {
            let response;
            if (searchMethod === 'name') {
                response = await getProductByName(searchValue);
            } else if (searchMethod === 'id') {
                response = await getProductById(searchValue);
            } else if (searchMethod === 'barcode') {
                response = await getProductByBarcode(searchValue);
            } else if (searchMethod === 'price') {
                response = await getProductByPrice(searchValue);
            } else if (searchMethod === 'quantity') {
                response = await getProductByQuantity(searchValue);
            }
            // @ts-ignore
            setProductResults(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };
    // @ts-ignore
    const { isDarkMode } = useDarkMode();

    // @ts-ignore
    return (
        <div className={`product-selection-container ${isDarkMode ? 'dark-mode' : 'light'}`}>
            <div className="search-header">
                <h1>Find Your Product</h1>
                <p>Select a search method and enter the value</p>
            </div>

            <div className="search-inputs">
                <select className={`search-mn ${isDarkMode ? 'dark-mode ' : ''}`}
                        onChange={(e) => setSearchMethod(e.target.value)}
                        value={searchMethod}>
                    <option value="name">Name</option>
                    <option value="id">ID</option>
                    <option value="barcode">Barcode</option>
                    <option value="price">Price</option>
                    <option value="quantity">Quantity</option>
                </select>
                <input
                    className={`search-field ${isDarkMode ? 'dark-mode input' : ''}`}
                    type="text"
                    placeholder="searchMethod"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <button className="search-btn" onClick={handleSearch}>Search</button>

            </div>
            {/* Display results */}
            {productResults.length > 0 && (
                <div className="results-container">
                    <h3>Matching Products:</h3>
                    <table className="table table-striped table-hover">
                        <thead>
                        <tr className={`card-body ${isDarkMode ? 'table-dark ' : ''}`}>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Barcode</th>
                        </tr>
                        </thead>
                        <tbody>
                        {productResults.map((product) => (
                            <tr key={product.id} className={`card-body ${isDarkMode ? 'table-dark ' : ''}`}>
                                <td>{product.id}</td>
                                <td>{product.name}</td>
                                <td>{product.price}</td>
                                <td>{product.quantity}</td>
                                <td>{product.barcode}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};



export default HandleProductSelection;