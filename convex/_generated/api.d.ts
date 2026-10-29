/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as booksAccounts from "../booksAccounts.js";
import type * as booksAuth from "../booksAuth.js";
import type * as booksBank from "../booksBank.js";
import type * as booksContacts from "../booksContacts.js";
import type * as booksExpenses from "../booksExpenses.js";
import type * as booksInvoices from "../booksInvoices.js";
import type * as booksOpsLib from "../booksOpsLib.js";
import type * as booksReconcile from "../booksReconcile.js";
import type * as booksImport from "../booksImport.js";
import type * as booksImportLib from "../booksImportLib.js";
import type * as booksLedger from "../booksLedger.js";
import type * as booksLib from "../booksLib.js";
import type * as booksReports from "../booksReports.js";
import type * as caseStudies from "../caseStudies.js";
import type * as clipsToolkit from "../clipsToolkit.js";
import type * as email from "../email.js";
import type * as leads from "../leads.js";
import type * as posts from "../posts.js";
import type * as qualification from "../qualification.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  booksAccounts: typeof booksAccounts;
  booksAuth: typeof booksAuth;
  booksBank: typeof booksBank;
  booksContacts: typeof booksContacts;
  booksExpenses: typeof booksExpenses;
  booksInvoices: typeof booksInvoices;
  booksOpsLib: typeof booksOpsLib;
  booksReconcile: typeof booksReconcile;
  booksImport: typeof booksImport;
  booksImportLib: typeof booksImportLib;
  booksLedger: typeof booksLedger;
  booksLib: typeof booksLib;
  booksReports: typeof booksReports;
  caseStudies: typeof caseStudies;
  clipsToolkit: typeof clipsToolkit;
  email: typeof email;
  leads: typeof leads;
  posts: typeof posts;
  qualification: typeof qualification;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
