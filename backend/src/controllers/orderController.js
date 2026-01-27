import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  const { products } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in order" });
  }

  let totalPrice = 0;
  for (const item of products) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "Product not found" });
    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    buyer: req.user._id,
    products,
    totalPrice,
  });

  res.status(201).json(order);
};

export const getBuyerOrders = async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate(
    "products.product",
  );
  res.json(orders);
};

export const getSellerOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("products.product")
    .populate("buyer", "name email");

  const sellerOrders = orders.filter((order) =>
    order.products.some(
      (item) => item.product.seller.toString() === req.user._id.toString(),
    ),
  );

  res.json(sellerOrders);
};

export const cancelBuyerOrder = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    buyer: req.user._id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Only pending orders can be cancelled" });
  }

  order.status = "cancelled";
  await order.save();

  res.json({ message: "Order cancelled successfully", order });
};

export const updateSellerProductStatus = async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  if (!["pending", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const order = await Order.findById(orderId).populate("products.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  let updated = false;

  order.products.forEach((item) => {
    if (item.product.seller.toString() === req.user._id.toString()) {
      item.status = status;
      updated = true;
    }
  });

  if (!updated) {
    return res
      .status(403)
      .json({ message: "You do not own any product in this order" });
  }

  // Auto-update overall order status
  const allCompleted = order.products.every(
    (item) => item.status === "completed",
  );

  const anyCancelled = order.products.some(
    (item) => item.status === "cancelled",
  );

  if (allCompleted) {
    order.orderStatus = "completed";
  } else if (anyCancelled) {
    order.orderStatus = "cancelled";
  } else {
    order.orderStatus = "pending";
  }

  await order.save();
  res.json(order);
};

export const updateBuyerOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!["cancelled"].includes(status)) {
    return res.status(400).json({ message: "Only cancellation allowed" });
  }

  const order = await Order.findOne({
    _id: orderId,
    buyer: req.user._id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.orderStatus !== "pending") {
    return res.status(400).json({ message: "Order can no longer be modified" });
  }

  order.orderStatus = "cancelled";
  order.products.forEach((item) => (item.status = "cancelled"));

  await order.save();
  res.json(order);
};
