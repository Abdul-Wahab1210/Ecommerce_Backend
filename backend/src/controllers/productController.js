import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json({ message: "Please upload at least one image" });
  }

  const imageUrls = req.files.map((file) => file.path);

  const product = await Product.create({
    name,
    description,
    price,
    images: imageUrls,
    seller: req.user._id,
    stock: stock,
    category: category,
  });

  res.status(201).json(product);
};

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("seller", "name email");
  res.json(products);
};

export const getSellerProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};

export const updateProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock ?? product.stock;
  product.category = category || product.category;

  if (req.files && req.files.length > 0) {
    product.images = req.files.map((file) => file.path);
  }

  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    seller: req.user._id,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json({ message: "Product deleted successfully" });
};
