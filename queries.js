const Client = require("./models/Client");
const Order = require("./models/Order");
const Product = require("./models/Product");
const CalendarEvent = require("./models/CalendarEvent");
const Account = require("./models/Account");

// Get all data from a target collection
async function getAllDataFromTarget(target) {
  const models = {
    clients: Client,
    orders: Order,
    calendar: CalendarEvent
  };
  return await models[target].find({});
}

// Get all clients and their order count
async function getAllClientsWithOrdersCount() {
  const clients = await Client.find({});
  const counts = await Order.aggregate([
    { $group: { _id: "$client_id", ordersCount: { $sum: 1 } } }
  ]);
  return { clients, counts };
}

async function getOrdersById(orderId) {
  return await Order.findById(orderId);
}

async function addNewOrder(orderDetails, clientId, totalCost, date) {
  const newOrder = new Order({
    client_id: clientId,
    date,
    price: totalCost,
    status: orderDetails.status,
    worker: orderDetails.worker
  });
  const saved = await newOrder.save();
  return saved._id;
}

async function getClientById(clientId) {
  return await Client.findById(clientId);
}

async function getProductById(productId) {
  return await Product.findById(productId);
}

async function getOrdersByClientId(clientId) {
  return await Order.find({ client_id: clientId });
}

async function getProductsBySingleOrderId(orderId) {
  return await Product.find({ order_id: orderId });
}

async function getProductsByMultipleOrderId(orders) {
  const orderIds = orders.map(o => o._id);
  return await Product.find({ order_id: { $in: orderIds } });
}

async function updateClientById(clientData, clientId) {
  await Client.findByIdAndUpdate(clientId, {
    client: clientData.client,
    clientDetails: clientData.clientDetails,
    phone: clientData.phone,
    country: clientData.country,
    street: clientData.street,
    city: clientData.city,
    postalCode: clientData.postalCode
  });
  return "success";
}

async function updateOrderById(totalCost, orderStatus, orderId) {
  await Order.findByIdAndUpdate(orderId, {
    price: totalCost,
    status: orderStatus
  });
  return "success";
}

async function addMultipleProducts(orderId, productsArray) {
  for (const p of productsArray) {
    const exists = await Product.findOne({ _id: p.id });
    if (!exists) {
      const newProduct = new Product({
        order_id: orderId,
        productName: p.productName,
        amount: p.amount,
        itemPrice: p.itemPrice,
        totalPrice: p.amount * p.itemPrice
      });
      await newProduct.save();
    }
  }
  return "success";
}

async function deleteProductsById(deletedIds) {
  await Product.deleteMany({ _id: { $in: deletedIds } });
  return "success";
}

async function addNewClient(clientDetails) {
  const newClient = new Client({
    client: clientDetails.clientName,
    clientDetails: clientDetails.clientDetails,
    phone: clientDetails.phone,
    country: clientDetails.country,
    street: clientDetails.street,
    city: clientDetails.city,
    postalCode: clientDetails.postalCode,
    createdAt: new Date()
  });
  const saved = await newClient.save();
  return saved._id;
}

async function getDasboardData() {
  const clients = await Client.find({});
  const orders = await Order.find({});
  const calendar = await CalendarEvent.find({
    deadlineDate: { $gte: new Date() }
  }).sort("deadlineDate").limit(2);
  return [clients, orders, calendar];
}

async function addNewEvent(eventData) {
  const newEvent = new CalendarEvent(eventData);
  await newEvent.save();
  return "success";
}

async function deleteUserById(userId) {
  await Account.findByIdAndDelete(userId);
  return "success";
}

async function getUsersForAdminPanel() {
  return await Account.find({}, "id username role dateCreated");
}

async function createNewUser(userDetails, hashedPassword) {
  const newUser = new Account({
    username: userDetails.username,
    password: hashedPassword,
    role: userDetails.role,
    dateCreated: new Date()
  });
  await newUser.save();
  return "success";
}

module.exports = {
  getAllDataFromTarget,
  getOrdersById,
  getClientById,
  getOrdersByClientId,
  getProductsBySingleOrderId,
  getProductsByMultipleOrderId,
  deleteProductsById,
  addMultipleProducts,
  updateOrderById,
  updateClientById,
  getAllClientsWithOrdersCount,
  addNewClient,
  addNewOrder,
  getDasboardData,
  addNewEvent,
  deleteUserById,
  getUsersForAdminPanel,
  createNewUser
};
