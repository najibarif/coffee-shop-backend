// Contoh di dalam endpoint get products
const BASE_URL = process.env.BASE_URL;

const products = rows.map(product => ({
  ...product,
  image: `${BASE_URL}/assets/${product.image}`
}));
res.json(products);