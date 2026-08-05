import { randomUUID } from "crypto";
import path from "path";
import { config } from "dotenv";
import {
  createProduct,
  createSession,
  createOrder,
  nextCounterToken,
  getDefaultStoreId,
  updateProductDetails,
  updateProductStock
} from "../src/db/store";
import { getPool } from "../src/db/pool";
import { uploadProductImageToStorage, productImageStorageStatus } from "../src/storage/productImages";

config({ path: path.resolve(__dirname, "../.env") });

type SimpleProduct = {
  barcode: string;
  name: string;
  category: string;
  styleCode: string;
  size: string;
  color: string;
  brand: string;
  season: string;
  gender: string;
  unitPrice: number;
  costPrice: number;
  taxPercent: number;
  inStock: number;
  demandScore: number;
  imageUrl?: string | null;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fetchBuffer(url: string): Promise<{ buffer: Buffer; contentType: string | null }> {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const lib = u.protocol === "http:" ? require("http") : require("https");
      lib.get(u.href, (res: any) => {
        if (res.statusCode && res.statusCode >= 400) return reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] || null }));
      }).on("error", reject);
    } catch (e) {
      reject(e);
    }
  });
}

function extFromContentType(contentType: string | null, url?: string) {
  if (!contentType && url) {
    const match = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
    if (match) return match[1];
    return "jpg";
  }
  if (!contentType) return "jpg";
  if (contentType.includes("jpeg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

function placeholderImageUrl(label: string) {
  return `https://dummyimage.com/900x900/ffffff/222&text=${encodeURIComponent(label)}`;
}

async function main() {
  console.log("Seeding full apparel catalog (50-60 products) and 1 month of orders for BLR001...");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Set it in services/api/.env or environment.");
    process.exit(1);
  }

  // Make sure API's default store code targets BLR001 or set DEFAULT_STORE_CODE=BLR001
  process.env.DEFAULT_STORE_CODE = process.env.DEFAULT_STORE_CODE || "BLR001";

  const seasons = ["All Season", "Summer", "Autumn", "Winter", "Spring"];
  const sizes = ["S", "M", "L", "XL"];

  const templates = [
    {
      name: "Classic Oxford Cotton Shirt",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Summer",
      priceMin: 1499,
      priceMax: 1499,
      costPct: 0.42,
      colors: ["White", "Light Blue", "Pink"],
      imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-01"
    },
    {
      name: "Vintage Chambray Workshirt",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Men",
      season: "Autumn",
      priceMin: 1899,
      priceMax: 1899,
      costPct: 0.42,
      colors: ["Blue", "Light Grey"],
      imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-02"
    },
    {
      name: "Striped Casual Linen Shirt",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Summer",
      priceMin: 1699,
      priceMax: 1699,
      costPct: 0.43,
      colors: ["Blue-White", "Green-White"],
      imageUrl: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-03"
    },
    {
      name: "Basic White Crewneck Tee",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Men",
      season: "Summer",
      priceMin: 599,
      priceMax: 599,
      costPct: 0.35,
      colors: ["White"],
      imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-04"
    },
    {
      name: "Basic Charcoal Crewneck Tee",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Men",
      season: "Summer",
      priceMin: 599,
      priceMax: 599,
      costPct: 0.35,
      colors: ["Charcoal"],
      imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-05"
    },
    {
      name: "Textured Knit Henley Shirt",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Spring",
      priceMin: 1299,
      priceMax: 1299,
      costPct: 0.40,
      colors: ["Dark Olive", "Navy", "Oatmeal"],
      imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-06"
    },
    {
      name: "Pique Polo Shirt",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Summer",
      priceMin: 999,
      priceMax: 999,
      costPct: 0.38,
      colors: ["Royal Blue", "Forest Green", "White"],
      imageUrl: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-07"
    },
    {
      name: "Indigo Denim Shirt",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2199,
      priceMax: 2199,
      costPct: 0.44,
      colors: ["Indigo"],
      imageUrl: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-08"
    },
    {
      name: "Handloom Cotton Kurta",
      category: "Apparel",
      brand: "Indie Looms",
      gender: "Men",
      season: "All Season",
      priceMin: 1399,
      priceMax: 1399,
      costPct: 0.42,
      colors: ["Crimson", "Saffron", "Ivory"],
      imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-09"
    },
    {
      name: "Printed Resort Collar Shirt",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Men",
      season: "Summer",
      priceMin: 1599,
      priceMax: 1599,
      costPct: 0.41,
      colors: ["Sage-Floral", "Cream-Floral"],
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-MSH-10"
    },
    {
      name: "Floral Print Summer Dress",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "Summer",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.42,
      colors: ["Yellow-Floral", "Blue-Floral"],
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-11"
    },
    {
      name: "Linen Wrap Midi Dress",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 2999,
      priceMax: 2999,
      costPct: 0.45,
      colors: ["Beige", "Soft Pink", "Navy"],
      imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-12"
    },
    {
      name: "Silk Embroidered Kurti",
      category: "Apparel",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 1899,
      priceMax: 1899,
      costPct: 0.43,
      colors: ["Red", "Royal Blue", "Teal"],
      imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-13"
    },
    {
      name: "Chiffon Pleated Maxi Dress",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "Spring",
      priceMin: 3499,
      priceMax: 3499,
      costPct: 0.47,
      colors: ["Lavender", "Blush Pink"],
      imageUrl: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-14"
    },
    {
      name: "Tiered Cotton Sundress",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 2299,
      priceMax: 2299,
      costPct: 0.40,
      colors: ["Pink", "Sage Green"],
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-15"
    },
    {
      name: "Emerald Silk Anarkali Suit",
      category: "Apparel",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 4999,
      priceMax: 4999,
      costPct: 0.50,
      colors: ["Emerald Green", "Ruby Red"],
      imageUrl: "https://images.unsplash.com/photo-1631857455684-a54a2f03665f?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WDR-16"
    },
    {
      name: "Classic White Silk Blouse",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "All Season",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.45,
      colors: ["White", "Champagne"],
      imageUrl: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WBL-17"
    },
    {
      name: "Sage Green Cami Top",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Women",
      season: "Summer",
      priceMin: 899,
      priceMax: 899,
      costPct: 0.38,
      colors: ["Sage Green", "Charcoal"],
      imageUrl: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WBL-18"
    },
    {
      name: "Ribbed Knit Mockneck Top",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Winter",
      priceMin: 1299,
      priceMax: 1299,
      costPct: 0.40,
      colors: ["Beige", "Black", "Burgundy"],
      imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WBL-19"
    },
    {
      name: "Terracotta Linen Top",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "Summer",
      priceMin: 1499,
      priceMax: 1499,
      costPct: 0.40,
      colors: ["Terracotta", "Olive"],
      imageUrl: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WBL-20"
    },
    {
      name: "Striped Cotton Boatneck Tee",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Women",
      season: "Summer",
      priceMin: 799,
      priceMax: 799,
      costPct: 0.35,
      colors: ["Black-White Striped"],
      imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-WBL-21"
    },
    {
      name: "Slim Fit Indigo Jeans",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.45,
      colors: ["Indigo"],
      imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-22"
    },
    {
      name: "Vintage Stonewash Jeans",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2799,
      priceMax: 2799,
      costPct: 0.46,
      colors: ["Light Wash"],
      imageUrl: "https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-23"
    },
    {
      name: "Utility Khaki Chinos",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.42,
      colors: ["Khaki", "Navy"],
      imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-24"
    },
    {
      name: "Off-White Linen Trousers",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "Summer",
      priceMin: 2299,
      priceMax: 2299,
      costPct: 0.44,
      colors: ["Off-White"],
      imageUrl: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-25"
    },
    {
      name: "Charcoal Tailored Trousers",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2599,
      priceMax: 2599,
      costPct: 0.45,
      colors: ["Charcoal", "Black"],
      imageUrl: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-26"
    },
    {
      name: "Forest Green Pleated Skirt",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "Autumn",
      priceMin: 1799,
      priceMax: 1799,
      costPct: 0.40,
      colors: ["Forest Green"],
      imageUrl: "https://images.unsplash.com/photo-1569411032431-07598b0012c2?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-27"
    },
    {
      name: "Denim Button-Up A-Line Skirt",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Women",
      season: "All Season",
      priceMin: 1699,
      priceMax: 1699,
      costPct: 0.42,
      colors: ["Denim Blue"],
      imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-28"
    },
    {
      name: "Black Wide-Leg Trousers",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "All Season",
      priceMin: 2199,
      priceMax: 2199,
      costPct: 0.44,
      colors: ["Black"],
      imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-29"
    },
    {
      name: "Cotton Cargo Joggers",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "All Season",
      priceMin: 1899,
      priceMax: 1899,
      costPct: 0.42,
      colors: ["Olive", "Black"],
      imageUrl: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-30"
    },
    {
      name: "Flannel Lounge Pants",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "Winter",
      priceMin: 1199,
      priceMax: 1199,
      costPct: 0.38,
      colors: ["Red Plaid", "Blue Plaid"],
      imageUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-PAN-31"
    },
    {
      name: "Suede Trucker Jacket",
      category: "Outerwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "Winter",
      priceMin: 4599,
      priceMax: 4599,
      costPct: 0.48,
      colors: ["Brown Suede"],
      imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-32"
    },
    {
      name: "Vintage Wash Denim Jacket",
      category: "Outerwear",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "All Season",
      priceMin: 3299,
      priceMax: 3299,
      costPct: 0.46,
      colors: ["Light Denim"],
      imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-33"
    },
    {
      name: "Structured Navy Wool Blazer",
      category: "Outerwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "Autumn",
      priceMin: 3999,
      priceMax: 3999,
      costPct: 0.48,
      colors: ["Navy"],
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-34"
    },
    {
      name: "Grey Cable-Knit Cardigan",
      category: "Outerwear",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Winter",
      priceMin: 2799,
      priceMax: 2799,
      costPct: 0.44,
      colors: ["Grey"],
      imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-35"
    },
    {
      name: "Heavyweight Sherpa Fleece",
      category: "Outerwear",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "Winter",
      priceMin: 2999,
      priceMax: 2999,
      costPct: 0.45,
      colors: ["Off-White", "Forest Green"],
      imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-36"
    },
    {
      name: "Hooded Utility Windbreaker",
      category: "Outerwear",
      brand: "Urban Weave",
      gender: "Unisex",
      season: "Monsoon",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.45,
      colors: ["Black", "Yellow"],
      imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-37"
    },
    {
      name: "Fine Merino Wool Sweater",
      category: "Outerwear",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "Winter",
      priceMin: 2899,
      priceMax: 2899,
      costPct: 0.43,
      colors: ["Camel", "Oatmeal"],
      imageUrl: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-38"
    },
    {
      name: "Oversized Cotton Hoodie",
      category: "Outerwear",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "All Season",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.40,
      colors: ["Black", "Grey"],
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-39"
    },
    {
      name: "Lightweight Down Puffer Jacket",
      category: "Outerwear",
      brand: "Urban Weave",
      gender: "Unisex",
      season: "Winter",
      priceMin: 3999,
      priceMax: 3999,
      costPct: 0.48,
      colors: ["Black", "Navy"],
      imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-40"
    },
    {
      name: "Denim Jacket with Shearling",
      category: "Outerwear",
      brand: "Urban Weave",
      gender: "Women",
      season: "Winter",
      priceMin: 3599,
      priceMax: 3599,
      costPct: 0.46,
      colors: ["Blue Denim"],
      imageUrl: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-41"
    },
    {
      name: "Classic Plaid Shacket",
      category: "Outerwear",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "Autumn",
      priceMin: 2299,
      priceMax: 2299,
      costPct: 0.42,
      colors: ["Red Plaid", "Grey Plaid"],
      imageUrl: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-OUT-42"
    },
    {
      name: "Natural Canvas Tote Bag",
      category: "Accessories",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "All Season",
      priceMin: 699,
      priceMax: 699,
      costPct: 0.35,
      colors: ["Natural"],
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-43"
    },
    {
      name: "Full Grain Leather Belt",
      category: "Accessories",
      brand: "Silk Route",
      gender: "Men",
      season: "All Season",
      priceMin: 1299,
      priceMax: 1299,
      costPct: 0.40,
      colors: ["Tan Leather", "Black Leather"],
      imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-44"
    },
    {
      name: "Woolen Knit Scarf",
      category: "Accessories",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "Winter",
      priceMin: 999,
      priceMax: 999,
      costPct: 0.38,
      colors: ["Navy", "Charcoal"],
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-45"
    },
    {
      name: "Vintage Leather Sling Bag",
      category: "Accessories",
      brand: "Silk Route",
      gender: "Unisex",
      season: "All Season",
      priceMin: 3499,
      priceMax: 3499,
      costPct: 0.45,
      colors: ["Brown Leather"],
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-46"
    },
    {
      name: "Minimalist Leather Wallet",
      category: "Accessories",
      brand: "Silk Route",
      gender: "Unisex",
      season: "All Season",
      priceMin: 1199,
      priceMax: 1199,
      costPct: 0.40,
      colors: ["Tan Suede", "Black Leather"],
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-47"
    },
    {
      name: "Ribbed Knit Beanie Hat",
      category: "Accessories",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "Winter",
      priceMin: 499,
      priceMax: 499,
      costPct: 0.35,
      colors: ["Rust", "Black"],
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-48"
    },
    {
      name: "Woven Straw Tote Bag",
      category: "Accessories",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 1499,
      priceMax: 1499,
      costPct: 0.40,
      colors: ["Natural Straw"],
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-49"
    },
    {
      name: "Silk Block-Print Scarf",
      category: "Accessories",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 899,
      priceMax: 899,
      costPct: 0.38,
      colors: ["Indigo Print", "Maroon Print"],
      imageUrl: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-50"
    },
    {
      name: "Durable Canvas Backpack",
      category: "Accessories",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "All Season",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.45,
      colors: ["Olive Green", "Charcoal"],
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      styleCode: "PF-ACC-51"
    }
  ];

  const products: SimpleProduct[] = [];
  const storeId = await getDefaultStoreId();
  const pool = getPool();

  console.log("Clearing previous database tables...");
  await pool.query("TRUNCATE TABLE customer_sessions, orders, receipts, products, product_discounts, exit_tokens_used, audit_log CASCADE");

  const existingProducts = new Map<string, { id: string; unitPrice: number }>();

  // Generate ~150 products combining styles and sizes
  let barcodeCounter = 8902000000000;
  const variantSizes = ["S", "M", "L"];
  let templateIndex = 0;

  for (const template of templates) {
    const price = randInt(template.priceMin, template.priceMax);
    const costPrice = Math.round(price * template.costPct);
    const inStock = randInt(20, 60);
    const demandScore = randInt(60, 95);
    const availableColors = template.colors ?? ["Black", "White", "Navy", "Olive"];

    for (const size of variantSizes) {
      const color = pick(availableColors);
      products.push({
        barcode: String(barcodeCounter++),
        name: template.name,
        category: template.category,
        styleCode: template.styleCode,
        size,
        color,
        brand: template.brand,
        season: template.season,
        gender: template.gender,
        unitPrice: price,
        costPrice,
        taxPercent: 5,
        inStock,
        demandScore,
        imageUrl: template.imageUrl
      });
    }
    templateIndex += 1;
  }

  // Insert products using createProduct or update existing items by barcode
  const created = [] as { id: string; unitPrice: number }[];
  for (const p of products) {
    const existing = existingProducts.get(p.barcode);
    if (existing) {
      try {
        const fallbackImageUrl = placeholderImageUrl(p.name);
        let imageUrlToUse = p.imageUrl?.trim() || fallbackImageUrl;
        const status = productImageStorageStatus();
        if (status.configured && p.imageUrl) {
          try {
            const { buffer, contentType } = await fetchBuffer(p.imageUrl);
            const ext = extFromContentType(contentType, p.imageUrl);
            const uploaded = await uploadProductImageToStorage(buffer, ext, contentType || `image/${ext}`);
            imageUrlToUse = uploaded;
          } catch (err) {
            console.warn("Image upload failed for", p.imageUrl, err instanceof Error ? err.message : err);
            imageUrlToUse = fallbackImageUrl;
          }
        }

        const c = await updateProductDetails(existing.id, {
          barcode: p.barcode,
          name: p.name,
          category: p.category,
          styleCode: p.styleCode,
          size: p.size,
          color: p.color,
          brand: p.brand,
          season: p.season,
          gender: p.gender,
          unitPrice: p.unitPrice,
          costPrice: p.costPrice,
          reorderLevel: 10,
          taxPercent: p.taxPercent,
          demandScore: p.demandScore,
          imageUrl: imageUrlToUse
        });
        if (c) {
          await updateProductStock(c.id, p.inStock);
          created.push({ id: c.id, unitPrice: c.unitPrice });
          console.log("Updated:", c.name, c.sku || c.id);
          continue;
        }
      } catch (err) {
        console.warn("Failed to update existing product", p.barcode, err instanceof Error ? err.message : err);
      }
    }

    try {
      const fallbackImageUrl = placeholderImageUrl(p.name);
      let imageUrlToUse = p.imageUrl?.trim() || fallbackImageUrl;
      const status = productImageStorageStatus();
      if (status.configured && p.imageUrl) {
        try {
          const { buffer, contentType } = await fetchBuffer(p.imageUrl);
          const ext = extFromContentType(contentType, p.imageUrl);
          const uploaded = await uploadProductImageToStorage(buffer, ext, contentType || `image/${ext}`);
          imageUrlToUse = uploaded;
        } catch (err) {
          console.warn("Image upload failed for", p.imageUrl, err instanceof Error ? err.message : err);
          imageUrlToUse = fallbackImageUrl;
        }
      }

      const c = await createProduct(
        {
          barcode: p.barcode,
          name: p.name,
          category: p.category,
          styleCode: p.styleCode,
          size: p.size,
          color: p.color,
          brand: p.brand,
          season: p.season,
          gender: p.gender,
          unitPrice: p.unitPrice,
          costPrice: p.costPrice,
          taxPercent: p.taxPercent,
          inStock: p.inStock,
          demandScore: p.demandScore,
          imageUrl: imageUrlToUse,
          reorderLevel: 10
        },
        "seed-script"
      );
      created.push({ id: c.id, unitPrice: c.unitPrice });
      existingProducts.set(p.barcode, { id: c.id, unitPrice: c.unitPrice });
      console.log("Created:", c.name, c.sku || c.id);
    } catch (err) {
      const duplicateRow = await getPool().query<{ id: string; barcode: string; unit_price: string }>(
        "SELECT id, barcode, unit_price FROM products WHERE store_id = $1 AND barcode = $2 AND is_active = TRUE LIMIT 1",
        [storeId, p.barcode]
      );
      if (duplicateRow.rows[0]) {
        const row = duplicateRow.rows[0];
        const fallback = { id: row.id, unitPrice: Number(row.unit_price) };
        created.push(fallback);
        existingProducts.set(row.barcode, fallback);
        continue;
      }
      console.error("Failed to create product", p.name, err instanceof Error ? err.message : err);
    }
  }

  // Seed orders across last 30 days (simulate shoppers in Bengaluru)
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const orderCount = randInt(200, 350);
  console.log(`Seeding ${orderCount} orders across last 30 days...`);

  const availableProducts = created.length > 0
    ? created
    : (await pool.query<{ id: string; unit_price: string }>(
        "SELECT id, unit_price FROM products WHERE store_id = $1 AND is_active = TRUE",
        [storeId]
      )).rows.map((row) => ({ id: row.id, unitPrice: Number(row.unit_price) }));

  for (let i = 0; i < orderCount; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const ts = new Date(now - daysAgo * DAY - randInt(0, DAY - 1));
    const linesCount = randInt(1, 3);
    const chosen = [] as { productId: string; qty: number; unitPrice: number }[];
    for (let l = 0; l < linesCount; l++) {
      const p = pick(availableProducts);
      const qty = randInt(1, 3);
      chosen.push({ productId: p.id, qty, unitPrice: p.unitPrice });
    }

    const subtotal = chosen.reduce((s, x) => s + x.unitPrice * x.qty, 0);
    const taxTotal = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + taxTotal;

    const session = await createSession("BLR001");
    const orderId = randomUUID();
    const token = await nextCounterToken().catch(() => undefined);

    const order = {
      id: orderId,
      sessionId: session.id,
      storeCode: "BLR001",
      total,
      subtotal,
      taxTotal,
      lines: chosen.map((c) => ({ productId: c.productId, name: "", qty: c.qty, unitPrice: c.unitPrice, taxPercent: 5, lineSubtotal: c.unitPrice * c.qty, lineTax: Math.round(c.unitPrice * c.qty * 0.05 * 100) / 100, lineTotal: Math.round((c.unitPrice * c.qty) * 1.05 * 100) / 100 })),
      paymentMode: Math.random() < 0.8 ? ("COUNTER" as const) : ("ONLINE" as const),
      paid: Math.random() < 0.9,
      tokenNumber: token ?? undefined,
      createdAt: ts.toISOString(),
      voided: false,
      refunded: false,
      receiptEmail: null,
      receiptPhone: null
    } as any;

    try {
      await createOrder(order);
    } catch (err) {
      console.error("Failed to insert order", err instanceof Error ? err.message : err);
    }
  }

  console.log("Seeding complete. Created products:", created.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
