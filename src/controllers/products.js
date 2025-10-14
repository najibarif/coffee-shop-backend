// Misal: products adalah array hasil query dari database
const BASE_URL = process.env.BASE_URL;

const products = rows.map(product => ({
  ...product,
  image: `${BASE_URL}/api/assets/${product.image}` // pastikan field image jadi URL lengkap
}));

res.json(products);