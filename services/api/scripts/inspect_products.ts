import 'dotenv/config';
import { getPool } from '../src/db/pool';

(async () => {
  const pool = getPool();
  const res = await pool.query(
    'SELECT count(*) AS total, count(image_url) AS has_images FROM products WHERE store_id=(SELECT id FROM stores WHERE code=$1) AND is_active=TRUE',
    ['BLR001']
  );
  console.log('SUMMARY:', res.rows);
  const sample = await pool.query(
    'SELECT name, sku, style_code, size, color, category, image_url FROM products WHERE store_id=(SELECT id FROM stores WHERE code=$1) AND is_active=TRUE AND name IN ($2,$3,$4) ORDER BY name, style_code, size',
    ['BLR001', 'Natural Canvas Tote Bag', 'Silk Block-Print Scarf', 'Classic White Silk Blouse']
  );
  console.log('SAMPLE:', sample.rows);
  await pool.end();
})();
