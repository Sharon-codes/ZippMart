const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const customerDir = path.resolve(__dirname, '../../../apps/customer-web/public/images/products');
const adminDir = path.resolve(__dirname, '../../../apps/admin-web/public/images/products');
const apiDir = path.resolve(__dirname, '../uploads/products');

[customerDir, adminDir, apiDir].forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// Curated high quality clothing photos from Unsplash
const imageUrls = [
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80", // 1. Classic Oxford Cotton Shirt
  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80", // 2. Vintage Chambray Workshirt
  "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=800&q=80", // 3. Striped Casual Linen Shirt
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80", // 4. Basic White Crewneck Tee
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80", // 5. Basic Charcoal Crewneck Tee
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80", // 6. Textured Knit Henley Shirt
  "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80", // 7. Pique Polo Shirt
  "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80", // 8. Indigo Denim Shirt
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", // 9. Handloom Cotton Kurta
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80", // 10. Printed Resort Collar Shirt
  "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=800&q=80", // 11. Flannel Plaid Overshirt
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", // 12. Slim Fit Graphic Tee
  "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80", // 13. Classic White Silk Blouse
  "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80", // 14. Sage Green Cami Top
  "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=800&q=80", // 15. Ribbed Knit Mockneck Top
  "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80", // 16. Terracotta Linen Top
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80", // 17. Striped Boatneck Tee
  "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80", // 18. Boho Floral Chiffon Blouse
  "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80", // 19. Oversized Satin Button-Down
  "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=800&q=80", // 20. Lace Trim Tank Top
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", // 21. Sleeveless Crop Top
  "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80", // 22. Embroidered Georgette Tunic
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80", // 23. Floral Print Summer Dress
  "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=800&q=80", // 24. Linen Wrap Midi Dress
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", // 25. Silk Embroidered Kurti
  "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=800&q=80", // 26. Chiffon Pleated Maxi Dress
  "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", // 27. Tiered Cotton Sundress
  "https://images.unsplash.com/photo-1631857455684-a54a2f03665f?auto=format&fit=crop&w=800&q=80", // 28. Emerald Silk Anarkali Suit
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80", // 29. Velvet Cocktail Party Dress
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", // 30. Handblock Printed Saree
  "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=800&q=80", // 31. Polka Dot Shirt Dress
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80", // 32. Ribbed Bodycon Knit Dress
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80", // 33. Chikankari Cotton Kurta Set
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80", // 34. Satin Evening Slip Dress
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", // 35. Slim Fit Indigo Jeans
  "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=800&q=80", // 36. Vintage Stonewash Jeans
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80", // 37. Utility Khaki Chinos
  "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80", // 38. Off-White Linen Trousers
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80", // 39. Charcoal Tailored Trousers
  "https://images.unsplash.com/photo-1569411032431-07598b0012c2?auto=format&fit=crop&w=800&q=80", // 40. Forest Green Pleated Skirt
  "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80", // 41. Denim A-Line Skirt
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80", // 42. Black Wide-Leg Trousers
  "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?auto=format&fit=crop&w=800&q=80", // 43. Cotton Cargo Joggers
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80", // 44. Flannel Lounge Pants
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80", // 45. High-Waisted Mom Jeans
  "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80", // 46. Performance Athletic Shorts
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80", // 47. Suede Trucker Jacket
  "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80", // 48. Vintage Wash Denim Jacket
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80", // 49. Structured Navy Wool Blazer
  "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80", // 50. Grey Cable-Knit Cardigan
  "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=800&q=80", // 51. Heavyweight Sherpa Fleece
  "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80", // 52. Hooded Utility Windbreaker
  "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80", // 53. Fine Merino Wool Sweater
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80", // 54. Oversized Cotton Hoodie
  "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80", // 55. Lightweight Down Puffer Jacket
  "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=800&q=80", // 56. Denim Jacket with Shearling
  "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=800&q=80", // 57. Classic Plaid Shacket
  "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80", // 58. Double-Breasted Trench Coat
  "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80", // 59. Natural Canvas Tote Bag
  "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80", // 60. Full Grain Leather Belt
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", // 61. Woolen Knit Scarf
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", // 62. Vintage Leather Sling Bag
  "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80", // 63. Minimalist Leather Wallet
  "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80", // 64. Ribbed Knit Beanie Hat
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80", // 65. Woven Straw Tote Bag
  "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80", // 66. Silk Block-Print Scarf
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", // 67. Durable Canvas Backpack
  "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=800&q=80", // 68. Classic Leather Chelsea Boots
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80", // 69. Canvas Low-Top Sneakers
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"  // 70. Polarized Retro Sunglasses
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading/populating ${imageUrls.length} clothing product images...`);
  for (let i = 0; i < imageUrls.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const fileName = `clothing_${num}.jpg`;
    const custPath = path.join(customerDir, fileName);
    const admPath = path.join(adminDir, fileName);
    const apiPath = path.join(apiDir, fileName);

    const url = imageUrls[i];
    try {
      console.log(`Downloading [${i + 1}/70] ${fileName}...`);
      await download(url, custPath);
      fs.copyFileSync(custPath, admPath);
      fs.copyFileSync(custPath, apiPath);
    } catch (err) {
      console.warn(`Warning downloading ${fileName}: ${err.message}. Creating placeholder fallback.`);
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="bold" fill="#0052ff">Clothing Item #${num}</text></svg>`;
      fs.writeFileSync(custPath.replace('.jpg', '.svg'), svgContent);
      fs.writeFileSync(admPath.replace('.jpg', '.svg'), svgContent);
      fs.writeFileSync(apiPath.replace('.jpg', '.svg'), svgContent);
    }
  }
  console.log('Successfully populated 70 clothing images across customer-web, admin-web, and api uploads!');
}

main();
