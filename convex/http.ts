import { httpRouter } from "convex/server";
import { webhook } from "./booksStripe";

const http = httpRouter();

// Stripe → https://<deployment>.convex.site/stripe/webhook
http.route({ path: "/stripe/webhook", method: "POST", handler: webhook });

export default http;
