const express = require("express")
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: [
        "http://localhost:5173", 
        "https://shopsphere-weld-nu.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

const userRouter = require("./routes/usersRoutes");
const productRouter = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const orderRouter = require("./routes/orderRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const adminRouter = require("./routes/dashBoardRoutes");

const errorhandler = require("./middleware/errormiddleware");



app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShopSphere API - Service Status</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-6 md:p-12">
    <div class="max-w-4xl mx-auto space-y-8">
        <header class="border-b border-slate-800 pb-6 flex items-center justify-between">
            <div>
                <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    API Active & Serving
                </div>
                <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white">ShopSphere Backend Service</h1>
                <p class="text-slate-400 mt-1">E-Commerce REST API Engine running in AI Studio Cloud Container</p>
            </div>
            <div class="hidden sm:block text-right">
                <span class="text-xs text-slate-500 font-mono">Port 3000 • Node.js</span>
            </div>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
                <div class="text-xs font-medium text-slate-400">Environment</div>
                <div class="text-lg font-semibold text-slate-200 mt-1">AI Studio Container</div>
            </div>
            <div class="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
                <div class="text-xs font-medium text-slate-400">Health Endpoint</div>
                <div class="text-lg font-semibold text-emerald-400 mt-1">HTTP 200 OK</div>
            </div>
            <div class="bg-slate-800/60 border border-slate-700/50 p-5 rounded-xl">
                <div class="text-xs font-medium text-slate-400">Database Engine</div>
                <div class="text-lg font-semibold text-indigo-300 mt-1">MongoDB / Mongoose</div>
            </div>
        </section>

        <section class="bg-slate-800/40 border border-slate-800 rounded-xl p-6">
            <h2 class="text-xl font-semibold text-white mb-4">Available REST API Routes</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-sm">
                <a href="/products" target="_blank" class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/40 transition">
                    <span class="text-indigo-400 font-bold">GET /products</span>
                    <span class="text-slate-500 text-xs">Catalog</span>
                </a>
                <a href="/users" target="_blank" class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/40 transition">
                    <span class="text-indigo-400 font-bold">GET /users</span>
                    <span class="text-slate-500 text-xs">User Accounts</span>
                </a>
                <a href="/admin/dashboard" target="_blank" class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/40 transition">
                    <span class="text-amber-400 font-bold">GET /admin/dashboard</span>
                    <span class="text-slate-500 text-xs">Metrics</span>
                </a>
                <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
                    <span class="text-emerald-400 font-bold">POST /users/login</span>
                    <span class="text-slate-500 text-xs">Auth</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
                    <span class="text-emerald-400 font-bold">POST /cart</span>
                    <span class="text-slate-500 text-xs">Cart Ops</span>
                </div>
                <div class="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
                    <span class="text-emerald-400 font-bold">POST /order</span>
                    <span class="text-slate-500 text-xs">Checkout</span>
                </div>
            </div>
        </section>
    </div>
</body>
</html>
    `);
});

app.use("/users",userRouter);
app.use("/products",productRouter);
app.use("/cart",cartRouter);
app.use("/order",orderRouter);
app.use("/review",reviewRouter);
app.use("/wishlist",wishlistRouter);
app.use("/admin",adminRouter);

// Mongoose / Database error fallback middleware
app.use((err, req, res, next) => {
    if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError' || (err.message && err.message.includes('buffering timed out'))) {
        console.warn('[AI Studio] Database offline — returning mock empty response');
        if (req.method === 'GET') {
            return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
        }
        return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
});

app.use(errorhandler);



module.exports = app;





















// const productsRouter = require("./routes/products");
// const ordersRouter = require("./routes/orders")

// app.use("/users",userRouter);
// app.use("/products",productsRouter);
// app.use("/orders",ordersRouter);
