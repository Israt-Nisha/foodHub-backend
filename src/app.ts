import express, {Application} from "express"
import { mealRouter } from "./modules/meal/meal.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"
import { providerRouter } from "./modules/provider/provider.router";
import { categoryRouter } from "./modules/category/category.router";
import { userRouter } from "./modules/user/user.router";
import { notFound } from "./middlewares/notFound";
import errorHandler from "./middlewares/globalErrorHandler";
import { cartRouter } from "./modules/cart/cart.router";
import { orderRouter } from "./modules/order/order.router";
import { reviewRouter } from "./modules/review/review.router";

const app: Application = express();

app.use(express.json());

const allowedOrigins = [
  process.env.APP_URL || "http://localhost:3000",
  process.env.PROD_APP_URL, // Production frontend URL
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowedOrigins or matches Vercel preview pattern
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/next-blog-client.*\.vercel\.app$/.test(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin); // Any Vercel deployment

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
  }),
);



app.all('/api/auth/{*splat}', toNodeHandler(auth));

app.use("/api/providers", providerRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/meals", mealRouter);

app.use("/api/carts", cartRouter);

app.use("/api/orders", orderRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/admin", userRouter);

app.get("/", (req, res) => {
    res.send("Hello from FoodHub server")
})



app.use(notFound);
app.use(errorHandler);

export default app;