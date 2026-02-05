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

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
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
    res.send("Hello world")
})



app.use(notFound);
app.use(errorHandler);

export default app;