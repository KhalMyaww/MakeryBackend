import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.ts";
import shopRoutes from "./routes/shop.routes.ts";
import categoryRoutes from "./routes/category.routes.ts";
import productRoutes from "./routes/product.routes.ts";
import uploadRoutes from "./routes/upload.routes.ts";
import orderRoutes from "./routes/order.routes.ts";
import comparisonRoutes from "./routes/comparison.routes.ts";
import dashboardRoutes from "./routes/dashboard.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.ts";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {res.json
    ({message: "Makery API berhasil dijalankan!"});
});
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/comparisons", comparisonRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
