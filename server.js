require("dotenv").config();

const express = require("express");
const session = require("express-session");
const flash = require("express-flash");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

const {
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
  getDasboardData,
  addNewEvent,
  addNewOrder,
  deleteUserById,
  getUsersForAdminPanel,
  createNewUser
} = require("./queries.js");

// DATABASE CONNECTION (MongoDB with Mongoose)
mongoose.connect("mongodb+srv://ashtosh:jqZ2SAJt7vQe731t@cluster0.j3bwoss.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// CONFIGURING OPTIONS
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200
};

const initializePassport = require('./passport-config');
initializePassport(passport); // passport-config must be updated to work with MongoDB

app.use(cors(corsOptions));
app.use(flash());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// LOGIN
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send("success");
});

app.get('/logout', (req, res) => {
  req.logout();
  res.send("success");
});

app.get('/user', (req, res) => {
  res.send(req.user);
});

// ORDERS
app.get("/orders", async (req, res) => {
  const orders = await getAllDataFromTarget("orders");
  const clients = await getAllDataFromTarget("clients");
  const merged = orders.map(order => ({
    ...order.toObject(),
    ...clients.find(client => client._id.toString() === order.client_id.toString())?.toObject()
  }));
  res.send(merged);
});

// ORDER BY ID
app.get("/order_by_id", async (req, res) => {
  const orderId = req.query.id;
  const order = await getOrdersById(orderId);
  const products = await getProductsBySingleOrderId(orderId);
  const client = await getClientById(order.client_id);
  res.send([order, products, client]);
});

// CREATE NEW ORDER
app.post("/neworder", async (req, res) => {
  const { clientDetails, isNewClient, oldClientId } = req.body;
  const productsData = clientDetails.products;
  const totalCost = productsData.reduce((sum, p) => sum + (p.itemPrice * p.amount || 0), 0);
  const date = new Date();

  if (isNewClient) {
    const newClient = await addNewClient(clientDetails);
    const newOrder = await addNewOrder(clientDetails, newClient._id, totalCost, date);
    await addMultipleProducts(newOrder._id, productsData);
    res.send("success");
  } else {
    const newOrder = await addNewOrder(clientDetails, oldClientId, totalCost, date);
    await addMultipleProducts(newOrder._id, productsData);
    res.send("success");
  }
});

// UPDATE ORDER
app.post("/updateorder", async (req, res) => {
  const { orderId, clientDetails, deletedItems } = req.body;
  const { client, order, products } = clientDetails;
  const totalCost = products.reduce((sum, p) => sum + (p.itemPrice * p.amount || 0), 0);

  await updateClientById(client, order.client_id);
  await updateOrderById(totalCost, order.status, orderId);
  await addMultipleProducts(orderId, products);

  if (deletedItems.ids.length > 0) {
    await deleteProductsById(deletedItems.ids);
  }

  res.send("success");
});

// ALL CLIENTS
app.get("/clients", async (req, res) => {
  const clients = await getAllClientsWithOrdersCount();
  res.send(clients);
});

// ADD CLIENT
app.post("/newclient", async (req, res) => {
  const newClient = await addNewClient(req.body.clientDetails);
  res.send("success");
});

// CLIENT BY ID
app.get("/client_by_id", async (req, res) => {
  const clientId = req.query.id;
  const client = await getClientById(clientId);
  const orders = await getOrdersByClientId(clientId);
  const products = await getProductsByMultipleOrderId(orders);
  res.send([client, orders, products]);
});

// DASHBOARD DATA
app.get("/dashboard_data", async (req, res) => {
  const dashboardData = await getDasboardData();
  res.send(dashboardData);
});

// ADD NEW EVENT
app.post("/newevent", async (req, res) => {
  await addNewEvent(req.body.eventData);
  res.send("success");
});

// GET ALL EVENTS
app.get("/events", async (req, res) => {
  const events = await getAllDataFromTarget("calendar");
  res.send(events);
});

// GET USERS FOR ADMIN PANEL
app.get("/getusers", async (req, res) => {
  const users = await getUsersForAdminPanel();
  res.send(users);
});

// DELETE USER
app.post("/deleteuser", async (req, res) => {
  await deleteUserById(req.body.userId);
  res.send("success");
});

// CREATE USER
app.post("/newuser", async (req, res) => {
  const { userDetails } = req.body;
  const hashedPassword = await bcrypt.hash(userDetails.password, 10);
  await createNewUser(userDetails, hashedPassword);
  res.send("success");
});

// START SERVER
const port = 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
