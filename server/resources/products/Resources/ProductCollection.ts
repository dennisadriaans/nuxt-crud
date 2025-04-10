import { ProductResource } from './ProductResource';

interface ProductCollection {
  data: ProductResource[];
}

export function ProductCollection(collection: ProductCollection) {
  const toArray = () => {
    return collection.data.map((product) => ProductResource(product).toArray());
  };

  return {
    toArray,
  };
}