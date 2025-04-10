
export interface ProductResource {
  id: number;
  name: string;
  // Add more properties as needed
}


export function ProductResource(product: ProductResource) {
  const toArray = () => {
    return {
      id: product.id,
      name: product.name,
      // Add more properties as needed
    };
  };

  return {
    toArray,
  };
}