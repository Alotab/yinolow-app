// src/controllers/product.controller.ts
import { Request, Response } from "express";
import { Product } from "../models/Product";
import { logger } from "../utils/logger";
import { redis } from "../lib/redis";
import slugify from "slugify";  


const PRODUCT_LIST_KEY = "products:all";   // store redis cache key under this name

// Create product (admin only)
export async function createProduct(req: Request, res: Response) {
  try {
    const { name, description, price, sku, images, stock } = req.body;
    if (!name || price == null) return res.status(400).json({ message: "name and price required" });

    const slug = slugify(name, { lower: true, strict: true });

    const newProduct = new Product({ name, description, price, sku, images, stock, slug });
    await newProduct.save();

    // 🧹 Invalidate cache when products change
    await redis.del(PRODUCT_LIST_KEY)

    logger.info("Product created successfully", newProduct);
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    logger.error("Error creating product", err);
    // console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// text search, filtering --> category, brand & price. Add pagination, sorting
export async function listProducts(req: Request, res: Response) {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
      sort,
      search,
    } = req.query;

    const cacheKey = `${PRODUCT_LIST_KEY}:${category || "all"}:${brand || "all"}:${minPrice || "0"}:${maxPrice || "max"}:${page}:${limit}:${sort || "default"}:${search || "none"}`;

    // 1️⃣ Try cache first
    const cache = await redis.get(cacheKey);
    if (cache) {
      logger.info(`Serving products from cache for ${cacheKey}`);
      return res.json(JSON.parse(cache));
    }

    // 2️⃣ Build filters
    const filter: any = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    // ✅ Text search addition
    if (search) {
      filter.$text = { $search: search.toString() };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 3️⃣ Pagination & sorting
    const skip = (Number(page) - 1) * Number(limit);
    const sortOption: any = {};
    if (sort === "price_asc") sortOption.price = 1;
    else if (sort === "price_desc") sortOption.price = -1;
    else sortOption.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Product.countDocuments(filter);

    const response = {
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      products,
    };

    // 4️⃣ Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(response), "EX", 600);

    res.json(response);
  } catch (err) {
    logger.error("Error fetching products", err);
    res.status(500).json({ message: "Server error" });
  }
}

// search product using slug: /products/iphone-15-pro
export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const cacheKey = `product:slug:${slug}`;

    const cache = await redis.get(cacheKey);
    if (cache) {
      logger.info(`Serving product ${slug} from cache`);
      return res.json(JSON.parse(cache));
    }

    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ message: "Product not found" });

    await redis.set(cacheKey, JSON.stringify(product), "EX", 600);
    res.json({ product });
  } catch (err) {
    logger.error("Error fetching product by slug", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) return res.status(404).json({ message: "Product not found" });

    await redis.del(PRODUCT_LIST_KEY);
    await redis.del(`product:${id}`);

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  
  const { id } = req.params;

  try {
    // Delete product from DB
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Invalidate cache
    await Promise.all([
      redis.del(PRODUCT_LIST_KEY),     // clear product list
      redis.del(`product:${id}`)       // clear single product cache
    ]);

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    logger.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};










// export async function listProducts(req: Request, res: Response) {
//   try {
//     // Try Redis cache 
//     const cache = await redis.get(PRODUCT_LIST_KEY);
//     if (cache) {
//       logger.info("Serving from Redis cache");
//       return res.json(JSON.parse(cache));
//     }

//     // Fetch products from DB
//     const products = await Product.find().sort({ createdAt: -1 }).limit(100);

//     // Store in Redis (TTL: 10 mins)
//     await redis.set(PRODUCT_LIST_KEY, JSON.stringify(products), "EX", 600)

//     return res.json({ products });
//   } catch (err) {
//     logger.error("Error fetching products", err);
//     console.error(err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }



// export async function getProduct(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     const cacheKey = `product:${id}`;

//     const cache = await redis.get(cacheKey);
//     if (cache) {
//       logger.info(`Serving product ${id} from cache`);
//       return res.json(JSON.parse(cache));
//     }

//     const product = await Product.findById(id);
//     if (!product) return res.status(404).json({ message: "Not found" });

//     await redis.set(cacheKey, JSON.stringify(product), "EX", 600);

//     return res.json({ product: product });
//   } catch (err) {
//     console.error(err);
//     logger.error("Error fetching product", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }