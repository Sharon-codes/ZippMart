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
  console.log("Seeding full apparel catalog (70 clothing items) and 1 month of orders for BLR001...");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required. Set it in services/api/.env or environment.");
    process.exit(1);
  }

  // Make sure API's default store code targets BLR001 or set DEFAULT_STORE_CODE=BLR001
  process.env.DEFAULT_STORE_CODE = process.env.DEFAULT_STORE_CODE || "BLR001";

  const seasons = ["All Season", "Summer", "Autumn", "Winter", "Spring"];
  const sizes = ["S", "M", "L", "XL"];

  const templates = [
    // 1-12: Men's Tops & Shirts
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
      imageUrl: "/images/products/clothing_01.jpg",
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
      imageUrl: "/images/products/clothing_02.jpg",
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
      imageUrl: "/images/products/clothing_03.jpg",
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
      imageUrl: "/images/products/clothing_04.jpg",
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
      imageUrl: "/images/products/clothing_05.jpg",
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
      imageUrl: "/images/products/clothing_06.jpg",
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
      imageUrl: "/images/products/clothing_07.jpg",
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
      imageUrl: "/images/products/clothing_08.jpg",
      styleCode: "PF-MSH-08"
    },
    {
      name: "Handloom Cotton Kurta",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Men",
      season: "All Season",
      priceMin: 1399,
      priceMax: 1399,
      costPct: 0.42,
      colors: ["Crimson", "Saffron", "Ivory"],
      imageUrl: "/images/products/clothing_09.jpg",
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
      imageUrl: "/images/products/clothing_10.jpg",
      styleCode: "PF-MSH-10"
    },
    {
      name: "Flannel Plaid Overshirt",
      category: "Apparel",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Autumn",
      priceMin: 1799,
      priceMax: 1799,
      costPct: 0.42,
      colors: ["Red Plaid", "Green Plaid"],
      imageUrl: "/images/products/clothing_11.jpg",
      styleCode: "PF-MSH-11"
    },
    {
      name: "Slim Fit Graphic Streetwear Tee",
      category: "Apparel",
      brand: "Urban Weave",
      gender: "Men",
      season: "Summer",
      priceMin: 899,
      priceMax: 899,
      costPct: 0.36,
      colors: ["Black", "Acid Wash Grey"],
      imageUrl: "/images/products/clothing_12.jpg",
      styleCode: "PF-MSH-12"
    },

    // 13-22: Women's Tops & Blouses
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
      imageUrl: "/images/products/clothing_13.jpg",
      styleCode: "PF-WBL-13"
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
      imageUrl: "/images/products/clothing_14.jpg",
      styleCode: "PF-WBL-14"
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
      imageUrl: "/images/products/clothing_15.jpg",
      styleCode: "PF-WBL-15"
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
      imageUrl: "/images/products/clothing_16.jpg",
      styleCode: "PF-WBL-16"
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
      imageUrl: "/images/products/clothing_17.jpg",
      styleCode: "PF-WBL-17"
    },
    {
      name: "Boho Floral Chiffon Blouse",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "Spring",
      priceMin: 1699,
      priceMax: 1699,
      costPct: 0.41,
      colors: ["Peach Floral", "Lavender Floral"],
      imageUrl: "/images/products/clothing_18.jpg",
      styleCode: "PF-WBL-18"
    },
    {
      name: "Oversized Satin Button-Down Shirt",
      category: "Apparel",
      brand: "Silk Route",
      gender: "Women",
      season: "All Season",
      priceMin: 2199,
      priceMax: 2199,
      costPct: 0.44,
      colors: ["Emerald", "Bronze"],
      imageUrl: "/images/products/clothing_19.jpg",
      styleCode: "PF-WBL-19"
    },
    {
      name: "Lace Trim V-Neck Tank Top",
      category: "Apparel",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 999,
      priceMax: 999,
      costPct: 0.37,
      colors: ["Ivory", "Dusty Rose"],
      imageUrl: "/images/products/clothing_20.jpg",
      styleCode: "PF-WBL-20"
    },
    {
      name: "Sleeveless Ribbed Crop Top",
      category: "Activewear",
      brand: "Bengaluru Basics",
      gender: "Women",
      season: "Summer",
      priceMin: 699,
      priceMax: 699,
      costPct: 0.34,
      colors: ["Black", "Lilac"],
      imageUrl: "/images/products/clothing_21.jpg",
      styleCode: "PF-WBL-21"
    },
    {
      name: "Embroidered Georgette Tunic",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 1799,
      priceMax: 1799,
      costPct: 0.42,
      colors: ["Mustard", "Maroon"],
      imageUrl: "/images/products/clothing_22.jpg",
      styleCode: "PF-WBL-22"
    },

    // 23-34: Women's Dresses & Ethnicwear
    {
      name: "Floral Print Summer Dress",
      category: "Dresses",
      brand: "Silk Route",
      gender: "Women",
      season: "Summer",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.42,
      colors: ["Yellow-Floral", "Blue-Floral"],
      imageUrl: "/images/products/clothing_23.jpg",
      styleCode: "PF-WDR-23"
    },
    {
      name: "Linen Wrap Midi Dress",
      category: "Dresses",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 2999,
      priceMax: 2999,
      costPct: 0.45,
      colors: ["Beige", "Soft Pink", "Navy"],
      imageUrl: "/images/products/clothing_24.jpg",
      styleCode: "PF-WDR-24"
    },
    {
      name: "Silk Embroidered Kurti",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 1899,
      priceMax: 1899,
      costPct: 0.43,
      colors: ["Red", "Royal Blue", "Teal"],
      imageUrl: "/images/products/clothing_25.jpg",
      styleCode: "PF-WDR-25"
    },
    {
      name: "Chiffon Pleated Maxi Dress",
      category: "Dresses",
      brand: "Silk Route",
      gender: "Women",
      season: "Spring",
      priceMin: 3499,
      priceMax: 3499,
      costPct: 0.47,
      colors: ["Lavender", "Blush Pink"],
      imageUrl: "/images/products/clothing_26.jpg",
      styleCode: "PF-WDR-26"
    },
    {
      name: "Tiered Cotton Sundress",
      category: "Dresses",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Summer",
      priceMin: 2299,
      priceMax: 2299,
      costPct: 0.40,
      colors: ["Pink", "Sage Green"],
      imageUrl: "/images/products/clothing_27.jpg",
      styleCode: "PF-WDR-27"
    },
    {
      name: "Emerald Silk Anarkali Suit",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 4999,
      priceMax: 4999,
      costPct: 0.50,
      colors: ["Emerald Green", "Ruby Red"],
      imageUrl: "/images/products/clothing_28.jpg",
      styleCode: "PF-WDR-28"
    },
    {
      name: "Velvet Cocktail Party Dress",
      category: "Dresses",
      brand: "Silk Route",
      gender: "Women",
      season: "Winter",
      priceMin: 3999,
      priceMax: 3999,
      costPct: 0.48,
      colors: ["Midnight Blue", "Wine Red"],
      imageUrl: "/images/products/clothing_29.jpg",
      styleCode: "PF-WDR-29"
    },
    {
      name: "Handblock Printed Saree",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Women",
      season: "Festive",
      priceMin: 3299,
      priceMax: 3299,
      costPct: 0.46,
      colors: ["Indigo Print", "Ajrakh Red"],
      imageUrl: "/images/products/clothing_30.jpg",
      styleCode: "PF-WDR-30"
    },
    {
      name: "Polka Dot A-Line Shirt Dress",
      category: "Dresses",
      brand: "Cotton Collective",
      gender: "Women",
      season: "Spring",
      priceMin: 2199,
      priceMax: 2199,
      costPct: 0.41,
      colors: ["Black-White", "Navy-White"],
      imageUrl: "/images/products/clothing_31.jpg",
      styleCode: "PF-WDR-31"
    },
    {
      name: "Ribbed Bodycon Knit Dress",
      category: "Dresses",
      brand: "Bengaluru Basics",
      gender: "Women",
      season: "Autumn",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.40,
      colors: ["Camel", "Charcoal"],
      imageUrl: "/images/products/clothing_32.jpg",
      styleCode: "PF-WDR-32"
    },
    {
      name: "Chikankari Cotton Kurta Set",
      category: "Ethnicwear",
      brand: "Indie Looms",
      gender: "Women",
      season: "Summer",
      priceMin: 2799,
      priceMax: 2799,
      costPct: 0.44,
      colors: ["Sky Blue", "White"],
      imageUrl: "/images/products/clothing_33.jpg",
      styleCode: "PF-WDR-33"
    },
    {
      name: "Satin Evening Slip Dress",
      category: "Dresses",
      brand: "Silk Route",
      gender: "Women",
      season: "All Season",
      priceMin: 3199,
      priceMax: 3199,
      costPct: 0.45,
      colors: ["Black", "Champagne Gold"],
      imageUrl: "/images/products/clothing_34.jpg",
      styleCode: "PF-WDR-34"
    },

    // 35-46: Bottomwear (Jeans, Trousers, Skirts, Shorts)
    {
      name: "Slim Fit Indigo Jeans",
      category: "Bottomwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2499,
      priceMax: 2499,
      costPct: 0.45,
      colors: ["Indigo"],
      imageUrl: "/images/products/clothing_35.jpg",
      styleCode: "PF-PAN-35"
    },
    {
      name: "Vintage Stonewash Jeans",
      category: "Bottomwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2799,
      priceMax: 2799,
      costPct: 0.46,
      colors: ["Light Wash"],
      imageUrl: "/images/products/clothing_36.jpg",
      styleCode: "PF-PAN-36"
    },
    {
      name: "Utility Khaki Chinos",
      category: "Bottomwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.42,
      colors: ["Khaki", "Navy"],
      imageUrl: "/images/products/clothing_37.jpg",
      styleCode: "PF-PAN-37"
    },
    {
      name: "Off-White Linen Trousers",
      category: "Bottomwear",
      brand: "Cotton Collective",
      gender: "Unisex",
      season: "Summer",
      priceMin: 2299,
      priceMax: 2299,
      costPct: 0.44,
      colors: ["Off-White"],
      imageUrl: "/images/products/clothing_38.jpg",
      styleCode: "PF-PAN-38"
    },
    {
      name: "Charcoal Tailored Trousers",
      category: "Bottomwear",
      brand: "Urban Weave",
      gender: "Men",
      season: "All Season",
      priceMin: 2599,
      priceMax: 2599,
      costPct: 0.45,
      colors: ["Charcoal", "Black"],
      imageUrl: "/images/products/clothing_39.jpg",
      styleCode: "PF-PAN-39"
    },
    {
      name: "Forest Green Pleated Skirt",
      category: "Bottomwear",
      brand: "Silk Route",
      gender: "Women",
      season: "Autumn",
      priceMin: 1799,
      priceMax: 1799,
      costPct: 0.40,
      colors: ["Forest Green"],
      imageUrl: "/images/products/clothing_40.jpg",
      styleCode: "PF-PAN-40"
    },
    {
      name: "Denim Button-Up A-Line Skirt",
      category: "Bottomwear",
      brand: "Cotton Collective",
      gender: "Women",
      season: "All Season",
      priceMin: 1699,
      priceMax: 1699,
      costPct: 0.42,
      colors: ["Denim Blue"],
      imageUrl: "/images/products/clothing_41.jpg",
      styleCode: "PF-PAN-41"
    },
    {
      name: "Black Wide-Leg Trousers",
      category: "Bottomwear",
      brand: "Silk Route",
      gender: "Women",
      season: "All Season",
      priceMin: 2199,
      priceMax: 2199,
      costPct: 0.44,
      colors: ["Black"],
      imageUrl: "/images/products/clothing_42.jpg",
      styleCode: "PF-PAN-42"
    },
    {
      name: "Cotton Cargo Joggers",
      category: "Activewear",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "All Season",
      priceMin: 1899,
      priceMax: 1899,
      costPct: 0.42,
      colors: ["Olive", "Black"],
      imageUrl: "/images/products/clothing_43.jpg",
      styleCode: "PF-PAN-43"
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
      imageUrl: "/images/products/clothing_44.jpg",
      styleCode: "PF-PAN-44"
    },
    {
      name: "High-Waisted Mom Jeans",
      category: "Bottomwear",
      brand: "Urban Weave",
      gender: "Women",
      season: "All Season",
      priceMin: 2399,
      priceMax: 2399,
      costPct: 0.44,
      colors: ["Vintage Wash Blue"],
      imageUrl: "/images/products/clothing_45.jpg",
      styleCode: "PF-PAN-45"
    },
    {
      name: "Performance Athletic Shorts",
      category: "Activewear",
      brand: "Bengaluru Basics",
      gender: "Men",
      season: "Summer",
      priceMin: 899,
      priceMax: 899,
      costPct: 0.35,
      colors: ["Charcoal Grey", "Navy"],
      imageUrl: "/images/products/clothing_46.jpg",
      styleCode: "PF-PAN-46"
    },

    // 47-58: Outerwear & Sweaters
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
      imageUrl: "/images/products/clothing_47.jpg",
      styleCode: "PF-OUT-47"
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
      imageUrl: "/images/products/clothing_48.jpg",
      styleCode: "PF-OUT-48"
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
      imageUrl: "/images/products/clothing_49.jpg",
      styleCode: "PF-OUT-49"
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
      imageUrl: "/images/products/clothing_50.jpg",
      styleCode: "PF-OUT-50"
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
      imageUrl: "/images/products/clothing_51.jpg",
      styleCode: "PF-OUT-51"
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
      imageUrl: "/images/products/clothing_52.jpg",
      styleCode: "PF-OUT-52"
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
      imageUrl: "/images/products/clothing_53.jpg",
      styleCode: "PF-OUT-53"
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
      imageUrl: "/images/products/clothing_54.jpg",
      styleCode: "PF-OUT-54"
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
      imageUrl: "/images/products/clothing_55.jpg",
      styleCode: "PF-OUT-55"
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
      imageUrl: "/images/products/clothing_56.jpg",
      styleCode: "PF-OUT-56"
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
      imageUrl: "/images/products/clothing_57.jpg",
      styleCode: "PF-OUT-57"
    },
    {
      name: "Double-Breasted Trench Coat",
      category: "Outerwear",
      brand: "Silk Route",
      gender: "Women",
      season: "Autumn",
      priceMin: 5499,
      priceMax: 5499,
      costPct: 0.50,
      colors: ["Beige", "Black"],
      imageUrl: "/images/products/clothing_58.jpg",
      styleCode: "PF-OUT-58"
    },

    // 59-70: Accessories & Footwear
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
      imageUrl: "/images/products/clothing_59.jpg",
      styleCode: "PF-ACC-59"
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
      imageUrl: "/images/products/clothing_60.jpg",
      styleCode: "PF-ACC-60"
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
      imageUrl: "/images/products/clothing_61.jpg",
      styleCode: "PF-ACC-61"
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
      imageUrl: "/images/products/clothing_62.jpg",
      styleCode: "PF-ACC-62"
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
      imageUrl: "/images/products/clothing_63.jpg",
      styleCode: "PF-ACC-63"
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
      imageUrl: "/images/products/clothing_64.jpg",
      styleCode: "PF-ACC-64"
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
      imageUrl: "/images/products/clothing_65.jpg",
      styleCode: "PF-ACC-65"
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
      imageUrl: "/images/products/clothing_66.jpg",
      styleCode: "PF-ACC-66"
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
      imageUrl: "/images/products/clothing_67.jpg",
      styleCode: "PF-ACC-67"
    },
    {
      name: "Classic Leather Chelsea Boots",
      category: "Shoes",
      brand: "Urban Weave",
      gender: "Men",
      season: "Winter",
      priceMin: 4299,
      priceMax: 4299,
      costPct: 0.48,
      colors: ["Dark Brown", "Black"],
      imageUrl: "/images/products/clothing_68.jpg",
      styleCode: "PF-SHO-68"
    },
    {
      name: "Canvas Low-Top Sneakers",
      category: "Shoes",
      brand: "Bengaluru Basics",
      gender: "Unisex",
      season: "All Season",
      priceMin: 1999,
      priceMax: 1999,
      costPct: 0.40,
      colors: ["Off-White", "Black"],
      imageUrl: "/images/products/clothing_69.jpg",
      styleCode: "PF-SHO-69"
    },
    {
      name: "Polarized Retro Sunglasses",
      category: "Accessories",
      brand: "Silk Route",
      gender: "Unisex",
      season: "Summer",
      priceMin: 1499,
      priceMax: 1499,
      costPct: 0.38,
      colors: ["Tortoise Shell", "Matte Black"],
      imageUrl: "/images/products/clothing_70.jpg",
      styleCode: "PF-ACC-70"
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
