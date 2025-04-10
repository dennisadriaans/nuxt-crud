import { ProductCollection } from "./Resources/ProductCollection";
import { ProductResource } from "./Resources/ProductResource";

/**
 * Product Controller Composable
 * Handles business logic for product operations
 */
export const ProductController = () => {
  /**
   * Get all products
   */
  const index = async (params: any = {}) => {
    // In a real app, this would fetch from a database with pagination/filtering
    const products = [
      { id: 1, name: 'Example Product 1' },
      { id: 2, name: 'Example Product 2' },
    ];

    // Apply filters
    let filteredproducts = products;

    // Example filter implementation
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredproducts = filteredproducts.filter(product =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    return {
      data: ProductCollection({ data: filteredproducts }).toArray(),
      meta: {
        total: filteredproducts.length,
        page: params.page || 1,
        limit: params.limit || 10
      }
    };
  };

  /**
   * Get a specific product by ID
   */
  const show = async (id: string) => {
    // In a real app, this would fetch from a database
    const product = { id: parseInt(id), name: `Product ${id}` };

    return {
      data: ProductResource(product).toArray(),
    };
  };

  /**
   * Create a new product
   */
  const store = async (productData: any) => {
    // In a real app, this would create in a database
    const newProduct = {
      id: 3, // Would be generated by DB
      ...productData
    };

    return {
      message: 'Product created successfully',
      data: ProductResource(newProduct).toArray(),
    };
  };

  /**
   * Update a specific product
   */
  const update = async (id: string, productData: any) => {
    // In a real app, this would update in a database
    const updatedProduct = {
      id: parseInt(id),
      name: productData.name || `Product ${id}`,
    };

    return {
      message: 'Product updated successfully',
      data: ProductResource(updatedProduct).toArray(),
    };
  };

  /**
   * Delete a specific product
   */
  const destroy = async (id: string) => {
    // In a real app, this would delete from a database

    return {
      message: `Product ${id} deleted successfully`,
    };
  };

  return {
    index,
    show,
    store,
    update,
    destroy
  };
};