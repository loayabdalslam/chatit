/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminInit from "../adminInit.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as chatbots from "../chatbots.js";
import type * as contact from "../contact.js";
import type * as conversations from "../conversations.js";
import type * as documents from "../documents.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as landing from "../landing.js";
import type * as payments from "../payments.js";
import type * as referrals from "../referrals.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as sentiment from "../sentiment.js";
import type * as subscriptions from "../subscriptions.js";
import type * as testData from "../testData.js";
import type * as widgets from "../widgets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminInit: typeof adminInit;
  ai: typeof ai;
  analytics: typeof analytics;
  auth: typeof auth;
  chat: typeof chat;
  chatbots: typeof chatbots;
  contact: typeof contact;
  conversations: typeof conversations;
  documents: typeof documents;
  files: typeof files;
  http: typeof http;
  landing: typeof landing;
  payments: typeof payments;
  referrals: typeof referrals;
  reports: typeof reports;
  router: typeof router;
  sentiment: typeof sentiment;
  subscriptions: typeof subscriptions;
  testData: typeof testData;
  widgets: typeof widgets;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
