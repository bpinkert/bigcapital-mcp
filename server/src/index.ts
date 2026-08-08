#!/usr/bin/env node
/**
 * MCP Server generated from OpenAPI spec for bigcapital-mcp v1.0
 * Generated on: 2026-05-15T21:53:08.490Z
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
  type CallToolResult,
  type CallToolRequest
} from "@modelcontextprotocol/sdk/types.js";

import { z, ZodError } from 'zod';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { getAuthHeaders, forceRefresh } from './auth.js';

/**
 * Type definition for JSON objects
 */
type JsonObject = Record<string, any>;

/**
 * Interface for MCP Tool Definition
 */
interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
    method: string;
    pathTemplate: string;
    executionParameters: { name: string, in: string }[];
    requestBodyContentType?: string;
    securityRequirements: any[];
}

/**
 * Server configuration
 */
export const SERVER_NAME = "bigcapital-mcp";
export const SERVER_VERSION = "1.0";
// Base URL for the API, can be set via environment variable or determined from OpenAPI spec
export const API_BASE_URL = process.env.API_BASE_URL || "http://localhost";
console.error("API_BASE_URL is set to:", API_BASE_URL);

/**
 * MCP Server instance
 */
const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
);

/**
 * Map of tool definitions by name
 */
const toolDefinitionMap: Map<string, McpToolDefinition> = new Map([

  ["SystemDatabaseController_ping", {
    name: "SystemDatabaseController_ping",
    description: `Executes GET /api/system_db`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/system_db",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_signin", {
    name: "AuthController_signin",
    description: `Sign in a user`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"password":{"type":"string","description":"User password"},"email":{"type":"string","description":"User email address"}},"required":["password","email"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/signin",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_signup", {
    name: "AuthController_signup",
    description: `Sign up a new user`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"firstName":{"type":"string","description":"User first name"},"lastName":{"type":"string","description":"User last name"},"email":{"type":"string","description":"User email address"},"password":{"type":"string","description":"User password"}},"required":["firstName","lastName","email","password"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/signup",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_signupConfirm", {
    name: "AuthController_signupConfirm",
    description: `Confirm user signup`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","description":"User email address"},"token":{"type":"string","description":"Signup confirmation token from email"}},"required":["email","token"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/signup/verify",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_sendResetPassword", {
    name: "AuthController_sendResetPassword",
    description: `Send reset password email`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","description":"User email address to send reset link to"}},"required":["email"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/send_reset_password",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_resetPassword", {
    name: "AuthController_resetPassword",
    description: `Reset password using token`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string","description":"Reset password token from email link"},"requestBody":{"type":"object","properties":{"password":{"type":"string","description":"New password"}},"required":["password"],"description":"The JSON request body."}},"required":["token","requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/reset_password/{token}",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthController_meta", {
    name: "AuthController_meta",
    description: `Get auth metadata (e.g. signup disabled)`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/auth/meta",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthedController_resendSignupConfirm", {
    name: "AuthedController_resendSignupConfirm",
    description: `Resend the signup confirmation message`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"code":{"type":"number"},"message":{"type":"string"}},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/auth/signup/verify/resend",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthedController_getAuthedAcccount", {
    name: "AuthedController_getAuthedAcccount",
    description: `Retrieve the authenticated account`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/auth/account",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthApiKeysController_generate", {
    name: "AuthApiKeysController_generate",
    description: `Generate a new API key`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Optional name for the API key"}},"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/api-keys/generate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthApiKeysController_revoke", {
    name: "AuthApiKeysController_revoke",
    description: `Revoke an API key`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"API key ID"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/api-keys/{id}/revoke",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AuthApiKeysController_getApiKeys", {
    name: "AuthApiKeysController_getApiKeys",
    description: `Get all API keys for the current tenant`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/api-keys",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItems", {
    name: "ItemsController_getItems",
    description: `Retrieves the item list.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID for filtering"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Array of filter roles"},"columnSortBy":{"type":"string","description":"Column sort direction"},"sortOrder":{"enum":["DESC","ASC"],"type":"string","description":"Sort order direction"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug for filtering"},"inactiveMode":{"type":"boolean","description":"Filter for inactive items"},"pageSize":{"type":"number","description":"Number of items per page"},"page":{"type":"number","description":"Page number for pagination"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/items",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"},{"name":"inactiveMode","in":"query"},{"name":"pageSize","in":"query"},{"name":"page","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_createItem", {
    name: "ItemsController_createItem",
    description: `Create a new item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Item name"},"type":{"type":"string","description":"Item type","enum":["service","non-inventory","inventory"]},"code":{"type":"string","description":"Item code/SKU"},"purchasable":{"type":"boolean","description":"Whether the item can be purchased"},"costPrice":{"type":"number","description":"Cost price of the item","minimum":0},"costAccountId":{"type":"number","description":"ID of the cost account","minimum":0},"sellable":{"type":"boolean","description":"Whether the item can be sold"},"sellPrice":{"type":"number","description":"Selling price of the item","minimum":0},"sellAccountId":{"type":"number","description":"ID of the sell account","minimum":0},"inventoryAccountId":{"type":"number","description":"ID of the inventory account (required for inventory items)","minimum":0},"sellDescription":{"type":"string","description":"Description shown on sales documents"},"purchaseDescription":{"type":"string","description":"Description shown on purchase documents"},"sellTaxRateId":{"type":"number","description":"ID of the tax rate applied to sales"},"purchaseTaxRateId":{"type":"number","description":"ID of the tax rate applied to purchases"},"categoryId":{"type":"number","description":"ID of the item category","minimum":0},"note":{"type":"string","description":"Additional notes about the item"},"active":{"type":"boolean","description":"Whether the item is active","default":true},"mediaIds":{"description":"IDs of media files associated with the item","type":"array","items":{"type":"number"}}},"required":["name","type"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/items",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItem", {
    name: "ItemsController_getItem",
    description: `Get the given item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_editItem", {
    name: "ItemsController_editItem",
    description: `Edit the given item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Item name"},"type":{"type":"string","description":"Item type","enum":["service","non-inventory","inventory"]},"code":{"type":"string","description":"Item code/SKU"},"purchasable":{"type":"boolean","description":"Whether the item can be purchased"},"costPrice":{"type":"number","description":"Cost price of the item","minimum":0},"costAccountId":{"type":"number","description":"ID of the cost account","minimum":0},"sellable":{"type":"boolean","description":"Whether the item can be sold"},"sellPrice":{"type":"number","description":"Selling price of the item","minimum":0},"sellAccountId":{"type":"number","description":"ID of the sell account","minimum":0},"inventoryAccountId":{"type":"number","description":"ID of the inventory account (required for inventory items)","minimum":0},"sellDescription":{"type":"string","description":"Description shown on sales documents"},"purchaseDescription":{"type":"string","description":"Description shown on purchase documents"},"sellTaxRateId":{"type":"number","description":"ID of the tax rate applied to sales"},"purchaseTaxRateId":{"type":"number","description":"ID of the tax rate applied to purchases"},"categoryId":{"type":"number","description":"ID of the item category","minimum":0},"note":{"type":"string","description":"Additional notes about the item"},"active":{"type":"boolean","description":"Whether the item is active","default":true},"mediaIds":{"description":"IDs of media files associated with the item","type":"array","items":{"type":"number"}}},"required":["name","type"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/items/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_deleteItem", {
    name: "ItemsController_deleteItem",
    description: `Delete the given item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/items/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_validateBulkDeleteItems", {
    name: "ItemsController_validateBulkDeleteItems",
    description: `Validates which items can be deleted and returns counts of deletable and non-deletable items.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of item IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/items/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_bulkDeleteItems", {
    name: "ItemsController_bulkDeleteItems",
    description: `Deletes multiple items in bulk.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of item IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/items/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_inactivateItem", {
    name: "ItemsController_inactivateItem",
    description: `Inactivate the given item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "patch",
    pathTemplate: "/api/items/{id}/inactivate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_activateItem", {
    name: "ItemsController_activateItem",
    description: `Activate the given item (product or service).`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "patch",
    pathTemplate: "/api/items/{id}/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItemInvoicesTransactions", {
    name: "ItemsController_getItemInvoicesTransactions",
    description: `Retrieves the item associated invoices transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}/invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItemBillTransactions", {
    name: "ItemsController_getItemBillTransactions",
    description: `Retrieves the item associated bills transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}/bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItemEstimatesTransactions", {
    name: "ItemsController_getItemEstimatesTransactions",
    description: `Retrieves the item associated estimates transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}/estimates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemsController_getItemReceiptTransactions", {
    name: "ItemsController_getItemReceiptTransactions",
    description: `Retrieves the item associated receipts transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}/receipts",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryAdjustmentsController_createQuickInventoryAdjustment", {
    name: "InventoryAdjustmentsController_createQuickInventoryAdjustment",
    description: `Create a quick inventory adjustment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"date":{"format":"date-time","type":"string","description":"Date of the inventory adjustment"},"type":{"type":"string","description":"Type of adjustment","enum":["increment","decrement"]},"adjustmentAccountId":{"type":"number","description":"ID of the adjustment account"},"reason":{"type":"string","description":"Reason for the adjustment"},"description":{"type":"string","description":"Description of the adjustment"},"referenceNo":{"type":"string","description":"Reference number"},"itemId":{"type":"number","description":"ID of the item being adjusted"},"quantity":{"type":"number","description":"Quantity to adjust"},"cost":{"type":"number","description":"Cost of the item"},"publish":{"type":"boolean","description":"Whether to publish the adjustment immediately"},"warehouseId":{"type":"number","description":"ID of the warehouse (optional)"},"branchId":{"type":"number","description":"ID of the branch (optional)"}},"required":["date","type","adjustmentAccountId","reason","description","referenceNo","itemId","quantity","cost","publish"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/inventory-adjustments/quick",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryAdjustmentsController_getInventoryAdjustment", {
    name: "InventoryAdjustmentsController_getInventoryAdjustment",
    description: `Retrieves the inventory adjustment details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/inventory-adjustments/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryAdjustmentsController_deleteInventoryAdjustment", {
    name: "InventoryAdjustmentsController_deleteInventoryAdjustment",
    description: `Delete the given inventory adjustment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/inventory-adjustments/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryAdjustmentsController_getInventoryAdjustments", {
    name: "InventoryAdjustmentsController_getInventoryAdjustments",
    description: `Retrieves the inventory adjustments.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"page":{"type":"number"},"pageSize":{"type":"number"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/inventory-adjustments",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryAdjustmentsController_publishInventoryAdjustment", {
    name: "InventoryAdjustmentsController_publishInventoryAdjustment",
    description: `Publish the given inventory adjustment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/inventory-adjustments/{id}/publish",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_getBranches", {
    name: "BranchesController_getBranches",
    description: `Retrieves the branches.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/branches",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_createBranch", {
    name: "BranchesController_createBranch",
    description: `Create a new branch.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Branch name"},"primary":{"type":"boolean","description":"Whether this is the primary branch","default":false},"code":{"type":"string","description":"Branch code"},"address":{"type":"string","description":"Branch address"},"city":{"type":"string","description":"Branch city"},"country":{"type":"string","description":"Branch country"},"phone_number":{"type":"string","description":"Branch phone number"},"email":{"type":"string","description":"Branch email"},"website":{"type":"string","description":"Branch website"}},"required":["name"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/branches",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_getBranch", {
    name: "BranchesController_getBranch",
    description: `Retrieves the branch details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/branches/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_editBranch", {
    name: "BranchesController_editBranch",
    description: `Edit the given branch.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Branch name"},"primary":{"type":"boolean","description":"Whether this is the primary branch","default":false},"code":{"type":"string","description":"Branch code"},"address":{"type":"string","description":"Branch address"},"city":{"type":"string","description":"Branch city"},"country":{"type":"string","description":"Branch country"},"phone_number":{"type":"string","description":"Branch phone number"},"email":{"type":"string","description":"Branch email"},"website":{"type":"string","description":"Branch website"}},"required":["name"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/branches/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_deleteBranch", {
    name: "BranchesController_deleteBranch",
    description: `Delete the given branch.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/branches/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_activateBranches", {
    name: "BranchesController_activateBranches",
    description: `Activate the branches feature.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "post",
    pathTemplate: "/api/branches/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BranchesController_markBranchAsPrimary", {
    name: "BranchesController_markBranchAsPrimary",
    description: `Mark the given branch as primary.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/branches/{id}/mark-as-primary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_getWarehouses", {
    name: "WarehousesController_getWarehouses",
    description: `Get all warehouses`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/warehouses",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_createWarehouse", {
    name: "WarehousesController_createWarehouse",
    description: `Create a warehouse`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the warehouse"},"primary":{"type":"boolean","description":"Whether the warehouse is primary"},"code":{"type":"string","description":"The code of the warehouse"},"address":{"type":"string","description":"The address of the warehouse"},"city":{"type":"string","description":"The city of the warehouse"},"country":{"type":"string","description":"The country of the warehouse"},"phoneNumber":{"type":"string","description":"The phone number of the warehouse"},"email":{"type":"string","description":"The email of the warehouse"},"website":{"type":"string","description":"The website of the warehouse"}},"required":["name","primary","code","address","city","country","phoneNumber","email","website"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/warehouses",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_getWarehouse", {
    name: "WarehousesController_getWarehouse",
    description: `Get a warehouse`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/warehouses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_editWarehouse", {
    name: "WarehousesController_editWarehouse",
    description: `Executes PUT /api/warehouses/{id}`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the warehouse"},"primary":{"type":"boolean","description":"Whether the warehouse is primary"},"code":{"type":"string","description":"The code of the warehouse"},"address":{"type":"string","description":"The address of the warehouse"},"city":{"type":"string","description":"The city of the warehouse"},"country":{"type":"string","description":"The country of the warehouse"},"phoneNumber":{"type":"string","description":"The phone number of the warehouse"},"email":{"type":"string","description":"The email of the warehouse"},"website":{"type":"string","description":"The website of the warehouse"}},"required":["name","primary","code","address","city","country","phoneNumber","email","website"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/warehouses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_deleteWarehouse", {
    name: "WarehousesController_deleteWarehouse",
    description: `Delete a warehouse`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/warehouses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_activateWarehouses", {
    name: "WarehousesController_activateWarehouses",
    description: `Activate a warehouse`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "post",
    pathTemplate: "/api/warehouses/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehousesController_markWarehousePrimary", {
    name: "WarehousesController_markWarehousePrimary",
    description: `Mark a warehouse as primary`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/warehouses/{id}/mark-primary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseItemsController_getItemWarehouses", {
    name: "WarehouseItemsController_getItemWarehouses",
    description: `Retrieves the item associated warehouses.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The item id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/items/{id}/warehouses",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_validateBulkDeleteAccounts", {
    name: "AccountsController_validateBulkDeleteAccounts",
    description: `Validates which accounts can be deleted and returns counts of deletable and non-deletable accounts.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/accounts/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_bulkDeleteAccounts", {
    name: "AccountsController_bulkDeleteAccounts",
    description: `Deletes multiple accounts in bulk.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/accounts/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_getAccounts", {
    name: "AccountsController_getAccounts",
    description: `Retrieves the accounts.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"onlyInactive":{"default":false,"type":"boolean","description":"Filter to show only inactive accounts"},"structure":{"default":"tree","enum":["tree","flat"],"type":"string","description":"Structure type for the accounts list"},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles array"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"enum":["DESC","ASC"],"type":"string","description":"Sort order"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"},"page":{"minimum":1,"type":"number","description":"Page number"},"pageSize":{"minimum":1,"type":"number","description":"Page size"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/accounts",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"onlyInactive","in":"query"},{"name":"structure","in":"query"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_createAccount", {
    name: "AccountsController_createAccount",
    description: `Create an account`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Account name","minLength":3,"maxLength":255},"code":{"type":"string","description":"Account code","minLength":3,"maxLength":6},"currencyCode":{"type":"string","description":"Currency code for the account"},"accountType":{"type":"string","description":"Type of account","minLength":3,"maxLength":255},"description":{"type":"string","description":"Account description","maxLength":65535},"parentAccountId":{"type":"number","description":"ID of the parent account"},"active":{"type":"boolean","description":"Whether the account is active","default":true},"plaidAccountId":{"type":"string","description":"Plaid account ID for syncing"},"plaidItemId":{"type":"string","description":"Plaid item ID for syncing"}},"required":["name","accountType"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/accounts",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_getAccount", {
    name: "AccountsController_getAccount",
    description: `Retrieves the account details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The account id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/accounts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_editAccount", {
    name: "AccountsController_editAccount",
    description: `Edit the given account.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The account id"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the account"},"code":{"type":"string","description":"The code of the account"},"accountType":{"type":"string","description":"The type of the account"},"description":{"type":"string","description":"The description of the account"},"parentAccountId":{"type":"number","description":"The parent account ID of the account"}},"required":["name","code","accountType","description","parentAccountId"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/accounts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_deleteAccount", {
    name: "AccountsController_deleteAccount",
    description: `Delete the given account.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The account id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/accounts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_activateAccount", {
    name: "AccountsController_activateAccount",
    description: `Activate the given account.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The account id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/accounts/{id}/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_inactivateAccount", {
    name: "AccountsController_inactivateAccount",
    description: `Inactivate the given account.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The account id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/accounts/{id}/inactivate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_getAccountTypes", {
    name: "AccountsController_getAccountTypes",
    description: `Retrieves the account types.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/accounts/types",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AccountsController_getAccountTransactions", {
    name: "AccountsController_getAccountTransactions",
    description: `Retrieves the account transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"accountId":{"type":"number","description":"ID of the account to fetch transactions for"},"limit":{"type":"number","description":"Maximum number of transactions to return"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/accounts/transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"accountId","in":"query"},{"name":"limit","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryCostController_getItemsCost", {
    name: "InventoryCostController_getItemsCost",
    description: `Get items inventory valuation list`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"date":{"format":"date-time","type":"string","description":"The date to get the inventory cost for"},"itemsIds":{"type":"array","items":{"type":"string"},"description":"The ids of the items to get the inventory cost for"}},"required":["Authorization","organization-id","date","itemsIds"]},
    method: "get",
    pathTemplate: "/api/inventory-cost/items",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"date","in":"query"},{"name":"itemsIds","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_validateBulkDeleteSaleInvoices", {
    name: "SaleInvoicesController_validateBulkDeleteSaleInvoices",
    description: `Validates which sale invoices can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_bulkDeleteSaleInvoices", {
    name: "SaleInvoicesController_bulkDeleteSaleInvoices",
    description: `Deletes multiple sale invoices.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getSaleInvoices", {
    name: "SaleInvoicesController_getSaleInvoices",
    description: `Retrieves the sale invoices.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_createSaleInvoice", {
    name: "SaleInvoicesController_createSaleInvoice",
    description: `Create a new sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"Customer ID"},"invoiceDate":{"format":"date-time","type":"string","description":"Invoice date"},"dueDate":{"format":"date-time","type":"string","description":"Due date"},"invoiceNo":{"type":"string","description":"Invoice number"},"referenceNo":{"type":"string","description":"Reference number"},"delivered":{"type":"boolean","description":"Whether the invoice is delivered","default":false},"invoiceMessage":{"type":"string","description":"Invoice message"},"termsConditions":{"type":"string","description":"Terms and conditions"},"exchangeRate":{"type":"number","description":"Exchange rate","minimum":0},"warehouseId":{"type":"number","description":"Warehouse ID"},"branchId":{"type":"number","description":"Branch ID"},"projectId":{"type":"number","description":"Project ID"},"isInclusiveTax":{"type":"boolean","description":"Whether tax is inclusive"},"entries":{"description":"Invoice line items","minItems":1,"type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"The index of the item entry"},"itemId":{"type":"number","description":"The id of the item"},"rate":{"type":"number","description":"The rate of the item entry"},"quantity":{"type":"number","description":"The quantity of the item entry"},"discount":{"type":"number","description":"The discount of the item entry"},"discountType":{"type":"string","description":"The type of the discount"},"description":{"type":"string","description":"The description of the item entry"},"taxCode":{"type":"string","description":"The tax code of the item entry"},"taxRateId":{"type":"number","description":"The tax rate id of the item entry"},"warehouseId":{"type":"number","description":"The warehouse id of the item entry"},"projectId":{"type":"number","description":"The project id of the item entry"},"projectRefId":{"type":"number","description":"The project ref id of the item entry"},"projectRefType":{"type":"string","description":"The project ref type of the item entry"},"projectRefInvoicedAmount":{"type":"number","description":"The project ref invoiced amount of the item entry"},"sellAccountId":{"type":"number","description":"The sell account id of the item entry"},"costAccountId":{"type":"number","description":"The cost account id of the item entry"}},"required":["index","itemId","rate","quantity","discount","discountType","description","taxCode","taxRateId","warehouseId","projectId","projectRefId","projectRefType","projectRefInvoicedAmount","sellAccountId","costAccountId"]}},"pdfTemplateId":{"type":"number","description":"PDF template ID"},"paymentMethods":{"description":"Payment methods","type":"array","items":{"type":"object","properties":{"paymentIntegrationId":{"type":"number","description":"The ID of the payment integration"},"enable":{"type":"boolean","description":"Whether the payment method is enabled"}},"required":["paymentIntegrationId","enable"]}},"discount":{"type":"number","description":"Discount value"},"discountType":{"type":"string","description":"Discount type","enum":["percentage","amount"]},"adjustment":{"type":"number","description":"Adjustment amount"},"fromEstimateId":{"type":"number","description":"ID of the estimate this invoice is created from"},"attachments":{"description":"The attachments of the sale receipt","type":"array","items":{"type":"string"}}},"required":["customerId","invoiceDate","dueDate","entries","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getSaleInvoiceMailState", {
    name: "SaleInvoicesController_getSaleInvoiceMailState",
    description: `Retrieves the sale invoice mail state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_sendSaleInvoiceMail", {
    name: "SaleInvoicesController_sendSaleInvoiceMail",
    description: `Send the sale invoice mail.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getSaleInvoice", {
    name: "SaleInvoicesController_getSaleInvoice",
    description: `Retrieves the sale invoice details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"},"accept":{"type":"string"}},"required":["Authorization","organization-id","id","accept"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_editSaleInvoice", {
    name: "SaleInvoicesController_editSaleInvoice",
    description: `Edit the given sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"Customer ID"},"invoiceDate":{"format":"date-time","type":"string","description":"Invoice date"},"dueDate":{"format":"date-time","type":"string","description":"Due date"},"invoiceNo":{"type":"string","description":"Invoice number"},"referenceNo":{"type":"string","description":"Reference number"},"delivered":{"type":"boolean","description":"Whether the invoice is delivered","default":false},"invoiceMessage":{"type":"string","description":"Invoice message"},"termsConditions":{"type":"string","description":"Terms and conditions"},"exchangeRate":{"type":"number","description":"Exchange rate","minimum":0},"warehouseId":{"type":"number","description":"Warehouse ID"},"branchId":{"type":"number","description":"Branch ID"},"projectId":{"type":"number","description":"Project ID"},"isInclusiveTax":{"type":"boolean","description":"Whether tax is inclusive"},"entries":{"description":"Invoice line items","minItems":1,"type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"The index of the item entry"},"itemId":{"type":"number","description":"The id of the item"},"rate":{"type":"number","description":"The rate of the item entry"},"quantity":{"type":"number","description":"The quantity of the item entry"},"discount":{"type":"number","description":"The discount of the item entry"},"discountType":{"type":"string","description":"The type of the discount"},"description":{"type":"string","description":"The description of the item entry"},"taxCode":{"type":"string","description":"The tax code of the item entry"},"taxRateId":{"type":"number","description":"The tax rate id of the item entry"},"warehouseId":{"type":"number","description":"The warehouse id of the item entry"},"projectId":{"type":"number","description":"The project id of the item entry"},"projectRefId":{"type":"number","description":"The project ref id of the item entry"},"projectRefType":{"type":"string","description":"The project ref type of the item entry"},"projectRefInvoicedAmount":{"type":"number","description":"The project ref invoiced amount of the item entry"},"sellAccountId":{"type":"number","description":"The sell account id of the item entry"},"costAccountId":{"type":"number","description":"The cost account id of the item entry"}},"required":["index","itemId","rate","quantity","discount","discountType","description","taxCode","taxRateId","warehouseId","projectId","projectRefId","projectRefType","projectRefInvoicedAmount","sellAccountId","costAccountId"]}},"pdfTemplateId":{"type":"number","description":"PDF template ID"},"paymentMethods":{"description":"Payment methods","type":"array","items":{"type":"object","properties":{"paymentIntegrationId":{"type":"number","description":"The ID of the payment integration"},"enable":{"type":"boolean","description":"Whether the payment method is enabled"}},"required":["paymentIntegrationId","enable"]}},"discount":{"type":"number","description":"Discount value"},"discountType":{"type":"string","description":"Discount type","enum":["percentage","amount"]},"adjustment":{"type":"number","description":"Adjustment amount"},"fromEstimateId":{"type":"number","description":"ID of the estimate this invoice is created from"},"attachments":{"description":"The attachments of the sale receipt","type":"array","items":{"type":"string"}}},"required":["customerId","invoiceDate","dueDate","entries","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/sale-invoices/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_deleteSaleInvoice", {
    name: "SaleInvoicesController_deleteSaleInvoice",
    description: `Delete the given sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/sale-invoices/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getReceivableSaleInvoices", {
    name: "SaleInvoicesController_getReceivableSaleInvoices",
    description: `Retrieves the receivable sale invoices.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customerId":{"type":"number","description":"The customer id"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/receivable",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customerId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getSaleInvoiceState", {
    name: "SaleInvoicesController_getSaleInvoiceState",
    description: `Retrieves the sale invoice state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_deliverSaleInvoice", {
    name: "SaleInvoicesController_deliverSaleInvoice",
    description: `Deliver the given sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/sale-invoices/{id}/deliver",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_writeOff", {
    name: "SaleInvoicesController_writeOff",
    description: `Write off the given sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/{id}/writeoff",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_cancelWrittenoff", {
    name: "SaleInvoicesController_cancelWrittenoff",
    description: `Cancel the written off sale invoice.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/{id}/cancel-writeoff",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_getInvoicePayments", {
    name: "SaleInvoicesController_getInvoicePayments",
    description: `Retrieves the sale invoice payments.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/{id}/payments",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_saleInvoiceHtml", {
    name: "SaleInvoicesController_saleInvoiceHtml",
    description: `Retrieves the sale invoice HTML.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-invoices/{id}/html",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleInvoicesController_generateSaleInvoiceSharableLink", {
    name: "SaleInvoicesController_generateSaleInvoiceSharableLink",
    description: `Generate sharable sale invoice link (private or public)`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale invoice id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-invoices/{id}/generate-link",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_getPdfTemplates", {
    name: "PdfTemplatesController_getPdfTemplates",
    description: `Retrieves the PDF templates.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"resource":{"type":"string"}},"required":["Authorization","organization-id","resource"]},
    method: "get",
    pathTemplate: "/api/pdf-templates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"resource","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_createPdfTemplate", {
    name: "PdfTemplatesController_createPdfTemplate",
    description: `Create a new PDF template.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "post",
    pathTemplate: "/api/pdf-templates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_getPdfTemplate", {
    name: "PdfTemplatesController_getPdfTemplate",
    description: `Retrieves the PDF template details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/pdf-templates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_editPdfTemplate", {
    name: "PdfTemplatesController_editPdfTemplate",
    description: `Edit the given PDF template.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/pdf-templates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_deletePdfTemplate", {
    name: "PdfTemplatesController_deletePdfTemplate",
    description: `Delete the given PDF template.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/pdf-templates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_getPdfTemplateBrandingState", {
    name: "PdfTemplatesController_getPdfTemplateBrandingState",
    description: `Retrieves the PDF template branding state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/pdf-templates/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PdfTemplatesController_assignPdfTemplateAsDefault", {
    name: "PdfTemplatesController_assignPdfTemplateAsDefault",
    description: `Assign the given PDF template as default.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/pdf-templates/{id}/assign-default",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_uploadAttachment", {
    name: "AttachmentsController_uploadAttachment",
    description: `Upload attachment to S3`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"string","description":"Upload attachment"}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/attachments",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "multipart/form-data",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_getAttachment", {
    name: "AttachmentsController_getAttachment",
    description: `Get attachment by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Attachment ID"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/attachments/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_deleteAttachment", {
    name: "AttachmentsController_deleteAttachment",
    description: `Delete attachment by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Attachment ID"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/attachments/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_linkDocument", {
    name: "AttachmentsController_linkDocument",
    description: `Link attachment to a model`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Attachment ID"},"requestBody":{"type":"object","properties":{},"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "post",
    pathTemplate: "/api/attachments/{id}/link",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_unlinkDocument", {
    name: "AttachmentsController_unlinkDocument",
    description: `Unlink attachment from a model`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Attachment ID"},"requestBody":{"type":"object","properties":{},"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "post",
    pathTemplate: "/api/attachments/{id}/unlink",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["AttachmentsController_getAttachmentPresignedUrl", {
    name: "AttachmentsController_getAttachmentPresignedUrl",
    description: `Get presigned URL for attachment`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Attachment ID"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/attachments/{id}/presigned-url",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_getTaxRates", {
    name: "TaxRatesController_getTaxRates",
    description: `Retrieves the tax rates.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/tax-rates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_createTaxRate", {
    name: "TaxRatesController_createTaxRate",
    description: `Create a new tax rate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the tax rate."},"code":{"type":"string","description":"The code of the tax rate."},"rate":{"type":"number","description":"The rate of the tax rate."},"description":{"type":"string","description":"The description of the tax rate."},"isNonRecoverable":{"type":"boolean","description":"Whether the tax is non-recoverable."},"isCompound":{"type":"boolean","description":"Whether the tax is compound."},"active":{"type":"boolean","description":"Whether the tax rate is active."}},"required":["name","code","rate","description","isNonRecoverable","isCompound","active"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/tax-rates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_getTaxRate", {
    name: "TaxRatesController_getTaxRate",
    description: `Retrieves the tax rate details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/tax-rates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_editTaxRate", {
    name: "TaxRatesController_editTaxRate",
    description: `Edit the given tax rate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the tax rate."},"code":{"type":"string","description":"The code of the tax rate."},"rate":{"type":"number","description":"The rate of the tax rate."},"description":{"type":"string","description":"The description of the tax rate."},"isNonRecoverable":{"type":"boolean","description":"Whether the tax is non-recoverable."},"isCompound":{"type":"boolean","description":"Whether the tax is compound."},"active":{"type":"boolean","description":"Whether the tax rate is active."}},"required":["name","code","rate","description","isNonRecoverable","isCompound","active"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/tax-rates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_deleteTaxRate", {
    name: "TaxRatesController_deleteTaxRate",
    description: `Delete the given tax rate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/tax-rates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_activateTaxRate", {
    name: "TaxRatesController_activateTaxRate",
    description: `Activate the given tax rate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/tax-rates/{id}/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TaxRatesController_inactivateTaxRate", {
    name: "TaxRatesController_inactivateTaxRate",
    description: `Inactivate the given tax rate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/tax-rates/{id}/inactivate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentReceiveMailOptions", {
    name: "PaymentReceivesController_getPaymentReceiveMailOptions",
    description: `Executes GET /api/payments-received/{id}/mail`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/payments-received/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_sendPaymentReceiveMail", {
    name: "PaymentReceivesController_sendPaymentReceiveMail",
    description: `Executes POST /api/payments-received/{id}/mail`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/payments-received/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentReceiveEditPage", {
    name: "PaymentReceivesController_getPaymentReceiveEditPage",
    description: `Executes GET /api/payments-received/{id}/edit-page`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/payments-received/{id}/edit-page",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentsReceived", {
    name: "PaymentReceivesController_getPaymentsReceived",
    description: `Retrieves the payment received list.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/payments-received",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_createPaymentReceived", {
    name: "PaymentReceivesController_createPaymentReceived",
    description: `Create a new payment received.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"paymentDate":{"type":"object","description":"The payment date of the payment received"},"amount":{"type":"number","description":"The amount of the payment received"},"exchangeRate":{"type":"number","description":"The exchange rate of the payment received"},"referenceNo":{"type":"string","description":"The reference number of the payment received"},"depositAccountId":{"type":"number","description":"The id of the deposit account"},"paymentReceiveNo":{"type":"string","description":"The payment receive number of the payment received"},"statement":{"type":"string","description":"The statement of the payment received"},"entries":{"description":"The entries of the payment received","type":"array","items":{"type":"string"}},"branchId":{"type":"number","description":"The id of the branch"},"attachments":{"description":"The attachments of the payment received","type":"array","items":{"type":"string"}}},"required":["customerId","paymentDate","amount","exchangeRate","referenceNo","depositAccountId","paymentReceiveNo","statement","entries","branchId","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/payments-received",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentReceive", {
    name: "PaymentReceivesController_getPaymentReceive",
    description: `Retrieves the payment received details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"accept":{"type":"string"}},"required":["Authorization","organization-id","id","accept"]},
    method: "get",
    pathTemplate: "/api/payments-received/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_editPaymentReceive", {
    name: "PaymentReceivesController_editPaymentReceive",
    description: `Edit the given payment received.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"paymentDate":{"type":"object","description":"The payment date of the payment received"},"amount":{"type":"number","description":"The amount of the payment received"},"exchangeRate":{"type":"number","description":"The exchange rate of the payment received"},"referenceNo":{"type":"string","description":"The reference number of the payment received"},"depositAccountId":{"type":"number","description":"The id of the deposit account"},"paymentReceiveNo":{"type":"string","description":"The payment receive number of the payment received"},"statement":{"type":"string","description":"The statement of the payment received"},"entries":{"description":"The entries of the payment received","type":"array","items":{"type":"string"}},"branchId":{"type":"number","description":"The id of the branch"},"attachments":{"description":"The attachments of the payment received","type":"array","items":{"type":"string"}}},"required":["customerId","paymentDate","amount","exchangeRate","referenceNo","depositAccountId","paymentReceiveNo","statement","entries","branchId","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/payments-received/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_deletePaymentReceive", {
    name: "PaymentReceivesController_deletePaymentReceive",
    description: `Delete the given payment received.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/payments-received/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_validateBulkDeletePaymentsReceived", {
    name: "PaymentReceivesController_validateBulkDeletePaymentsReceived",
    description: `Validates which payments received can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/payments-received/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_bulkDeletePaymentsReceived", {
    name: "PaymentReceivesController_bulkDeletePaymentsReceived",
    description: `Deletes multiple payments received.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/payments-received/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentReceivedState", {
    name: "PaymentReceivesController_getPaymentReceivedState",
    description: `Retrieves the payment received state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/payments-received/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentReceivesController_getPaymentReceiveInvoices", {
    name: "PaymentReceivesController_getPaymentReceiveInvoices",
    description: `Retrieves the payment received invoices.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/payments-received/{id}/invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_fileUpload", {
    name: "ImportController_fileUpload",
    description: `Upload import file`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "post",
    pathTemplate: "/api/import/file",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_mapping", {
    name: "ImportController_mapping",
    description: `Map import columns`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"import_id":{"type":"string"}},"required":["Authorization","organization-id","import_id"]},
    method: "post",
    pathTemplate: "/api/import/{import_id}/mapping",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"import_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_preview", {
    name: "ImportController_preview",
    description: `Preview import data`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"import_id":{"type":"string"}},"required":["Authorization","organization-id","import_id"]},
    method: "get",
    pathTemplate: "/api/import/{import_id}/preview",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"import_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_import", {
    name: "ImportController_import",
    description: `Process import`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"import_id":{"type":"string"}},"required":["Authorization","organization-id","import_id"]},
    method: "post",
    pathTemplate: "/api/import/{import_id}/import",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"import_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_downloadImportSample", {
    name: "ImportController_downloadImportSample",
    description: `Get import sample`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"resource":{"type":"string"},"format":{"type":"string"}},"required":["Authorization","organization-id","resource","format"]},
    method: "get",
    pathTemplate: "/api/import/sample",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"resource","in":"query"},{"name":"format","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ImportController_getImportFileMeta", {
    name: "ImportController_getImportFileMeta",
    description: `Get import metadata`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"import_id":{"type":"string"}},"required":["Authorization","organization-id","import_id"]},
    method: "get",
    pathTemplate: "/api/import/{import_id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"import_id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ResourceController_getResourceMeta", {
    name: "ResourceController_getResourceMeta",
    description: `Retrieves the resource meta`,
    inputSchema: {"type":"object","properties":{"resourceModel":{"type":"string","description":"The resource model name (e.g., SaleInvoice, Customer, Item)"}},"required":["resourceModel"]},
    method: "get",
    pathTemplate: "/api/resources/{resourceModel}/meta",
    executionParameters: [{"name":"resourceModel","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentLinksController_getPaymentLinkPublicMeta", {
    name: "PaymentLinksController_getPaymentLinkPublicMeta",
    description: `Retrieves public metadata for an invoice payment link`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"paymentLinkId":{"type":"string","description":"The ID of the payment link"}},"required":["Authorization","organization-id","paymentLinkId"]},
    method: "get",
    pathTemplate: "/api/payment-links/{paymentLinkId}/invoice",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"paymentLinkId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentLinksController_createInvoicePaymentLinkCheckoutSession", {
    name: "PaymentLinksController_createInvoicePaymentLinkCheckoutSession",
    description: `Creates a Stripe checkout session for an invoice payment link`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"paymentLinkId":{"type":"string","description":"The ID of the payment link"}},"required":["Authorization","organization-id","paymentLinkId"]},
    method: "post",
    pathTemplate: "/api/payment-links/{paymentLinkId}/stripe_checkout_session",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"paymentLinkId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentLinksController_getPaymentLinkInvoicePdf", {
    name: "PaymentLinksController_getPaymentLinkInvoicePdf",
    description: `Retrieves the PDF of the invoice associated with a payment link`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"paymentLinkId":{"type":"string","description":"The ID of the payment link"}},"required":["Authorization","organization-id","paymentLinkId"]},
    method: "get",
    pathTemplate: "/api/payment-links/{paymentLinkId}/invoice/pdf",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"paymentLinkId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripeIntegrationController_getStripeConnectLink", {
    name: "StripeIntegrationController_getStripeConnectLink",
    description: `Retrieves the Stripe OAuth2 Connect authorization URL`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/stripe/link",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripeIntegrationController_exchangeOAuth", {
    name: "StripeIntegrationController_exchangeOAuth",
    description: `Exchanges the Stripe authorization code for user id and access token`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"code":{"type":"string","description":"Authorization code returned by Stripe OAuth"}},"required":["code"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/stripe/callback",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripeIntegrationController_createAccount", {
    name: "StripeIntegrationController_createAccount",
    description: `Creates a new Stripe Connect account`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/stripe/account",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripeIntegrationController_createAccountSession", {
    name: "StripeIntegrationController_createAccountSession",
    description: `Creates an account session for the Stripe Connect embedded component`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"account":{"type":"string","description":"Stripe Connect account ID to create a session for"}},"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/stripe/account_session",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripeIntegrationController_createAccountLink", {
    name: "StripeIntegrationController_createAccountLink",
    description: `Creates a Stripe Connect account link for onboarding`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"stripeAccountId":{"type":"string","description":"Stripe Connect account ID"}},"required":["stripeAccountId"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/stripe/account_link",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["StripePaymentWebhooksController_handleWebhook", {
    name: "StripePaymentWebhooksController_handleWebhook",
    description: `Listen to Stripe webhooks`,
    inputSchema: {"type":"object","properties":{"stripe-signature":{"type":"string"}},"required":["stripe-signature"]},
    method: "post",
    pathTemplate: "/api/webhooks/stripe",
    executionParameters: [{"name":"stripe-signature","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemCategoryController_getItemCategories", {
    name: "ItemCategoryController_getItemCategories",
    description: `Retrieves the item categories.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/item-categories",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemCategoryController_createItemCategory", {
    name: "ItemCategoryController_createItemCategory",
    description: `Create a new item category.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The category name"},"description":{"type":"string","description":"The category description"},"costAccountId":{"type":"number","description":"The cost account ID"},"sellAccountId":{"type":"number","description":"The sell account ID"},"inventoryAccountId":{"type":"number","description":"The inventory account ID"},"costMethod":{"type":"string","description":"The cost method"}},"required":["name","description","costAccountId","sellAccountId","inventoryAccountId","costMethod"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/item-categories",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemCategoryController_getItemCategory", {
    name: "ItemCategoryController_getItemCategory",
    description: `Retrieves the item category details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/item-categories/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemCategoryController_editItemCategory", {
    name: "ItemCategoryController_editItemCategory",
    description: `Edit the given item category.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The category name"},"description":{"type":"string","description":"The category description"},"costAccountId":{"type":"number","description":"The cost account ID"},"sellAccountId":{"type":"number","description":"The sell account ID"},"inventoryAccountId":{"type":"number","description":"The inventory account ID"},"costMethod":{"type":"string","description":"The cost method"}},"required":["name","description","costAccountId","sellAccountId","inventoryAccountId","costMethod"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/item-categories/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ItemCategoryController_deleteItemCategory", {
    name: "ItemCategoryController_deleteItemCategory",
    description: `Delete the given item category.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/item-categories/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_validateBulkDeleteExpenses", {
    name: "ExpensesController_validateBulkDeleteExpenses",
    description: `Validate which expenses can be deleted and return the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/expenses/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_bulkDeleteExpenses", {
    name: "ExpensesController_bulkDeleteExpenses",
    description: `Deletes multiple expenses.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/expenses/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_getExpenses", {
    name: "ExpensesController_getExpenses",
    description: `Get the expense transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/expenses",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_createExpense", {
    name: "ExpensesController_createExpense",
    description: `Create a new expense transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"referenceNo":{"type":"string","description":"The reference number of the expense"},"paymentDate":{"format":"date-time","type":"string","description":"The payment date of the expense"},"paymentAccountId":{"type":"number","description":"The payment account id of the expense"},"description":{"type":"string","description":"The description of the expense"},"exchangeRate":{"type":"number","description":"The exchange rate of the expense"},"currencyCode":{"type":"string","description":"The currency code of the expense"},"publish":{"type":"boolean","description":"The publish status of the expense"},"payeeId":{"type":"number","description":"The payee id of the expense"},"branchId":{"type":"number","description":"The branch id of the expense"},"categories":{"description":"The categories of the expense","type":"array","items":{"type":"string"}},"attachments":{"description":"The attachments of the expense","type":"array","items":{"type":"string"}}},"required":["referenceNo","paymentDate","paymentAccountId","description","exchangeRate","currencyCode","publish","payeeId","branchId","categories","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/expenses",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_getExpense", {
    name: "ExpensesController_getExpense",
    description: `Get the expense transaction details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/expenses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_editExpense", {
    name: "ExpensesController_editExpense",
    description: `Edit the given expense transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"referenceNo":{"type":"string","description":"The reference number of the expense"},"paymentDate":{"format":"date-time","type":"string","description":"The payment date of the expense"},"paymentAccountId":{"type":"number","description":"The payment account id of the expense"},"description":{"type":"string","description":"The description of the expense"},"exchangeRate":{"type":"number","description":"The exchange rate of the expense"},"currencyCode":{"type":"string","description":"The currency code of the expense"},"publish":{"type":"boolean","description":"The publish status of the expense"},"payeeId":{"type":"number","description":"The payee id of the expense"},"branchId":{"type":"number","description":"The branch id of the expense"},"categories":{"description":"The categories of the expense","type":"array","items":{"type":"string"}},"attachments":{"description":"The attachments of the expense","type":"array","items":{"type":"string"}}},"required":["referenceNo","paymentDate","paymentAccountId","description","exchangeRate","currencyCode","publish","payeeId","branchId","categories","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/expenses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_deleteExpense", {
    name: "ExpensesController_deleteExpense",
    description: `Delete the given expense transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/expenses/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExpensesController_publishExpense", {
    name: "ExpensesController_publishExpense",
    description: `Publish the given expense transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/expenses/{id}/publish",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_getWarehousesTransfers", {
    name: "WarehouseTransfersController_getWarehousesTransfers",
    description: `Retrieve warehouse transfer transactions with pagination.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/warehouse-transfers",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_createWarehouseTransfer", {
    name: "WarehouseTransfersController_createWarehouseTransfer",
    description: `Create a new warehouse transfer transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"fromWarehouseId":{"type":"number","description":"The id of the warehouse to transfer from"},"toWarehouseId":{"type":"number","description":"The id of the warehouse to transfer to"},"date":{"format":"date-time","type":"string","description":"The date of the warehouse transfer"},"transactionNumber":{"type":"string","description":"The transaction number of the warehouse transfer"},"transferInitiated":{"type":"boolean","description":"Whether the warehouse transfer has been initiated"},"transferDelivered":{"type":"boolean","description":"Whether the warehouse transfer has been delivered"},"entries":{"description":"The entries of the warehouse transfer","type":"array","items":{"type":"string"}}},"required":["fromWarehouseId","toWarehouseId","date","transactionNumber","transferInitiated","transferDelivered","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/warehouse-transfers",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_getWarehouseTransfer", {
    name: "WarehouseTransfersController_getWarehouseTransfer",
    description: `Retrieve warehouse transfer transaction details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/warehouse-transfers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_editWarehouseTransfer", {
    name: "WarehouseTransfersController_editWarehouseTransfer",
    description: `Edit the given warehouse transfer transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"fromWarehouseId":{"type":"number","description":"The id of the warehouse to transfer from"},"toWarehouseId":{"type":"number","description":"The id of the warehouse to transfer to"},"date":{"format":"date-time","type":"string","description":"The date of the warehouse transfer"},"transactionNumber":{"type":"string","description":"The transaction number of the warehouse transfer"},"transferInitiated":{"type":"boolean","description":"Whether the warehouse transfer has been initiated"},"transferDelivered":{"type":"boolean","description":"Whether the warehouse transfer has been delivered"},"entries":{"description":"The entries of the warehouse transfer","type":"array","items":{"type":"string"}}},"required":["fromWarehouseId","toWarehouseId","date","transactionNumber","transferInitiated","transferDelivered","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "post",
    pathTemplate: "/api/warehouse-transfers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_deleteWarehouseTransfer", {
    name: "WarehouseTransfersController_deleteWarehouseTransfer",
    description: `Delete the given warehouse transfer transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/warehouse-transfers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_initiateTransfer", {
    name: "WarehouseTransfersController_initiateTransfer",
    description: `Initiate the given warehouse transfer.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/warehouse-transfers/{id}/initiate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["WarehouseTransfersController_deliverTransfer", {
    name: "WarehouseTransfersController_deliverTransfer",
    description: `Mark the given warehouse transfer as transferred.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/warehouse-transfers/{id}/transferred",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_getCustomer", {
    name: "CustomersController_getCustomer",
    description: `Retrieves the customer details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/customers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_editCustomer", {
    name: "CustomersController_editCustomer",
    description: `Edit the given customer.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"billingAddress1":{"type":"string","description":"Billing address line 1"},"billingAddress2":{"type":"string","description":"Billing address line 2"},"billingAddressCity":{"type":"string","description":"Billing address city"},"billingAddressCountry":{"type":"string","description":"Billing address country"},"billingAddressEmail":{"type":"string","description":"Billing address email"},"billingAddressPostcode":{"type":"string","description":"Billing address postcode"},"billingAddressPhone":{"type":"string","description":"Billing address phone"},"billingAddressState":{"type":"string","description":"Billing address state"},"shippingAddress1":{"type":"string","description":"Shipping address line 1"},"shippingAddress2":{"type":"string","description":"Shipping address line 2"},"shippingAddressCity":{"type":"string","description":"Shipping address city"},"shippingAddressCountry":{"type":"string","description":"Shipping address country"},"shippingAddressEmail":{"type":"string","description":"Shipping address email"},"shippingAddressPostcode":{"type":"string","description":"Shipping address postcode"},"shippingAddressPhone":{"type":"string","description":"Shipping address phone"},"shippingAddressState":{"type":"string","description":"Shipping address state"},"customerType":{"type":"string","description":"Customer type"},"salutation":{"type":"string","description":"Salutation"},"firstName":{"type":"string","description":"First name"},"lastName":{"type":"string","description":"Last name"},"companyName":{"type":"string","description":"Company name"},"displayName":{"type":"string","description":"Display name"},"website":{"type":"string","description":"Website"},"email":{"type":"string","description":"Email"},"workPhone":{"type":"string","description":"Work phone"},"personalPhone":{"type":"string","description":"Personal phone"},"note":{"type":"string","description":"Note"},"active":{"type":"boolean","description":"Active status"},"code":{"type":"string","description":"Customer code"}},"required":["customerType","displayName"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/customers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_deleteCustomer", {
    name: "CustomersController_deleteCustomer",
    description: `Delete the given customer.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/customers/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_getCustomers", {
    name: "CustomersController_getCustomers",
    description: `Retrieves the customers paginated list.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/customers",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_createCustomer", {
    name: "CustomersController_createCustomer",
    description: `Create a new customer.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"billingAddress1":{"type":"string","description":"Billing address line 1"},"billingAddress2":{"type":"string","description":"Billing address line 2"},"billingAddressCity":{"type":"string","description":"Billing address city"},"billingAddressCountry":{"type":"string","description":"Billing address country"},"billingAddressEmail":{"type":"string","description":"Billing address email"},"billingAddressPostcode":{"type":"string","description":"Billing address postcode"},"billingAddressPhone":{"type":"string","description":"Billing address phone"},"billingAddressState":{"type":"string","description":"Billing address state"},"shippingAddress1":{"type":"string","description":"Shipping address line 1"},"shippingAddress2":{"type":"string","description":"Shipping address line 2"},"shippingAddressCity":{"type":"string","description":"Shipping address city"},"shippingAddressCountry":{"type":"string","description":"Shipping address country"},"shippingAddressEmail":{"type":"string","description":"Shipping address email"},"shippingAddressPostcode":{"type":"string","description":"Shipping address postcode"},"shippingAddressPhone":{"type":"string","description":"Shipping address phone"},"shippingAddressState":{"type":"string","description":"Shipping address state"},"customerType":{"type":"string","description":"Customer type"},"currencyCode":{"type":"string","description":"Currency code"},"openingBalance":{"type":"number","description":"Opening balance"},"openingBalanceAt":{"type":"string","description":"Opening balance date (required when openingBalance is provided)"},"openingBalanceExchangeRate":{"type":"number","description":"Opening balance exchange rate"},"openingBalanceBranchId":{"type":"number","description":"Opening balance branch ID"},"salutation":{"type":"string","description":"Salutation"},"firstName":{"type":"string","description":"First name"},"lastName":{"type":"string","description":"Last name"},"companyName":{"type":"string","description":"Company name"},"displayName":{"type":"string","description":"Display name"},"website":{"type":"string","description":"Website"},"email":{"type":"string","description":"Email"},"workPhone":{"type":"string","description":"Work phone"},"personalPhone":{"type":"string","description":"Personal phone"},"note":{"type":"string","description":"Note"},"active":{"type":"boolean","description":"Active status","default":true},"code":{"type":"string","description":"Customer code"}},"required":["customerType","currencyCode","displayName"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/customers",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_editOpeningBalance", {
    name: "CustomersController_editOpeningBalance",
    description: `Edit the opening balance of the given customer.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"openingBalance":{"type":"number","description":"Opening balance"},"openingBalanceAt":{"type":"string","description":"Opening balance date"},"openingBalanceExchangeRate":{"type":"number","description":"Opening balance exchange rate"},"openingBalanceBranchId":{"type":"number","description":"Opening balance branch ID"}},"required":["openingBalance"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/customers/{id}/opening-balance",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_validateBulkDeleteCustomers", {
    name: "CustomersController_validateBulkDeleteCustomers",
    description: `Validates which customers can be deleted and returns counts of deletable and non-deletable customers.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of customer IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable customers will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/customers/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomersController_bulkDeleteCustomers", {
    name: "CustomersController_bulkDeleteCustomers",
    description: `Deletes multiple customers in bulk.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of customer IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable customers will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/customers/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_getVendors", {
    name: "VendorsController_getVendors",
    description: `Retrieves the vendors.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/vendors",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_createVendor", {
    name: "VendorsController_createVendor",
    description: `Create a new vendor.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"billingAddress1":{"type":"string","description":"Billing address line 1"},"billingAddress2":{"type":"string","description":"Billing address line 2"},"billingAddressCity":{"type":"string","description":"Billing address city"},"billingAddressCountry":{"type":"string","description":"Billing address country"},"billingAddressEmail":{"type":"string","description":"Billing address email"},"billingAddressPostcode":{"type":"string","description":"Billing address postcode"},"billingAddressPhone":{"type":"string","description":"Billing address phone"},"billingAddressState":{"type":"string","description":"Billing address state"},"shippingAddress1":{"type":"string","description":"Shipping address line 1"},"shippingAddress2":{"type":"string","description":"Shipping address line 2"},"shippingAddressCity":{"type":"string","description":"Shipping address city"},"shippingAddressCountry":{"type":"string","description":"Shipping address country"},"shippingAddressEmail":{"type":"string","description":"Shipping address email"},"shippingAddressPostcode":{"type":"string","description":"Shipping address postcode"},"shippingAddressPhone":{"type":"string","description":"Shipping address phone"},"shippingAddressState":{"type":"string","description":"Shipping address state"},"openingBalance":{"type":"number","description":"Vendor opening balance"},"openingBalanceExchangeRate":{"type":"number","description":"Vendor opening balance exchange rate","default":1},"openingBalanceAt":{"format":"date-time","type":"string","description":"Date of the opening balance (required when openingBalance is provided)"},"openingBalanceBranchId":{"type":"number","description":"Branch ID for the opening balance"},"currencyCode":{"type":"string","description":"Currency code for the vendor"},"salutation":{"type":"string","description":"Vendor salutation"},"firstName":{"type":"string","description":"Vendor first name"},"lastName":{"type":"string","description":"Vendor last name"},"companyName":{"type":"string","description":"Vendor company name"},"displayName":{"type":"string","description":"Vendor display name"},"website":{"type":"string","description":"Vendor website"},"email":{"type":"string","description":"Vendor email address"},"workPhone":{"type":"string","description":"Vendor work phone number"},"personalPhone":{"type":"string","description":"Vendor personal phone number"},"note":{"type":"string","description":"Additional notes about the vendor"},"active":{"type":"boolean","description":"Whether the vendor is active","default":true},"code":{"type":"string","description":"Vendor code"}},"required":["currencyCode"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendors",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_getVendor", {
    name: "VendorsController_getVendor",
    description: `Retrieves the vendor details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/vendors/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_editVendor", {
    name: "VendorsController_editVendor",
    description: `Edit the given vendor.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"billingAddress1":{"type":"string","description":"Billing address line 1"},"billingAddress2":{"type":"string","description":"Billing address line 2"},"billingAddressCity":{"type":"string","description":"Billing address city"},"billingAddressCountry":{"type":"string","description":"Billing address country"},"billingAddressEmail":{"type":"string","description":"Billing address email"},"billingAddressPostcode":{"type":"string","description":"Billing address postcode"},"billingAddressPhone":{"type":"string","description":"Billing address phone"},"billingAddressState":{"type":"string","description":"Billing address state"},"shippingAddress1":{"type":"string","description":"Shipping address line 1"},"shippingAddress2":{"type":"string","description":"Shipping address line 2"},"shippingAddressCity":{"type":"string","description":"Shipping address city"},"shippingAddressCountry":{"type":"string","description":"Shipping address country"},"shippingAddressEmail":{"type":"string","description":"Shipping address email"},"shippingAddressPostcode":{"type":"string","description":"Shipping address postcode"},"shippingAddressPhone":{"type":"string","description":"Shipping address phone"},"shippingAddressState":{"type":"string","description":"Shipping address state"},"salutation":{"type":"string","description":"Vendor salutation"},"firstName":{"type":"string","description":"Vendor first name"},"lastName":{"type":"string","description":"Vendor last name"},"companyName":{"type":"string","description":"Vendor company name"},"displayName":{"type":"string","description":"Vendor display name"},"website":{"type":"string","description":"Vendor website"},"email":{"type":"string","description":"Vendor email address"},"workPhone":{"type":"string","description":"Vendor work phone number"},"personalPhone":{"type":"string","description":"Vendor personal phone number"},"note":{"type":"string","description":"Additional notes about the vendor"},"active":{"type":"boolean","description":"Whether the vendor is active"},"code":{"type":"string","description":"Vendor code"}},"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/vendors/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_deleteVendor", {
    name: "VendorsController_deleteVendor",
    description: `Delete the given vendor.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/vendors/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_editOpeningBalance", {
    name: "VendorsController_editOpeningBalance",
    description: `Edit the given vendor opening balance.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"openingBalance":{"type":"number","description":"Opening balance"},"openingBalanceAt":{"type":"string","description":"Opening balance date"},"openingBalanceExchangeRate":{"type":"number","description":"Opening balance exchange rate"},"openingBalanceBranchId":{"type":"number","description":"Opening balance branch ID"}},"required":["openingBalance"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/vendors/{id}/opening-balance",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_validateBulkDeleteVendors", {
    name: "VendorsController_validateBulkDeleteVendors",
    description: `Validates which vendors can be deleted and returns counts of deletable and non-deletable vendors.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of vendor IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable vendors will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendors/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorsController_bulkDeleteVendors", {
    name: "VendorsController_bulkDeleteVendors",
    description: `Deletes multiple vendors in bulk.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of vendor IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable vendors will be skipped and only deletable ones removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendors/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_validateBulkDeleteSaleEstimates", {
    name: "SaleEstimatesController_validateBulkDeleteSaleEstimates",
    description: `Validates which sale estimates can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-estimates/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_bulkDeleteSaleEstimates", {
    name: "SaleEstimatesController_bulkDeleteSaleEstimates",
    description: `Deletes multiple sale estimates.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-estimates/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_getSaleEstimates", {
    name: "SaleEstimatesController_getSaleEstimates",
    description: `Retrieves the sale estimates.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-estimates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_createSaleEstimate", {
    name: "SaleEstimatesController_createSaleEstimate",
    description: `Create a new sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"estimateDate":{"format":"date-time","type":"string","description":"The date of the estimate"},"expirationDate":{"format":"date-time","type":"string","description":"The expiration date of the estimate"},"reference":{"type":"string","description":"The reference of the estimate"},"exchangeRate":{"type":"number","description":"The exchange rate of the estimate"},"warehouseId":{"type":"number","description":"The id of the warehouse"},"branchId":{"type":"number","description":"The id of the branch"},"entries":{"description":"The entries of the estimate","type":"array","items":{"type":"string"}},"note":{"type":"string","description":"The note of the estimate"},"termsConditions":{"type":"string","description":"The terms and conditions of the estimate"},"sendToEmail":{"type":"string","description":"The email to send the estimate to"},"attachments":{"description":"The attachments of the estimate","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The id of the pdf template"},"discount":{"type":"number","description":"The discount of the estimate"},"discountType":{"type":"string","description":"The type of the discount"},"adjustment":{"type":"number","description":"The adjustment of the estimate"}},"required":["customerId","estimateDate","expirationDate","reference","exchangeRate","warehouseId","branchId","entries","note","termsConditions","sendToEmail","attachments","pdfTemplateId","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-estimates",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_getSaleEstimate", {
    name: "SaleEstimatesController_getSaleEstimate",
    description: `Retrieves the sale estimate details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"},"accept":{"type":"string"}},"required":["Authorization","organization-id","id","accept"]},
    method: "get",
    pathTemplate: "/api/sale-estimates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_editSaleEstimate", {
    name: "SaleEstimatesController_editSaleEstimate",
    description: `Edit the given sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"estimateDate":{"format":"date-time","type":"string","description":"The date of the estimate"},"expirationDate":{"format":"date-time","type":"string","description":"The expiration date of the estimate"},"reference":{"type":"string","description":"The reference of the estimate"},"exchangeRate":{"type":"number","description":"The exchange rate of the estimate"},"warehouseId":{"type":"number","description":"The id of the warehouse"},"branchId":{"type":"number","description":"The id of the branch"},"entries":{"description":"The entries of the estimate","type":"array","items":{"type":"string"}},"note":{"type":"string","description":"The note of the estimate"},"termsConditions":{"type":"string","description":"The terms and conditions of the estimate"},"sendToEmail":{"type":"string","description":"The email to send the estimate to"},"attachments":{"description":"The attachments of the estimate","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The id of the pdf template"},"discount":{"type":"number","description":"The discount of the estimate"},"discountType":{"type":"string","description":"The type of the discount"},"adjustment":{"type":"number","description":"The adjustment of the estimate"}},"required":["customerId","estimateDate","expirationDate","reference","exchangeRate","warehouseId","branchId","entries","note","termsConditions","sendToEmail","attachments","pdfTemplateId","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/sale-estimates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_deleteSaleEstimate", {
    name: "SaleEstimatesController_deleteSaleEstimate",
    description: `Delete the given sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/sale-estimates/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_getSaleEstimateState", {
    name: "SaleEstimatesController_getSaleEstimateState",
    description: `Retrieves the sale estimate state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-estimates/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_deliverSaleEstimate", {
    name: "SaleEstimatesController_deliverSaleEstimate",
    description: `Deliver the given sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-estimates/{id}/deliver",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_approveSaleEstimate", {
    name: "SaleEstimatesController_approveSaleEstimate",
    description: `Approve the given sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/sale-estimates/{id}/approve",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_rejectSaleEstimate", {
    name: "SaleEstimatesController_rejectSaleEstimate",
    description: `Reject the given sale estimate.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/sale-estimates/{id}/reject",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_notifySaleEstimateBySms", {
    name: "SaleEstimatesController_notifySaleEstimateBySms",
    description: `Notify the given sale estimate by SMS.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-estimates/{id}/notify-sms",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_getSaleEstimateSmsDetails", {
    name: "SaleEstimatesController_getSaleEstimateSmsDetails",
    description: `Retrieves the sale estimate SMS details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-estimates/{id}/sms-details",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_getSaleEstimateMail", {
    name: "SaleEstimatesController_getSaleEstimateMail",
    description: `Retrieves the sale estimate mail state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-estimates/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleEstimatesController_sendSaleEstimateMail", {
    name: "SaleEstimatesController_sendSaleEstimateMail",
    description: `Send the given sale estimate by mail.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale estimate id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-estimates/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_validateBulkDeleteSaleReceipts", {
    name: "SaleReceiptsController_validateBulkDeleteSaleReceipts",
    description: `Validates which sale receipts can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-receipts/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_bulkDeleteSaleReceipts", {
    name: "SaleReceiptsController_bulkDeleteSaleReceipts",
    description: `Deletes multiple sale receipts.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-receipts/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_getSaleReceipts", {
    name: "SaleReceiptsController_getSaleReceipts",
    description: `Retrieves the sale receipts paginated list`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-receipts",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_createSaleReceipt", {
    name: "SaleReceiptsController_createSaleReceipt",
    description: `Create a new sale receipt.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"exchangeRate":{"type":"number","description":"The exchange rate of the sale receipt"},"depositAccountId":{"type":"number","description":"The id of the deposit account"},"receiptDate":{"format":"date-time","type":"string","description":"The date of the sale receipt"},"receiptNumber":{"type":"string","description":"The receipt number of the sale receipt"},"referenceNo":{"type":"string","description":"The reference number of the sale receipt"},"closed":{"type":"boolean","description":"Whether the sale receipt is closed"},"warehouseId":{"type":"number","description":"The id of the warehouse"},"branchId":{"type":"number","description":"The id of the branch"},"entries":{"description":"The entries of the sale receipt","type":"array","items":{"type":"string"}},"receiptMessage":{"type":"string","description":"The receipt message of the sale receipt"},"statement":{"type":"string","description":"The statement of the sale receipt"},"attachments":{"description":"The attachments of the sale receipt","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The id of the pdf template"},"discount":{"type":"number","description":"The discount of the sale receipt"},"discountType":{"type":"string","description":"The discount type of the sale receipt"},"adjustment":{"type":"number","description":"The adjustment of the sale receipt"}},"required":["customerId","exchangeRate","depositAccountId","receiptDate","receiptNumber","referenceNo","closed","warehouseId","branchId","entries","receiptMessage","statement","attachments","pdfTemplateId","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/sale-receipts",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_getSaleReceiptMail", {
    name: "SaleReceiptsController_getSaleReceiptMail",
    description: `Retrieves the sale receipt mail.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/sale-receipts/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_sendSaleReceiptMail", {
    name: "SaleReceiptsController_sendSaleReceiptMail",
    description: `Send the sale receipt mail.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-receipts/{id}/mail",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_getSaleReceiptState", {
    name: "SaleReceiptsController_getSaleReceiptState",
    description: `Retrieves the sale receipt state.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/sale-receipts/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_getSaleReceipt", {
    name: "SaleReceiptsController_getSaleReceipt",
    description: `Retrieves the sale receipt details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"},"accept":{"type":"string"}},"required":["Authorization","organization-id","id","accept"]},
    method: "get",
    pathTemplate: "/api/sale-receipts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_editSaleReceipt", {
    name: "SaleReceiptsController_editSaleReceipt",
    description: `Edit the given sale receipt.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The id of the customer"},"exchangeRate":{"type":"number","description":"The exchange rate of the sale receipt"},"depositAccountId":{"type":"number","description":"The id of the deposit account"},"receiptDate":{"format":"date-time","type":"string","description":"The date of the sale receipt"},"receiptNumber":{"type":"string","description":"The receipt number of the sale receipt"},"referenceNo":{"type":"string","description":"The reference number of the sale receipt"},"closed":{"type":"boolean","description":"Whether the sale receipt is closed"},"warehouseId":{"type":"number","description":"The id of the warehouse"},"branchId":{"type":"number","description":"The id of the branch"},"entries":{"description":"The entries of the sale receipt","type":"array","items":{"type":"string"}},"receiptMessage":{"type":"string","description":"The receipt message of the sale receipt"},"statement":{"type":"string","description":"The statement of the sale receipt"},"attachments":{"description":"The attachments of the sale receipt","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The id of the pdf template"},"discount":{"type":"number","description":"The discount of the sale receipt"},"discountType":{"type":"string","description":"The discount type of the sale receipt"},"adjustment":{"type":"number","description":"The adjustment of the sale receipt"}},"required":["customerId","exchangeRate","depositAccountId","receiptDate","receiptNumber","referenceNo","closed","warehouseId","branchId","entries","receiptMessage","statement","attachments","pdfTemplateId","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/sale-receipts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_deleteSaleReceipt", {
    name: "SaleReceiptsController_deleteSaleReceipt",
    description: `Delete the given sale receipt.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/sale-receipts/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SaleReceiptsController_closeSaleReceipt", {
    name: "SaleReceiptsController_closeSaleReceipt",
    description: `Close the given sale receipt.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The sale receipt id"}},"required":["Authorization","organization-id","id"]},
    method: "post",
    pathTemplate: "/api/sale-receipts/{id}/close",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_validateBulkDeleteBills", {
    name: "BillsController_validateBulkDeleteBills",
    description: `Validate which bills can be deleted and return the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/bills/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_bulkDeleteBills", {
    name: "BillsController_bulkDeleteBills",
    description: `Deletes multiple bills.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/bills/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_getBills", {
    name: "BillsController_getBills",
    description: `Retrieves the bills.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"},"id":{"type":"number","description":"The bill id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_createBill", {
    name: "BillsController_createBill",
    description: `Create a new bill.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"billNumber":{"type":"string","description":"Unique bill number"},"referenceNo":{"type":"string","description":"Reference number"},"billDate":{"format":"date-time","type":"string","description":"Date the bill was issued"},"dueDate":{"format":"date-time","type":"string","description":"Date the bill is due"},"vendorId":{"type":"number","description":"Vendor identifier"},"exchangeRate":{"type":"number","description":"Exchange rate applied to bill amounts"},"warehouseId":{"type":"number","description":"Warehouse identifier"},"branchId":{"type":"number","description":"Branch identifier"},"projectId":{"type":"number","description":"Project identifier"},"note":{"type":"string","description":"Additional notes about the bill"},"open":{"type":"boolean","description":"Indicates if the bill is open"},"isInclusiveTax":{"type":"boolean","description":"Indicates if tax is inclusive in prices"},"entries":{"description":"Bill line items","type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"The index of the item entry"},"itemId":{"type":"number","description":"The id of the item"},"rate":{"type":"number","description":"The rate of the item entry"},"quantity":{"type":"number","description":"The quantity of the item entry"},"discount":{"type":"number","description":"The discount of the item entry"},"discountType":{"type":"string","description":"The type of the discount"},"description":{"type":"string","description":"The description of the item entry"},"taxCode":{"type":"string","description":"The tax code of the item entry"},"taxRateId":{"type":"number","description":"The tax rate id of the item entry"},"warehouseId":{"type":"number","description":"The warehouse id of the item entry"},"projectId":{"type":"number","description":"The project id of the item entry"},"projectRefId":{"type":"number","description":"The project ref id of the item entry"},"projectRefType":{"type":"string","description":"The project ref type of the item entry"},"projectRefInvoicedAmount":{"type":"number","description":"The project ref invoiced amount of the item entry"},"sellAccountId":{"type":"number","description":"The sell account id of the item entry"},"costAccountId":{"type":"number","description":"The cost account id of the item entry"},"landedCost":{"type":"boolean","description":"Flag indicating whether the entry contributes to landed cost"}},"required":["index","itemId","rate","quantity","discount","discountType","description","taxCode","taxRateId","warehouseId","projectId","projectRefId","projectRefType","projectRefInvoicedAmount","sellAccountId","costAccountId"]}},"attachments":{"description":"File attachments associated with the bill","type":"array","items":{"type":"object","properties":{"key":{"type":"string","description":"Storage key of the attachment file"}},"required":["key"]}},"discountType":{"type":"string","description":"Type of discount applied","enum":["percentage","amount"]},"discount":{"type":"number","description":"Discount value"},"adjustment":{"type":"number","description":"Adjustment value"}},"required":["billDate","vendorId","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_getBill", {
    name: "BillsController_getBill",
    description: `Retrieves the bill details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The bill id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/bills/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_editBill", {
    name: "BillsController_editBill",
    description: `Edit the given bill.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The bill id"},"requestBody":{"type":"object","properties":{"billNumber":{"type":"string","description":"Unique bill number"},"referenceNo":{"type":"string","description":"Reference number"},"billDate":{"format":"date-time","type":"string","description":"Date the bill was issued"},"dueDate":{"format":"date-time","type":"string","description":"Date the bill is due"},"vendorId":{"type":"number","description":"Vendor identifier"},"exchangeRate":{"type":"number","description":"Exchange rate applied to bill amounts"},"warehouseId":{"type":"number","description":"Warehouse identifier"},"branchId":{"type":"number","description":"Branch identifier"},"projectId":{"type":"number","description":"Project identifier"},"note":{"type":"string","description":"Additional notes about the bill"},"open":{"type":"boolean","description":"Indicates if the bill is open"},"isInclusiveTax":{"type":"boolean","description":"Indicates if tax is inclusive in prices"},"entries":{"description":"Bill line items","type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"The index of the item entry"},"itemId":{"type":"number","description":"The id of the item"},"rate":{"type":"number","description":"The rate of the item entry"},"quantity":{"type":"number","description":"The quantity of the item entry"},"discount":{"type":"number","description":"The discount of the item entry"},"discountType":{"type":"string","description":"The type of the discount"},"description":{"type":"string","description":"The description of the item entry"},"taxCode":{"type":"string","description":"The tax code of the item entry"},"taxRateId":{"type":"number","description":"The tax rate id of the item entry"},"warehouseId":{"type":"number","description":"The warehouse id of the item entry"},"projectId":{"type":"number","description":"The project id of the item entry"},"projectRefId":{"type":"number","description":"The project ref id of the item entry"},"projectRefType":{"type":"string","description":"The project ref type of the item entry"},"projectRefInvoicedAmount":{"type":"number","description":"The project ref invoiced amount of the item entry"},"sellAccountId":{"type":"number","description":"The sell account id of the item entry"},"costAccountId":{"type":"number","description":"The cost account id of the item entry"},"landedCost":{"type":"boolean","description":"Flag indicating whether the entry contributes to landed cost"}},"required":["index","itemId","rate","quantity","discount","discountType","description","taxCode","taxRateId","warehouseId","projectId","projectRefId","projectRefType","projectRefInvoicedAmount","sellAccountId","costAccountId"]}},"attachments":{"description":"File attachments associated with the bill","type":"array","items":{"type":"object","properties":{"key":{"type":"string","description":"Storage key of the attachment file"}},"required":["key"]}},"discountType":{"type":"string","description":"Type of discount applied","enum":["percentage","amount"]},"discount":{"type":"number","description":"Discount value"},"adjustment":{"type":"number","description":"Adjustment value"}},"required":["billDate","vendorId","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/bills/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_deleteBill", {
    name: "BillsController_deleteBill",
    description: `Delete the given bill.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The bill id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/bills/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_getBillPaymentTransactions", {
    name: "BillsController_getBillPaymentTransactions",
    description: `Retrieve the specific bill associated payment transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The bill id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/bills/{id}/payment-transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_openBill", {
    name: "BillsController_openBill",
    description: `Open the given bill.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The bill id"}},"required":["Authorization","organization-id","id"]},
    method: "patch",
    pathTemplate: "/api/bills/{id}/open",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillsController_getDueBills", {
    name: "BillsController_getDueBills",
    description: `Retrieves the due bills.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendor_id":{"type":"number","description":"Filter due bills by vendor ID."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/bills/due",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendor_id","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillAllocateLandedCostController_getLandedCostTransactions", {
    name: "BillAllocateLandedCostController_getLandedCostTransactions",
    description: `Get landed cost transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/landed-cost/transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillAllocateLandedCostController_calculateLandedCost", {
    name: "BillAllocateLandedCostController_calculateLandedCost",
    description: `Allocate landed cost to bill items`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billId":{"type":"number"},"requestBody":{"type":"object","properties":{},"description":"The JSON request body."}},"required":["Authorization","organization-id","billId","requestBody"]},
    method: "post",
    pathTemplate: "/api/landed-cost/bills/{billId}/allocate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillAllocateLandedCostController_deleteAllocatedLandedCost", {
    name: "BillAllocateLandedCostController_deleteAllocatedLandedCost",
    description: `Delete allocated landed cost`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"allocatedLandedCostId":{"type":"number"}},"required":["Authorization","organization-id","allocatedLandedCostId"]},
    method: "delete",
    pathTemplate: "/api/landed-cost/{allocatedLandedCostId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"allocatedLandedCostId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillAllocateLandedCostController_getBillLandedCostTransactions", {
    name: "BillAllocateLandedCostController_getBillLandedCostTransactions",
    description: `Get bill landed cost transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billId":{"type":"number"}},"required":["Authorization","organization-id","billId"]},
    method: "get",
    pathTemplate: "/api/landed-cost/bills/{billId}/transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_validateBulkDeleteManualJournals", {
    name: "ManualJournalsController_validateBulkDeleteManualJournals",
    description: `Validate which manual journals can be deleted and return the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/manual-journals/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_bulkDeleteManualJournals", {
    name: "ManualJournalsController_bulkDeleteManualJournals",
    description: `Deletes multiple manual journals.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/manual-journals/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_getManualJournals", {
    name: "ManualJournalsController_getManualJournals",
    description: `Retrieves the manual journals paginated list.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/manual-journals",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_createManualJournal", {
    name: "ManualJournalsController_createManualJournal",
    description: `Create a new manual journal.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"date":{"format":"date-time","type":"string","description":"Journal date"},"currencyCode":{"type":"string","description":"Currency code"},"exchangeRate":{"type":"number","description":"Exchange rate"},"journalNumber":{"type":"string","description":"Journal number"},"journalType":{"type":"string","description":"Journal type"},"reference":{"type":"string","description":"Reference"},"description":{"type":"string","description":"Description"},"branchId":{"type":"number","description":"Branch ID"},"publish":{"type":"boolean","description":"Publish status"},"entries":{"description":"Journal entries","type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"Entry index"},"credit":{"type":"number","description":"Credit amount"},"debit":{"type":"number","description":"Debit amount"},"accountId":{"type":"number","description":"Account ID"},"note":{"type":"string","description":"Entry note"},"contactId":{"type":"number","description":"Contact ID"},"branchId":{"type":"number","description":"Branch ID"},"projectId":{"type":"number","description":"Project ID"}},"required":["index","accountId"]}},"attachments":{"description":"Attachments","type":"array","items":{"type":"object","properties":{"key":{"type":"string","description":"Storage key of the attachment file"}},"required":["key"]}}},"required":["date","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/manual-journals",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_getManualJournal", {
    name: "ManualJournalsController_getManualJournal",
    description: `Retrieves the manual journal details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The manual journal id"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/manual-journals/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_editManualJournal", {
    name: "ManualJournalsController_editManualJournal",
    description: `Edit the given manual journal.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The manual journal id"},"requestBody":{"type":"object","properties":{"date":{"format":"date-time","type":"string","description":"Journal date"},"currencyCode":{"type":"string","description":"Currency code"},"exchangeRate":{"type":"number","description":"Exchange rate"},"journalNumber":{"type":"string","description":"Journal number"},"journalType":{"type":"string","description":"Journal type"},"reference":{"type":"string","description":"Reference"},"description":{"type":"string","description":"Description"},"branchId":{"type":"number","description":"Branch ID"},"publish":{"type":"boolean","description":"Publish status"},"entries":{"description":"Journal entries","type":"array","items":{"type":"object","properties":{"index":{"type":"number","description":"Entry index"},"credit":{"type":"number","description":"Credit amount"},"debit":{"type":"number","description":"Debit amount"},"accountId":{"type":"number","description":"Account ID"},"note":{"type":"string","description":"Entry note"},"contactId":{"type":"number","description":"Contact ID"},"branchId":{"type":"number","description":"Branch ID"},"projectId":{"type":"number","description":"Project ID"}},"required":["index","accountId"]}},"attachments":{"description":"Attachments","type":"array","items":{"type":"object","properties":{"key":{"type":"string","description":"Storage key of the attachment file"}},"required":["key"]}}},"required":["date","entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/manual-journals/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_deleteManualJournal", {
    name: "ManualJournalsController_deleteManualJournal",
    description: `Delete the given manual journal.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The manual journal id"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/manual-journals/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ManualJournalsController_publishManualJournal", {
    name: "ManualJournalsController_publishManualJournal",
    description: `Publish the given manual journal.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"The manual journal id"}},"required":["Authorization","organization-id","id"]},
    method: "patch",
    pathTemplate: "/api/manual-journals/{id}/publish",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_getCreditNotes", {
    name: "CreditNotesController_getCreditNotes",
    description: `Get all credit notes`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/credit-notes",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_createCreditNote", {
    name: "CreditNotesController_createCreditNote",
    description: `Create a new credit note`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The customer ID"},"exchangeRate":{"type":"number","description":"The exchange rate"},"creditNoteDate":{"format":"date-time","type":"string","description":"The credit note date"},"referenceNo":{"type":"string","description":"The reference number"},"creditNoteNumber":{"type":"string","description":"The credit note number"},"note":{"type":"string","description":"The note"},"termsConditions":{"type":"string","description":"The terms and conditions"},"open":{"type":"boolean","description":"The credit note is open"},"warehouseId":{"type":"number","description":"The warehouse ID"},"branchId":{"type":"number","description":"The branch ID"},"entries":{"description":"The credit note entries","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The pdf template ID"},"discount":{"type":"number","description":"The discount amount"},"discountType":{"type":"string","description":"The discount type","enum":["percentage","amount"]}},"required":["customerId","exchangeRate","creditNoteDate","referenceNo","creditNoteNumber","note","termsConditions","open","warehouseId","branchId","entries","pdfTemplateId","discount","discountType"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/credit-notes",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_getCreditNoteState", {
    name: "CreditNotesController_getCreditNoteState",
    description: `Get credit note state`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/credit-notes/state",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_getCreditNote", {
    name: "CreditNotesController_getCreditNote",
    description: `Get a specific credit note by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Credit note ID"},"accept":{"type":"string"}},"required":["Authorization","organization-id","id","accept"]},
    method: "get",
    pathTemplate: "/api/credit-notes/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_editCreditNote", {
    name: "CreditNotesController_editCreditNote",
    description: `Update a credit note`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Credit note ID"},"requestBody":{"type":"object","properties":{"customerId":{"type":"number","description":"The customer ID"},"exchangeRate":{"type":"number","description":"The exchange rate"},"creditNoteDate":{"format":"date-time","type":"string","description":"The credit note date"},"referenceNo":{"type":"string","description":"The reference number"},"creditNoteNumber":{"type":"string","description":"The credit note number"},"note":{"type":"string","description":"The note"},"termsConditions":{"type":"string","description":"The terms and conditions"},"open":{"type":"boolean","description":"The credit note is open"},"warehouseId":{"type":"number","description":"The warehouse ID"},"branchId":{"type":"number","description":"The branch ID"},"entries":{"description":"The credit note entries","type":"array","items":{"type":"string"}},"pdfTemplateId":{"type":"number","description":"The pdf template ID"},"discount":{"type":"number","description":"The discount amount"},"discountType":{"type":"string","description":"The discount type","enum":["percentage","amount"]}},"required":["customerId","exchangeRate","creditNoteDate","referenceNo","creditNoteNumber","note","termsConditions","open","warehouseId","branchId","entries","pdfTemplateId","discount","discountType"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/credit-notes/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_deleteCreditNote", {
    name: "CreditNotesController_deleteCreditNote",
    description: `Delete a credit note`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Credit note ID"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/credit-notes/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_openCreditNote", {
    name: "CreditNotesController_openCreditNote",
    description: `Open a credit note`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Credit note ID"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/credit-notes/{id}/open",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_validateBulkDeleteCreditNotes", {
    name: "CreditNotesController_validateBulkDeleteCreditNotes",
    description: `Validates which credit notes can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/credit-notes/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesController_bulkDeleteCreditNotes", {
    name: "CreditNotesController_bulkDeleteCreditNotes",
    description: `Deletes multiple credit notes.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/credit-notes/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNoteRefundsController_getCreditNoteRefunds", {
    name: "CreditNoteRefundsController_getCreditNoteRefunds",
    description: `Retrieve the credit note graph.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"creditNoteId":{"type":"number"}},"required":["Authorization","organization-id","creditNoteId"]},
    method: "get",
    pathTemplate: "/api/credit-notes/{creditNoteId}/refunds",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"creditNoteId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNoteRefundsController_createRefundCreditNote", {
    name: "CreditNoteRefundsController_createRefundCreditNote",
    description: `Create a refund for the given credit note.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"creditNoteId":{"type":"number"},"requestBody":{"type":"object","properties":{"fromAccountId":{"type":"number","description":"The id of the from account"},"amount":{"type":"number","description":"The amount of the credit note refund"},"exchangeRate":{"type":"number","description":"The exchange rate of the credit note refund"},"referenceNo":{"type":"string","description":"The reference number of the credit note refund"},"description":{"type":"string","description":"The description of the credit note refund"},"date":{"format":"date-time","type":"string","description":"The date of the credit note refund"},"branchId":{"type":"number","description":"The id of the branch"}},"required":["fromAccountId","amount","exchangeRate","referenceNo","description","date","branchId"],"description":"The JSON request body."}},"required":["Authorization","organization-id","creditNoteId","requestBody"]},
    method: "post",
    pathTemplate: "/api/credit-notes/{creditNoteId}/refunds",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"creditNoteId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNoteRefundsController_getRefundCreditNoteTransaction", {
    name: "CreditNoteRefundsController_getRefundCreditNoteTransaction",
    description: `Retrieve a refund transaction for the given credit note.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"refundCreditId":{"type":"number"}},"required":["Authorization","organization-id","refundCreditId"]},
    method: "get",
    pathTemplate: "/api/credit-notes/refunds/{refundCreditId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"refundCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNoteRefundsController_deleteRefundCreditNote", {
    name: "CreditNoteRefundsController_deleteRefundCreditNote",
    description: `Delete a refund for the given credit note.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"refundCreditId":{"type":"number"}},"required":["Authorization","organization-id","refundCreditId"]},
    method: "delete",
    pathTemplate: "/api/credit-notes/refunds/{refundCreditId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"refundCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesApplyInvoice_appliedCreditNoteToInvoices", {
    name: "CreditNotesApplyInvoice_appliedCreditNoteToInvoices",
    description: `Applied credit note to invoices`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"creditNoteId":{"type":"number"}},"required":["Authorization","organization-id","creditNoteId"]},
    method: "get",
    pathTemplate: "/api/credit-notes/{creditNoteId}/applied-invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"creditNoteId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesApplyInvoice_getCreditNoteAssociatedInvoicesToApply", {
    name: "CreditNotesApplyInvoice_getCreditNoteAssociatedInvoicesToApply",
    description: `Get credit note associated invoices to apply`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"creditNoteId":{"type":"number"}},"required":["Authorization","organization-id","creditNoteId"]},
    method: "get",
    pathTemplate: "/api/credit-notes/{creditNoteId}/apply-invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"creditNoteId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesApplyInvoice_applyCreditNoteToInvoices", {
    name: "CreditNotesApplyInvoice_applyCreditNoteToInvoices",
    description: `Apply credit note to invoices`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"creditNoteId":{"type":"number"},"requestBody":{"type":"object","properties":{"entries":{"description":"Entries of invoice ID and amount to apply","type":"array","items":{"type":"object","properties":{"invoiceId":{"type":"number","description":"Invoice ID to apply credit to"},"amount":{"type":"number","description":"Amount to apply"}},"required":["invoiceId","amount"]}}},"required":["entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","creditNoteId","requestBody"]},
    method: "post",
    pathTemplate: "/api/credit-notes/{creditNoteId}/apply-invoices",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"creditNoteId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CreditNotesApplyInvoice_deleteApplyCreditNoteToInvoices", {
    name: "CreditNotesApplyInvoice_deleteApplyCreditNoteToInvoices",
    description: `Delete applied credit note to invoice`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"applyCreditToInvoicesId":{"type":"number"}},"required":["Authorization","organization-id","applyCreditToInvoicesId"]},
    method: "delete",
    pathTemplate: "/api/credit-notes/applied-invoices/{applyCreditToInvoicesId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"applyCreditToInvoicesId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_validateBulkDeleteVendorCredits", {
    name: "VendorCreditsController_validateBulkDeleteVendorCredits",
    description: `Validates which vendor credits can be deleted and returns the results.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendor-credits/validate-bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_bulkDeleteVendorCredits", {
    name: "VendorCreditsController_bulkDeleteVendorCredits",
    description: `Deletes multiple vendor credits.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"Array of IDs to delete","type":"array","items":{"type":"number"}},"skipUndeletable":{"type":"boolean","description":"When true, undeletable items will be skipped and only deletable ones will be removed.","default":false}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendor-credits/bulk-delete",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_getVendorCredits", {
    name: "VendorCreditsController_getVendorCredits",
    description: `Retrieves the vendor credits.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"type":"string","description":"Sort order (asc/desc)"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/vendor-credits",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_createVendorCredit", {
    name: "VendorCreditsController_createVendorCredit",
    description: `Create a new vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"vendorId":{"type":"number","description":"The id of the vendor"},"exchangeRate":{"type":"number","description":"The exchange rate of the vendor credit"},"vendorCreditNumber":{"type":"string","description":"The vendor credit number"},"referenceNo":{"type":"string","description":"The reference number of the vendor credit"},"vendorCreditDate":{"type":"string","description":"The date of the vendor credit"},"note":{"type":"string","description":"The note of the vendor credit"},"open":{"type":"boolean","description":"The open status of the vendor credit"},"warehouseId":{"type":"number","description":"The warehouse id of the vendor credit"},"branchId":{"type":"number","description":"The branch id of the vendor credit"},"entries":{"description":"The entries of the vendor credit","type":"array","items":{"type":"string"}},"attachments":{"description":"The attachments of the vendor credit","type":"array","items":{"type":"string"}},"discount":{"type":"number","description":"The discount of the vendor credit"},"discountType":{"type":"string","description":"The discount type of the vendor credit"},"adjustment":{"type":"number","description":"The adjustment of the vendor credit"}},"required":["vendorId","exchangeRate","vendorCreditNumber","referenceNo","vendorCreditDate","note","open","warehouseId","branchId","entries","attachments","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendor-credits",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_openVendorCredit", {
    name: "VendorCreditsController_openVendorCredit",
    description: `Open the given vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/vendor-credits/{id}/open",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_getVendorCredit", {
    name: "VendorCreditsController_getVendorCredit",
    description: `Retrieves the vendor credit details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/vendor-credits/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_editVendorCredit", {
    name: "VendorCreditsController_editVendorCredit",
    description: `Edit the given vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"vendorId":{"type":"number","description":"The id of the vendor"},"exchangeRate":{"type":"number","description":"The exchange rate of the vendor credit"},"vendorCreditNumber":{"type":"string","description":"The vendor credit number"},"referenceNo":{"type":"string","description":"The reference number of the vendor credit"},"vendorCreditDate":{"type":"string","description":"The date of the vendor credit"},"note":{"type":"string","description":"The note of the vendor credit"},"open":{"type":"boolean","description":"The open status of the vendor credit"},"warehouseId":{"type":"number","description":"The warehouse id of the vendor credit"},"branchId":{"type":"number","description":"The branch id of the vendor credit"},"entries":{"description":"The entries of the vendor credit","type":"array","items":{"type":"string"}},"attachments":{"description":"The attachments of the vendor credit","type":"array","items":{"type":"string"}},"discount":{"type":"number","description":"The discount of the vendor credit"},"discountType":{"type":"string","description":"The discount type of the vendor credit"},"adjustment":{"type":"number","description":"The adjustment of the vendor credit"}},"required":["vendorId","exchangeRate","vendorCreditNumber","referenceNo","vendorCreditDate","note","open","warehouseId","branchId","entries","attachments","discount","discountType","adjustment"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/vendor-credits/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsController_deleteVendorCredit", {
    name: "VendorCreditsController_deleteVendorCredit",
    description: `Delete the given vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/vendor-credits/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditApplyBillsController_getVendorCreditToApplyBills", {
    name: "VendorCreditApplyBillsController_getVendorCreditToApplyBills",
    description: `Get bills that can be applied with this vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditId":{"type":"number"}},"required":["Authorization","organization-id","vendorCreditId"]},
    method: "get",
    pathTemplate: "/api/vendor-credits/{vendorCreditId}/bills-to-apply",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditApplyBillsController_applyVendorCreditToBills", {
    name: "VendorCreditApplyBillsController_applyVendorCreditToBills",
    description: `Apply vendor credit to the given bills.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditId":{"type":"number"},"requestBody":{"type":"object","properties":{"entries":{"description":"Entries of bill ID and amount to apply","type":"array","items":{"type":"object","properties":{"billId":{"type":"number","description":"Bill ID to apply vendor credit to"},"amount":{"type":"number","description":"Amount to apply"}},"required":["billId","amount"]}}},"required":["entries"],"description":"The JSON request body."}},"required":["Authorization","organization-id","vendorCreditId","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendor-credits/{vendorCreditId}/apply-to-bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditApplyBillsController_deleteAppliedBillToVendorCredit", {
    name: "VendorCreditApplyBillsController_deleteAppliedBillToVendorCredit",
    description: `Remove an applied bill from the vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditAppliedBillId":{"type":"number"}},"required":["Authorization","organization-id","vendorCreditAppliedBillId"]},
    method: "delete",
    pathTemplate: "/api/vendor-credits/applied-bills/{vendorCreditAppliedBillId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditAppliedBillId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditApplyBillsController_getAppliedBillsToVendorCredit", {
    name: "VendorCreditApplyBillsController_getAppliedBillsToVendorCredit",
    description: `Get bills already applied to this vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditId":{"type":"number"}},"required":["Authorization","organization-id","vendorCreditId"]},
    method: "get",
    pathTemplate: "/api/vendor-credits/{vendorCreditId}/applied-bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_getBillPayments", {
    name: "BillPaymentsController_getBillPayments",
    description: `Retrieves the bill payments list.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/bill-payments",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_createBillPayment", {
    name: "BillPaymentsController_createBillPayment",
    description: `Create a new bill payment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"vendorId":{"type":"number","description":"The id of the vendor"},"amount":{"type":"number","description":"The amount of the bill payment"},"paymentAccountId":{"type":"number","description":"The id of the payment account"},"paymentNumber":{"type":"string","description":"The payment number of the bill payment"},"paymentDate":{"type":"object","description":"The payment date of the bill payment"},"exchangeRate":{"type":"number","description":"The exchange rate of the bill payment"},"statement":{"type":"string","description":"The statement of the bill payment"},"entries":{"description":"The entries of the bill payment","type":"array","items":{"type":"string"}},"branchId":{"type":"number","description":"The id of the branch"},"attachments":{"description":"The attachments of the bill payment","type":"array","items":{"type":"string"}}},"required":["vendorId","amount","paymentAccountId","paymentNumber","paymentDate","exchangeRate","statement","entries","branchId","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/bill-payments",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_getBillPayment", {
    name: "BillPaymentsController_getBillPayment",
    description: `Retrieves the bill payment details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billPaymentId":{"type":"number","description":"The bill payment id"}},"required":["Authorization","organization-id","billPaymentId"]},
    method: "get",
    pathTemplate: "/api/bill-payments/{billPaymentId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billPaymentId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_editBillPayment", {
    name: "BillPaymentsController_editBillPayment",
    description: `Edit the given bill payment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billPaymentId":{"type":"number","description":"The bill payment id"},"requestBody":{"type":"object","properties":{"vendorId":{"type":"number","description":"The id of the vendor"},"amount":{"type":"number","description":"The amount of the bill payment"},"paymentAccountId":{"type":"number","description":"The id of the payment account"},"paymentNumber":{"type":"string","description":"The payment number of the bill payment"},"paymentDate":{"type":"object","description":"The payment date of the bill payment"},"exchangeRate":{"type":"number","description":"The exchange rate of the bill payment"},"statement":{"type":"string","description":"The statement of the bill payment"},"entries":{"description":"The entries of the bill payment","type":"array","items":{"type":"string"}},"branchId":{"type":"number","description":"The id of the branch"},"attachments":{"description":"The attachments of the bill payment","type":"array","items":{"type":"string"}}},"required":["vendorId","amount","paymentAccountId","paymentNumber","paymentDate","exchangeRate","statement","entries","branchId","attachments"],"description":"The JSON request body."}},"required":["Authorization","organization-id","billPaymentId","requestBody"]},
    method: "put",
    pathTemplate: "/api/bill-payments/{billPaymentId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billPaymentId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_deleteBillPayment", {
    name: "BillPaymentsController_deleteBillPayment",
    description: `Delete the given bill payment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billPaymentId":{"type":"number","description":"The bill payment id"}},"required":["Authorization","organization-id","billPaymentId"]},
    method: "delete",
    pathTemplate: "/api/bill-payments/{billPaymentId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billPaymentId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_getBillPaymentNewPageEntries", {
    name: "BillPaymentsController_getBillPaymentNewPageEntries",
    description: `Retrieves the payable entries of the new page once vendor be selected.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorId":{"type":"number","description":"The vendor id"}},"required":["Authorization","organization-id","vendorId"]},
    method: "get",
    pathTemplate: "/api/bill-payments/new-page/entries",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_getPaymentBills", {
    name: "BillPaymentsController_getPaymentBills",
    description: `Retrieves the bills of the given bill payment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billPaymentId":{"type":"number","description":"The bill payment id"}},"required":["Authorization","organization-id","billPaymentId"]},
    method: "get",
    pathTemplate: "/api/bill-payments/{billPaymentId}/bills",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billPaymentId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BillPaymentsController_getBillPaymentEditPage", {
    name: "BillPaymentsController_getBillPaymentEditPage",
    description: `Retrieves the edit page of the given bill payment.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"billPaymentId":{"type":"number","description":"The bill payment id"}},"required":["Authorization","organization-id","billPaymentId"]},
    method: "get",
    pathTemplate: "/api/bill-payments/{billPaymentId}/edit-page",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"billPaymentId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsRefundController_getRefundVendorCreditTransaction", {
    name: "VendorCreditsRefundController_getRefundVendorCreditTransaction",
    description: `Retrieve a refund vendor credit transaction by id.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"refundCreditId":{"type":"string"}},"required":["Authorization","organization-id","refundCreditId"]},
    method: "get",
    pathTemplate: "/api/vendor-credits/refunds/{refundCreditId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"refundCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsRefundController_deleteRefundVendorCredit", {
    name: "VendorCreditsRefundController_deleteRefundVendorCredit",
    description: `Delete a refund for the given vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"refundCreditId":{"type":"string"}},"required":["Authorization","organization-id","refundCreditId"]},
    method: "delete",
    pathTemplate: "/api/vendor-credits/refunds/{refundCreditId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"refundCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsRefundController_getVendorCreditRefunds", {
    name: "VendorCreditsRefundController_getVendorCreditRefunds",
    description: `Retrieve the vendor credit refunds graph.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditId":{"type":"string"}},"required":["Authorization","organization-id","vendorCreditId"]},
    method: "get",
    pathTemplate: "/api/vendor-credits/{vendorCreditId}/refund",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorCreditsRefundController_createRefundVendorCredit", {
    name: "VendorCreditsRefundController_createRefundVendorCredit",
    description: `Create a refund for the given vendor credit.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"vendorCreditId":{"type":"string"},"requestBody":{"type":"object","properties":{"amount":{"type":"number","description":"The amount of the refund"},"exchangeRate":{"type":"number","description":"The exchange rate of the refund"},"depositAccountId":{"type":"number","description":"The id of the deposit account"},"description":{"type":"string","description":"The description of the refund"},"date":{"format":"date-time","type":"string","description":"The date of the refund"},"branchId":{"type":"number","description":"The id of the branch"}},"required":["amount","exchangeRate","depositAccountId","description","date","branchId"],"description":"The JSON request body."}},"required":["Authorization","organization-id","vendorCreditId","requestBody"]},
    method: "post",
    pathTemplate: "/api/vendor-credits/{vendorCreditId}/refund",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"vendorCreditId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_getBankAccounts", {
    name: "BankAccountsController_getBankAccounts",
    description: `Retrieve the bank accounts.`,
    inputSchema: {"type":"object","properties":{"customViewId":{"type":"number","description":"Custom view ID"},"filterRoles":{"type":"array","items":{"type":"string"},"description":"Filter roles array"},"columnSortBy":{"type":"string","description":"Column to sort by"},"sortOrder":{"enum":["DESC","ASC"],"type":"string","description":"Sort order"},"stringifiedFilterRoles":{"type":"string","description":"Stringified filter roles"},"searchKeyword":{"type":"string","description":"Search keyword"},"viewSlug":{"type":"string","description":"View slug"},"page":{"minimum":1,"type":"number","description":"Page number"},"pageSize":{"minimum":1,"type":"number","description":"Page size"},"inactiveMode":{"default":false,"type":"boolean","description":"Include inactive accounts"}}},
    method: "get",
    pathTemplate: "/api/banking/accounts",
    executionParameters: [{"name":"customViewId","in":"query"},{"name":"filterRoles","in":"query"},{"name":"columnSortBy","in":"query"},{"name":"sortOrder","in":"query"},{"name":"stringifiedFilterRoles","in":"query"},{"name":"searchKeyword","in":"query"},{"name":"viewSlug","in":"query"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"},{"name":"inactiveMode","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_getBankAccountSummary", {
    name: "BankAccountsController_getBankAccountSummary",
    description: `Retrieve the bank account summary.`,
    inputSchema: {"type":"object","properties":{"bankAccountId":{"type":"number"}},"required":["bankAccountId"]},
    method: "get",
    pathTemplate: "/api/banking/accounts/{bankAccountId}/summary",
    executionParameters: [{"name":"bankAccountId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_disconnectBankAccount", {
    name: "BankAccountsController_disconnectBankAccount",
    description: `Disconnect the bank connection of the given bank account.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number"}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/banking/accounts/{id}/disconnect",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_refreshBankAccount", {
    name: "BankAccountsController_refreshBankAccount",
    description: `Refresh the bank account transactions.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number"}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/banking/accounts/{id}/refresh",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_pauseBankAccount", {
    name: "BankAccountsController_pauseBankAccount",
    description: `Pause transactions syncing of the given bank account.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number"}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/banking/accounts/{id}/pause",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankAccountsController_resumeBankAccount", {
    name: "BankAccountsController_resumeBankAccount",
    description: `Resume transactions syncing of the given bank account.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number"}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/banking/accounts/{id}/resume",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingPlaidController_getLinkToken", {
    name: "BankingPlaidController_getLinkToken",
    description: `Get Plaid link token`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/banking/plaid/link-token",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingPlaidController_exchangeToken", {
    name: "BankingPlaidController_exchangeToken",
    description: `Exchange Plaid access token`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"publicToken":{"type":"string","description":"The public token"},"institutionId":{"type":"string","description":"The institution ID"}},"required":["publicToken","institutionId"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/plaid/exchange-token",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingPlaidWebhooksController_webhooks", {
    name: "BankingPlaidWebhooksController_webhooks",
    description: `Listen to Plaid webhooks`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"itemId":{"type":"string","description":"The Plaid item ID"},"webhookType":{"type":"string","description":"The Plaid webhook type"},"webhookCode":{"type":"string","description":"The Plaid webhook code"}},"required":["itemId","webhookType","webhookCode"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/plaid/webhooks",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingCategorizeController_categorizeTransaction", {
    name: "BankingCategorizeController_categorizeTransaction",
    description: `Categorize bank transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"date":{"format":"date-time","type":"string","description":"The date of the bank transaction"},"creditAccountId":{"type":"number","description":"ID of the credit account associated with this transaction"},"referenceNo":{"type":"string","description":"Optional external reference number"},"transactionNumber":{"type":"string","description":"Optional transaction number or reference"},"transactionType":{"type":"string","description":"Type of bank transaction (e.g., deposit, withdrawal)"},"exchangeRate":{"type":"number","description":"Exchange rate for currency conversion","default":1},"currencyCode":{"type":"string","description":"Currency code for the transaction"},"description":{"type":"string","description":"Description of the bank transaction"},"branchId":{"type":"number","description":"ID of the branch where the transaction occurred"},"uncategorizedTransactionIds":{"description":"Array of uncategorized transaction IDs to be categorized","type":"array","items":{"type":"number"}}},"required":["date","creditAccountId","transactionType","uncategorizedTransactionIds"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/categorize",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingCategorizeController_uncategorizeTransactionsBulk", {
    name: "BankingCategorizeController_uncategorizeTransactionsBulk",
    description: `Uncategorize bank transactions in bulk.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"uncategorizedTransactionIds":{"type":"array","items":{},"description":"Array of uncategorized transaction IDs to uncategorize"}},"required":["Authorization","organization-id","uncategorizedTransactionIds"]},
    method: "delete",
    pathTemplate: "/api/banking/categorize/bulk",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"uncategorizedTransactionIds","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingCategorizeController_uncategorizeTransaction", {
    name: "BankingCategorizeController_uncategorizeTransaction",
    description: `Uncategorize a bank transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Uncategorized transaction ID to uncategorize"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/banking/categorize/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsController_getBankAccountTransactions", {
    name: "BankingTransactionsController_getBankAccountTransactions",
    description: `Get bank account transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"page":{"type":"number","description":"Page number for pagination"},"pageSize":{"type":"number","description":"Number of items per page"},"accountId":{"type":"number","description":"Bank account ID"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"}},"required":["Authorization","organization-id","accountId"]},
    method: "get",
    pathTemplate: "/api/banking/transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"},{"name":"accountId","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsController_createTransaction", {
    name: "BankingTransactionsController_createTransaction",
    description: `Create a new bank transaction`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"date":{"format":"date-time","type":"string","description":"The date of the bank transaction"},"transactionNumber":{"type":"string","description":"Optional transaction number or reference"},"referenceNo":{"type":"string","description":"Optional external reference number"},"transactionType":{"type":"string","description":"Type of bank transaction (e.g., deposit, withdrawal)"},"description":{"type":"string","description":"Description of the bank transaction"},"amount":{"type":"number","description":"Transaction amount"},"exchangeRate":{"type":"number","description":"Exchange rate for currency conversion","default":1},"currencyCode":{"type":"string","description":"Currency code for the transaction"},"creditAccountId":{"type":"number","description":"ID of the credit account associated with this transaction"},"cashflowAccountId":{"type":"number","description":"ID of the cashflow account associated with this transaction"},"publish":{"type":"boolean","description":"Whether the transaction should be published","default":true},"branchId":{"type":"number","description":"ID of the branch where the transaction occurred"},"plaidTransactionId":{"type":"string","description":"Plaid transaction ID if imported from Plaid"},"plaidAccountId":{"type":"string","description":"Plaid account ID if imported from Plaid"},"uncategorizedTransactionId":{"type":"number","description":"ID of the uncategorized transaction if this is categorizing an existing transaction"}},"required":["date","transactionType","description","amount","exchangeRate","creditAccountId","cashflowAccountId","publish"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/transactions",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsController_getTransaction", {
    name: "BankingTransactionsController_getTransaction",
    description: `Get a specific bank transaction by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Bank transaction ID"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/banking/transactions/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsController_deleteTransaction", {
    name: "BankingTransactionsController_deleteTransaction",
    description: `Delete a bank transaction`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string","description":"Bank transaction ID"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/banking/transactions/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingUncategorized_getAutofillCategorizeTransaction", {
    name: "BankingUncategorized_getAutofillCategorizeTransaction",
    description: `Get autofill values for categorize transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"uncategorizedTransactionIds":{"type":"array","items":{},"description":"Uncategorized transaction IDs to get autofill for"}},"required":["Authorization","organization-id","uncategorizedTransactionIds"]},
    method: "get",
    pathTemplate: "/api/banking/uncategorized/autofill",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"uncategorizedTransactionIds","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingUncategorized_getBankAccountUncategorizedTransactions", {
    name: "BankingUncategorized_getBankAccountUncategorizedTransactions",
    description: `Get uncategorized transactions for a specific bank account`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"accountId":{"type":"number","description":"Bank account ID"},"page":{"type":"number","description":"Page number for pagination"},"pageSize":{"type":"number","description":"Number of items per page"},"minDate":{"format":"date-time","type":"string","description":"Minimum date for filtering transactions"},"maxDate":{"format":"date-time","type":"string","description":"Maximum date for filtering transactions"},"minAmount":{"type":"number","description":"Minimum amount for filtering transactions"},"maxAmount":{"type":"number","description":"Maximum amount for filtering transactions"}},"required":["Authorization","organization-id","accountId"]},
    method: "get",
    pathTemplate: "/api/banking/uncategorized/accounts/{accountId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"accountId","in":"path"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"},{"name":"minDate","in":"query"},{"name":"maxDate","in":"query"},{"name":"minAmount","in":"query"},{"name":"maxAmount","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingUncategorized_getUncategorizedTransaction", {
    name: "BankingUncategorized_getUncategorizedTransaction",
    description: `Get a specific uncategorized transaction by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"uncategorizedTransactionId":{"type":"number","description":"Uncategorized transaction ID"}},"required":["Authorization","organization-id","uncategorizedTransactionId"]},
    method: "get",
    pathTemplate: "/api/banking/uncategorized/{uncategorizedTransactionId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"uncategorizedTransactionId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingPendingTransactionsController_getPendingTransactions", {
    name: "BankingPendingTransactionsController_getPendingTransactions",
    description: `Get pending bank account transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"page":{"type":"number","description":"Page number for pagination"},"pageSize":{"type":"number","description":"Number of items per page"},"accountId":{"type":"number","description":"Filter by bank account ID"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/banking/pending",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"},{"name":"accountId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankRulesController_getBankRules", {
    name: "BankRulesController_getBankRules",
    description: `Retrieves the bank rules.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/banking/rules",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankRulesController_createBankRule", {
    name: "BankRulesController_createBankRule",
    description: `Create a new bank rule.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the bank rule"},"order":{"type":"number","description":"The order of the bank rule"},"applyIfAccountId":{"type":"number","description":"The account ID to apply the rule if"},"applyIfTransactionType":{"type":"string","description":"The transaction type to apply the rule if"},"conditionsType":{"type":"string","description":"The conditions type to apply the rule if"},"conditions":{"description":"The conditions to apply the rule if","type":"array","items":{"type":"string"}},"assignCategory":{"type":"string","description":"The category to assign the rule if"},"assignAccountId":{"type":"number","description":"The account ID to assign the rule if"},"assignPayee":{"type":"string","description":"The payee to assign the rule if"},"assignMemo":{"type":"string","description":"The memo to assign the rule if"}},"required":["name","order","applyIfAccountId","applyIfTransactionType","conditionsType","conditions","assignCategory","assignAccountId","assignPayee","assignMemo"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/rules",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankRulesController_getBankRule", {
    name: "BankRulesController_getBankRule",
    description: `Retrieves the bank rule details.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/banking/rules/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankRulesController_editBankRule", {
    name: "BankRulesController_editBankRule",
    description: `Edit the given bank rule.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"The name of the bank rule"},"order":{"type":"number","description":"The order of the bank rule"},"applyIfAccountId":{"type":"number","description":"The account ID to apply the rule if"},"applyIfTransactionType":{"type":"string","description":"The transaction type to apply the rule if"},"conditionsType":{"type":"string","description":"The conditions type to apply the rule if"},"conditions":{"description":"The conditions to apply the rule if","type":"array","items":{"type":"string"}},"assignCategory":{"type":"string","description":"The category to assign the rule if"},"assignAccountId":{"type":"number","description":"The account ID to assign the rule if"},"assignPayee":{"type":"string","description":"The payee to assign the rule if"},"assignMemo":{"type":"string","description":"The memo to assign the rule if"}},"required":["name","order","applyIfAccountId","applyIfTransactionType","conditionsType","conditions","assignCategory","assignAccountId","assignPayee","assignMemo"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/banking/rules/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankRulesController_deleteBankRule", {
    name: "BankRulesController_deleteBankRule",
    description: `Delete the given bank rule.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/banking/rules/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingRecognizedTransactions_getRecognizedTransaction", {
    name: "BankingRecognizedTransactions_getRecognizedTransaction",
    description: `Get recognized transaction`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"recognizedTransactionId":{"type":"number","description":"The ID of the recognized transaction"}},"required":["Authorization","organization-id","recognizedTransactionId"]},
    method: "get",
    pathTemplate: "/api/banking/recognized/{recognizedTransactionId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"recognizedTransactionId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingRecognizedTransactions_getRecognizedTransactions", {
    name: "BankingRecognizedTransactions_getRecognizedTransactions",
    description: `Get a list of recognized transactions`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"query":{"description":"Query parameters for filtering recognized transactions"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/banking/recognized",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"query","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsExcludeController_excludeBankTransactions", {
    name: "BankingTransactionsExcludeController_excludeBankTransactions",
    description: `Exclude the given bank transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"IDs of uncategorized bank transactions to exclude or unexclude","type":"array","items":{"type":"number"}}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "put",
    pathTemplate: "/api/banking/exclude/bulk",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsExcludeController_unexcludeBankTransactions", {
    name: "BankingTransactionsExcludeController_unexcludeBankTransactions",
    description: `Unexclude the given bank transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"ids":{"description":"IDs of uncategorized bank transactions to exclude or unexclude","type":"array","items":{"type":"number"}}},"required":["ids"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "delete",
    pathTemplate: "/api/banking/exclude/bulk",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsExcludeController_getExcludedBankTransactions", {
    name: "BankingTransactionsExcludeController_getExcludedBankTransactions",
    description: `Retrieves the excluded bank transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"page":{"type":"number","description":"Page number"},"pageSize":{"type":"number","description":"Page size"},"accountId":{"type":"number","description":"Filter by bank account ID"},"minDate":{"type":"string","description":"Minimum date (ISO)"},"maxDate":{"type":"string","description":"Maximum date (ISO)"},"minAmount":{"type":"number","description":"Minimum amount"},"maxAmount":{"type":"number","description":"Maximum amount"}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/banking/exclude",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"page","in":"query"},{"name":"pageSize","in":"query"},{"name":"accountId","in":"query"},{"name":"minDate","in":"query"},{"name":"maxDate","in":"query"},{"name":"minAmount","in":"query"},{"name":"maxAmount","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsExcludeController_excludeBankTransaction", {
    name: "BankingTransactionsExcludeController_excludeBankTransaction",
    description: `Exclude the given bank transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/banking/exclude/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingTransactionsExcludeController_unexcludeBankTransaction", {
    name: "BankingTransactionsExcludeController_unexcludeBankTransaction",
    description: `Unexclude the given bank transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"string"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/banking/exclude/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingMatchingController_getMatchedTransactions", {
    name: "BankingMatchingController_getMatchedTransactions",
    description: `Retrieves the matched transactions.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"uncategorizedTransactionIds":{"type":"array","items":{},"description":"Uncategorized transaction IDs to match"},"fromDate":{"type":"string","description":"Filter from date"},"toDate":{"type":"string","description":"Filter to date"},"minAmount":{"type":"number","description":"Minimum amount"},"maxAmount":{"type":"number","description":"Maximum amount"},"transactionType":{"type":"string","description":"Transaction type filter"}},"required":["Authorization","organization-id","uncategorizedTransactionIds"]},
    method: "get",
    pathTemplate: "/api/banking/matching/matched",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"uncategorizedTransactionIds","in":"query"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"minAmount","in":"query"},{"name":"maxAmount","in":"query"},{"name":"transactionType","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingMatchingController_matchTransaction", {
    name: "BankingMatchingController_matchTransaction",
    description: `Match the given uncategorized transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"uncategorizedTransactions":{"description":"Uncategorized transaction IDs to match","type":"array","items":{"type":"number"}},"matchedTransactions":{"description":"The entries to match","type":"array","items":{"type":"string"}}},"required":["uncategorizedTransactions","matchedTransactions"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/banking/matching/match",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BankingMatchingController_unmatchMatchedTransaction", {
    name: "BankingMatchingController_unmatchMatchedTransaction",
    description: `Unmatch the given uncategorized transaction.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"uncategorizedTransactionId":{"type":"number"}},"required":["Authorization","organization-id","uncategorizedTransactionId"]},
    method: "patch",
    pathTemplate: "/api/banking/matching/unmatch/{uncategorizedTransactionId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"uncategorizedTransactionId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_commandTransactionsLocking", {
    name: "TransactionsLocking_commandTransactionsLocking",
    description: `Lock all transactions for a module or all modules`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{},"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "put",
    pathTemplate: "/api/transactions-locking/lock",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_cancelTransactionLocking", {
    name: "TransactionsLocking_cancelTransactionLocking",
    description: `Cancel all transactions locking for a module or all modules`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{},"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "put",
    pathTemplate: "/api/transactions-locking/cancel-lock",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_unlockTransactionsLockingBetweenPeriod", {
    name: "TransactionsLocking_unlockTransactionsLockingBetweenPeriod",
    description: `Partial unlock all transactions locking for a module or all modules`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "put",
    pathTemplate: "/api/transactions-locking/unlock-partial",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_cancelPartialUnlocking", {
    name: "TransactionsLocking_cancelPartialUnlocking",
    description: `Cancel partial unlocking all transactions locking for a module or all modules`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "put",
    pathTemplate: "/api/transactions-locking/cancel-unlock-partial",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_getTransactionLockingMetaList", {
    name: "TransactionsLocking_getTransactionLockingMetaList",
    description: `Get all transactions locking meta`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/transactions-locking",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsLocking_getTransactionLockingMeta", {
    name: "TransactionsLocking_getTransactionLockingMeta",
    description: `Get transactions locking meta for a module`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"module":{"type":"string"}},"required":["Authorization","organization-id","module"]},
    method: "get",
    pathTemplate: "/api/transactions-locking/{module}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"module","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SettingsController_getSettings", {
    name: "SettingsController_getSettings",
    description: `Retrieves the settings.`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/settings",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SettingsController_saveSettings", {
    name: "SettingsController_saveSettings",
    description: `Save the given settings.`,
    inputSchema: {"type":"object","properties":{}},
    method: "put",
    pathTemplate: "/api/settings",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["BalanceSheetStatementController_balanceSheet", {
    name: "BalanceSheetStatementController_balanceSheet",
    description: `Get balance sheet statement`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"displayColumnsType":{"default":"total","enum":["total","date_periods"],"type":"string","description":"Type of columns to display in the balance sheet"},"displayColumnsBy":{"default":"year","enum":["day","month","year","quarter"],"type":"string","description":"Time period for column display"},"fromDate":{"type":"string","description":"Start date for the balance sheet period"},"toDate":{"type":"string","description":"End date for the balance sheet period"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to include accounts with no transactions"},"noneZero":{"default":false,"type":"boolean","description":"Whether to exclude zero balance accounts"},"basis":{"enum":["cash","accrual"],"type":"string","description":"Accounting basis for the balance sheet"},"accountIds":{"type":"array","items":{"type":"number"},"description":"Array of account IDs to include in the balance sheet"},"percentageOfColumn":{"default":false,"type":"boolean","description":"Whether to show percentage of column total"},"percentageOfRow":{"default":false,"type":"boolean","description":"Whether to show percentage of row total"},"previousPeriod":{"default":false,"type":"boolean","description":"Whether to include previous period data"},"previousPeriodAmountChange":{"default":false,"type":"boolean","description":"Whether to show amount change from previous period"},"previousPeriodPercentageChange":{"default":false,"type":"boolean","description":"Whether to show percentage change from previous period"},"previousYear":{"default":false,"type":"boolean","description":"Whether to include previous year data"},"previousYearAmountChange":{"default":false,"type":"boolean","description":"Whether to show amount change from previous year"},"previousYearPercentageChange":{"default":false,"type":"boolean","description":"Whether to show percentage change from previous year"},"accept":{"type":"string"}},"required":["Authorization","organization-id","displayColumnsType","displayColumnsBy","accountIds","accept"]},
    method: "get",
    pathTemplate: "/api/reports/balance-sheet",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"displayColumnsType","in":"query"},{"name":"displayColumnsBy","in":"query"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"basis","in":"query"},{"name":"accountIds","in":"query"},{"name":"percentageOfColumn","in":"query"},{"name":"percentageOfRow","in":"query"},{"name":"previousPeriod","in":"query"},{"name":"previousPeriodAmountChange","in":"query"},{"name":"previousPeriodPercentageChange","in":"query"},{"name":"previousYear","in":"query"},{"name":"previousYearAmountChange","in":"query"},{"name":"previousYearPercentageChange","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PurchasesByItemReportController_purchasesByItems", {
    name: "PurchasesByItemReportController_purchasesByItems",
    description: `Get purchases by items report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"fromDate":{"type":"string","description":"Start date for the purchases by items report"},"toDate":{"type":"string","description":"End date for the purchases by items report"},"itemsIds":{"type":"array","items":{"type":"number"},"description":"Array of item IDs to filter the purchases report"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude items with no transactions"},"onlyActive":{"default":false,"type":"boolean","description":"Whether to include only active items"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/purchases-by-items",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"itemsIds","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"onlyActive","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CustomerBalanceSummaryController_customerBalanceSummary", {
    name: "CustomerBalanceSummaryController_customerBalanceSummary",
    description: `Get customer balance summary report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"asDate":{"type":"string","description":"The date as of which the balance summary is calculated"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"percentageColumn":{"default":false,"type":"boolean","description":"Whether to show the percentage column in the summary"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude contacts with no transactions"},"noneZero":{"default":false,"type":"boolean","description":"Whether to exclude contacts with zero balance"},"customersIds":{"type":"array","items":{"type":"number"},"description":"Array of customer IDs to filter the summary"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/customer-balance-summary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"asDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"percentageColumn","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"customersIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["VendorBalanceSummaryController_vendorBalanceSummary", {
    name: "VendorBalanceSummaryController_vendorBalanceSummary",
    description: `Get vendor balance summary`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"asDate":{"type":"string","description":"The date as of which the balance summary is calculated"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"percentageColumn":{"default":false,"type":"boolean","description":"Whether to show the percentage column in the summary"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude contacts with no transactions"},"noneZero":{"default":false,"type":"boolean","description":"Whether to exclude contacts with zero balance"},"vendorsIds":{"type":"array","items":{"type":"number"},"description":"Array of vendor IDs to filter the summary"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/vendor-balance-summary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"asDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"percentageColumn","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"vendorsIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SalesByItemsController_salesByitems", {
    name: "SalesByItemsController_salesByitems",
    description: `Retrieves the sales by items report.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"fromDate":{"type":"string","description":"Start date for the sales by items report"},"toDate":{"type":"string","description":"End date for the sales by items report"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude items with no transactions"},"onlyActive":{"default":false,"type":"boolean","description":"Whether to include only active items"},"itemsIds":{"type":"array","items":{"type":"number"},"description":"Array of item IDs to filter the sales report"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/sales-by-items",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"onlyActive","in":"query"},{"name":"itemsIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["GeneralLedgerController_getGeneralLedger", {
    name: "GeneralLedgerController_getGeneralLedger",
    description: `Get general ledger report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"basis":{"type":"string","description":"Accounting basis for the report (e.g., cash, accrual)"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude transactions from the report"},"accountsIds":{"type":"array","items":{"type":"number"},"description":"Array of account IDs to filter the report"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/general-ledger",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"basis","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"accountsIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TrialBalanceSheetController_getTrialBalanceSheet", {
    name: "TrialBalanceSheetController_getTrialBalanceSheet",
    description: `Get trial balance sheet`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"fromDate":{"format":"date-time","type":"string","description":"Start date for the trial balance sheet"},"toDate":{"format":"date-time","type":"string","description":"End date for the trial balance sheet"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"basis":{"enum":["cash","accrual"],"type":"string","description":"Accounting basis for the report"},"noneZero":{"default":false,"type":"boolean","description":"Filter out zero balance accounts"},"noneTransactions":{"default":false,"type":"boolean","description":"Filter out accounts with no transactions"},"onlyActive":{"default":false,"type":"boolean","description":"Show only active accounts"},"accountIds":{"type":"array","items":{"type":"number"},"description":"Filter by specific account IDs"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/trial-balance-sheet",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"basis","in":"query"},{"name":"noneZero","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"onlyActive","in":"query"},{"name":"accountIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsByVendorController_transactionsByVendor", {
    name: "TransactionsByVendorController_transactionsByVendor",
    description: `Get transactions by vendor`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude transactions"},"noneZero":{"default":false,"type":"boolean","description":"Whether to exclude zero values"},"vendorsIds":{"type":"array","items":{"type":"string"},"description":"Array of vendor IDs to include"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/transactions-by-vendors",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"vendorsIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsByCustomerController_transactionsByCustomer", {
    name: "TransactionsByCustomerController_transactionsByCustomer",
    description: `Get transactions by customer`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"default":false,"type":"boolean","description":"Whether to exclude transactions"},"noneZero":{"default":false,"type":"boolean","description":"Whether to exclude zero values"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/transactions-by-customers",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["TransactionsByReferenceController_getTransactionsByReference", {
    name: "TransactionsByReferenceController_getTransactionsByReference",
    description: `Get transactions by reference`,
    inputSchema: {"type":"object","properties":{"referenceType":{"type":"string","description":"The type of the reference (e.g., SaleInvoice, Bill, etc.)"},"referenceId":{"type":"number","description":"The ID of the reference"}},"required":["referenceType","referenceId"]},
    method: "get",
    pathTemplate: "/api/reports/transactions-by-reference",
    executionParameters: [{"name":"referenceType","in":"query"},{"name":"referenceId","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ARAgingSummaryController_get", {
    name: "ARAgingSummaryController_get",
    description: `Get receivable aging summary`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"agingDaysBefore":{"type":"number","description":"Number of days before the aging period starts"},"agingPeriods":{"type":"number","description":"Number of aging periods to calculate"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneZero":{"type":"boolean","description":"Whether to exclude zero values"},"customersIds":{"type":"array","items":{"type":"string"},"description":"Array of customer IDs to include"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/receivable-aging-summary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"agingDaysBefore","in":"query"},{"name":"agingPeriods","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneZero","in":"query"},{"name":"customersIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["APAgingSummaryController_get", {
    name: "APAgingSummaryController_get",
    description: `Get payable aging summary`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"agingDaysBefore":{"type":"number","description":"Number of days before the aging period starts"},"agingPeriods":{"type":"number","description":"Number of aging periods to calculate"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneZero":{"type":"boolean","description":"Whether to exclude zero values"},"vendorsIds":{"type":"array","items":{"type":"string"},"description":"Array of vendor IDs to include"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/payable-aging-summary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"agingDaysBefore","in":"query"},{"name":"agingPeriods","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneZero","in":"query"},{"name":"vendorsIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryItemDetailsController_inventoryItemDetails", {
    name: "InventoryItemDetailsController_inventoryItemDetails",
    description: `Get inventory item details`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"type":"boolean","description":"Whether to exclude transactions"},"itemsIds":{"type":"array","items":{"type":"string"},"description":"Items IDs for the inventory item details"},"warehousesIds":{"type":"array","items":{"type":"string"},"description":"Warehouses IDs for the inventory item details"},"branchesIds":{"type":"array","items":{"type":"string"},"description":"Branches IDs for the inventory item details"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/inventory-item-details",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"itemsIds","in":"query"},{"name":"warehousesIds","in":"query"},{"name":"branchesIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["InventoryValuationController_getInventoryValuationSheet", {
    name: "InventoryValuationController_getInventoryValuationSheet",
    description: `Retrieves the inventory valuation sheet`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"asDate":{"type":"string","description":"The date for which the inventory valuation is requested"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneTransactions":{"type":"boolean","description":"Whether to exclude transactions"},"noneZero":{"type":"boolean","description":"Whether to exclude zero values"},"onlyActive":{"type":"boolean","description":"Whether to include only active items"},"itemsIds":{"type":"array","items":{"type":"number"},"description":"Array of item IDs to filter"},"warehousesIds":{"type":"array","items":{"type":"number"},"description":"Array of warehouse IDs to filter"},"branchesIds":{"type":"array","items":{"type":"number"},"description":"Array of branch IDs to filter"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/inventory-valuation",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"asDate","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"noneZero","in":"query"},{"name":"onlyActive","in":"query"},{"name":"itemsIds","in":"query"},{"name":"warehousesIds","in":"query"},{"name":"branchesIds","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SalesTaxLiabilitySummaryController_getSalesTaxLiabilitySummary", {
    name: "SalesTaxLiabilitySummaryController_getSalesTaxLiabilitySummary",
    description: `Get sales tax liability summary report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"fromDate":{"format":"date-time","type":"string","description":"Start date for the sales tax liability summary"},"toDate":{"format":"date-time","type":"string","description":"End date for the sales tax liability summary"},"basis":{"enum":["cash","accrual"],"type":"string","description":"Accounting basis for the summary"},"accept":{"type":"string"}},"required":["Authorization","organization-id","fromDate","toDate","basis","accept"]},
    method: "get",
    pathTemplate: "/api/reports/sales-tax-liability-summary",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"basis","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["JournalSheetController_journalSheet", {
    name: "JournalSheetController_journalSheet",
    description: `Journal report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"noCents":{"type":"boolean","description":"Whether to hide cents in the number format"},"divideOn1000":{"type":"boolean","description":"Whether to divide numbers by 1000"},"transactionType":{"type":"string","description":"Type of transaction to filter"},"transactionId":{"type":"string","description":"ID of the transaction to filter"},"fromRange":{"type":"number","description":"Start range for filtering"},"toRange":{"type":"number","description":"End range for filtering"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/journal",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"noCents","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"transactionType","in":"query"},{"name":"transactionId","in":"query"},{"name":"fromRange","in":"query"},{"name":"toRange","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ProfitLossSheetController_profitLossSheet", {
    name: "ProfitLossSheetController_profitLossSheet",
    description: `Get profit/loss statement report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"basis":{"type":"string","description":"The basis for the profit and loss sheet"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"noneZero":{"type":"boolean","description":"Whether to exclude zero values"},"noneTransactions":{"type":"boolean","description":"Whether to exclude transactions"},"accountsIds":{"type":"array","items":{"type":"string"},"description":"Array of account IDs to include"},"displayColumnsType":{"enum":["total","date_periods"],"type":"string","description":"Type of columns to display"},"displayColumnsBy":{"type":"string","description":"How to display columns"},"percentageColumn":{"type":"boolean","description":"Whether to show percentage column"},"percentageRow":{"type":"boolean","description":"Whether to show percentage row"},"percentageIncome":{"type":"boolean","description":"Whether to show income percentage"},"percentageExpense":{"type":"boolean","description":"Whether to show expense percentage"},"previousPeriod":{"type":"boolean","description":"Whether to include previous period"},"previousPeriodAmountChange":{"type":"boolean","description":"Whether to show previous period amount change"},"previousPeriodPercentageChange":{"type":"boolean","description":"Whether to show previous period percentage change"},"previousYear":{"type":"boolean","description":"Whether to include previous year"},"previousYearAmountChange":{"type":"boolean","description":"Whether to show previous year amount change"},"previousYearPercentageChange":{"type":"boolean","description":"Whether to show previous year percentage change"},"accept":{"type":"string"}},"required":["Authorization","organization-id","basis","displayColumnsType","displayColumnsBy","accept"]},
    method: "get",
    pathTemplate: "/api/reports/profit-loss-sheet",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"basis","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"noneZero","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"accountsIds","in":"query"},{"name":"displayColumnsType","in":"query"},{"name":"displayColumnsBy","in":"query"},{"name":"percentageColumn","in":"query"},{"name":"percentageRow","in":"query"},{"name":"percentageIncome","in":"query"},{"name":"percentageExpense","in":"query"},{"name":"previousPeriod","in":"query"},{"name":"previousPeriodAmountChange","in":"query"},{"name":"previousPeriodPercentageChange","in":"query"},{"name":"previousYear","in":"query"},{"name":"previousYearAmountChange","in":"query"},{"name":"previousYearPercentageChange","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CashflowController_getCashflow", {
    name: "CashflowController_getCashflow",
    description: `Get cashflow statement report`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"fromDate":{"format":"date-time","type":"string","description":"Start date for the cash flow statement period"},"toDate":{"format":"date-time","type":"string","description":"End date for the cash flow statement period"},"displayColumnsBy":{"default":"year","enum":["day","month","year","quarter"],"type":"string","description":"Display columns by time period"},"displayColumnsType":{"default":"total","enum":["total","date_periods"],"type":"string","description":"Type of column display"},"noneZero":{"default":false,"type":"boolean","description":"Filter out zero values"},"noneTransactions":{"default":false,"type":"boolean","description":"Filter out transactions"},"precision":{"type":"number","description":"Number of decimal places to display"},"divideOn1000":{"type":"boolean","description":"Whether to divide the number by 1000"},"showZero":{"type":"boolean","description":"Whether to show zero values"},"formatMoney":{"enum":["total","always","none"],"type":"string","description":"How to format money values"},"negativeFormat":{"enum":["parentheses","mines"],"type":"string","description":"How to format negative numbers"},"basis":{"type":"string","description":"Basis for the cash flow statement"},"accept":{"type":"string"}},"required":["Authorization","organization-id","accept"]},
    method: "get",
    pathTemplate: "/api/reports/cashflow-statement",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"fromDate","in":"query"},{"name":"toDate","in":"query"},{"name":"displayColumnsBy","in":"query"},{"name":"displayColumnsType","in":"query"},{"name":"noneZero","in":"query"},{"name":"noneTransactions","in":"query"},{"name":"precision","in":"query"},{"name":"divideOn1000","in":"query"},{"name":"showZero","in":"query"},{"name":"formatMoney","in":"query"},{"name":"negativeFormat","in":"query"},{"name":"basis","in":"query"},{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["DashboardController_getBootMeta", {
    name: "DashboardController_getBootMeta",
    description: `Get dashboard boot metadata`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/dashboard/boot",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_getRoles", {
    name: "RolesController_getRoles",
    description: `Get all roles`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/roles",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_createRole", {
    name: "RolesController_createRole",
    description: `Create a new role`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"roleName":{"type":"string","description":"The name of the role"},"roleDescription":{"type":"string","description":"The description of the role"},"permissions":{"description":"The permissions of the role","type":"array","items":{"type":"object","properties":{"subject":{"type":"string","description":"The subject of the permission"},"ability":{"type":"string","description":"The action of the permission"},"value":{"type":"boolean","description":"The value of the permission"}},"required":["subject","ability","value"]}}},"required":["roleName","roleDescription","permissions"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/roles",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_getRole", {
    name: "RolesController_getRole",
    description: `Get a specific role by ID`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Role ID"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/roles/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_editRole", {
    name: "RolesController_editRole",
    description: `Edit an existing role`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Role ID"},"requestBody":{"type":"object","properties":{"roleName":{"type":"string","description":"The name of the role"},"roleDescription":{"type":"string","description":"The description of the role"},"permissions":{"description":"The permissions of the role","type":"array","items":{"type":"object","properties":{"subject":{"type":"string","description":"The subject of the permission"},"ability":{"type":"string","description":"The action of the permission"},"value":{"type":"boolean","description":"The value of the permission"},"permissionId":{"type":"number","description":"The permission ID"}},"required":["subject","ability","value","permissionId"]}}},"required":["roleName","roleDescription","permissions"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/roles/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_deleteRole", {
    name: "RolesController_deleteRole",
    description: `Delete a role`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Role ID"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/roles/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["RolesController_getRolePermissionsSchema", {
    name: "RolesController_getRolePermissionsSchema",
    description: `Get role permissions schema`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/roles/permissions/schema",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsController_getSubscriptions", {
    name: "SubscriptionsController_getSubscriptions",
    description: `Get all subscriptions for the current tenant`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/subscription",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsController_getCheckoutUrl", {
    name: "SubscriptionsController_getCheckoutUrl",
    description: `Get LemonSqueezy checkout URL`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"variantId":{"type":"string","description":"The variant ID for the subscription plan"}},"required":["variantId"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/subscription/lemon/checkout_url",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsController_cancelSubscription", {
    name: "SubscriptionsController_cancelSubscription",
    description: `Cancel the current organization subscription`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/subscription/cancel",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsController_resumeSubscription", {
    name: "SubscriptionsController_resumeSubscription",
    description: `Resume the current organization subscription`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/subscription/resume",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsController_changeSubscriptionPlan", {
    name: "SubscriptionsController_changeSubscriptionPlan",
    description: `Change the subscription plan of the current organization`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"variant_id":{"type":"number","description":"The variant ID for the new subscription plan"}},"required":["variant_id"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "post",
    pathTemplate: "/api/subscription/change",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["SubscriptionsLemonWebhook_lemonWebhooks", {
    name: "SubscriptionsLemonWebhook_lemonWebhooks",
    description: `Executes POST /api/webhooks/lemon`,
    inputSchema: {"type":"object","properties":{}},
    method: "post",
    pathTemplate: "/api/webhooks/lemon",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["OrganizationController_build", {
    name: "OrganizationController_build",
    description: `Build organization database`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Organization name"},"industry":{"type":"string","description":"Industry of the organization"},"location":{"type":"string","description":"Country location in ISO 3166-1 alpha-2 format"},"baseCurrency":{"type":"string","description":"Base currency in ISO 4217 format"},"timezone":{"type":"string","description":"Timezone of the organization"},"fiscalYear":{"type":"string","description":"Starting month of fiscal year"},"language":{"type":"string","description":"Language/locale of the organization"},"dateFormat":{"type":"string","description":"Date format used by the organization"}},"required":["name","location","baseCurrency","timezone","fiscalYear","language"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/organization/build",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["OrganizationController_buildJob", {
    name: "OrganizationController_buildJob",
    description: `Gets the organization build job details`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"buildJobId":{"type":"number","description":"The build job id"}},"required":["Authorization","organization-id","buildJobId"]},
    method: "get",
    pathTemplate: "/api/organization/build/{buildJobId}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"buildJobId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["OrganizationController_currentOrganization", {
    name: "OrganizationController_currentOrganization",
    description: `Get current organization`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/organization/current",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["OrganizationController_baseCurrencyMutate", {
    name: "OrganizationController_baseCurrencyMutate",
    description: `Executes GET /api/organization/base-currency-mutate`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/organization/base-currency-mutate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["OrganizationController_updateOrganization", {
    name: "OrganizationController_updateOrganization",
    description: `Update organization information`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"name":{"type":"string","description":"Organization name"},"industry":{"type":"string","description":"Industry of the organization"},"location":{"type":"string","description":"Country location in ISO 3166-1 alpha-2 format"},"baseCurrency":{"type":"string","description":"Base currency in ISO 4217 format"},"timezone":{"type":"string","description":"Timezone of the organization"},"fiscalYear":{"type":"string","description":"Starting month of fiscal year"},"language":{"type":"string","description":"Language/locale of the organization"},"dateFormat":{"type":"string","description":"Date format used by the organization"},"address":{"type":"object","description":"Organization address details"},"primaryColor":{"type":"string","description":"Primary brand color in hex format"},"logoKey":{"type":"string","description":"Logo file key reference"},"taxNumber":{"type":"string","description":"Organization tax identification number"}},"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "put",
    pathTemplate: "/api/organization",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentServicesController_getPaymentServicesSpecificInvoice", {
    name: "PaymentServicesController_getPaymentServicesSpecificInvoice",
    description: `Executes GET /api/payment-services`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/payment-services",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentServicesController_getPaymentMethodsState", {
    name: "PaymentServicesController_getPaymentMethodsState",
    description: `Executes GET /api/payment-services/state`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/payment-services/state",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentServicesController_getPaymentService", {
    name: "PaymentServicesController_getPaymentService",
    description: `Executes GET /api/payment-services/{paymentServiceId}`,
    inputSchema: {"type":"object","properties":{"paymentServiceId":{"type":"number"}},"required":["paymentServiceId"]},
    method: "get",
    pathTemplate: "/api/payment-services/{paymentServiceId}",
    executionParameters: [{"name":"paymentServiceId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentServicesController_updatePaymentMethod", {
    name: "PaymentServicesController_updatePaymentMethod",
    description: `Executes POST /api/payment-services/{paymentMethodId}`,
    inputSchema: {"type":"object","properties":{"paymentMethodId":{"type":"number"},"requestBody":{"type":"object","properties":{"options":{"description":"Edit payment method options","allOf":[{"type":"object","properties":{}}]},"name":{"type":"string","description":"Payment method name"}},"description":"The JSON request body."}},"required":["paymentMethodId","requestBody"]},
    method: "post",
    pathTemplate: "/api/payment-services/{paymentMethodId}",
    executionParameters: [{"name":"paymentMethodId","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["PaymentServicesController_deletePaymentMethod", {
    name: "PaymentServicesController_deletePaymentMethod",
    description: `Executes DELETE /api/payment-services/{paymentMethodId}`,
    inputSchema: {"type":"object","properties":{"paymentMethodId":{"type":"number"}},"required":["paymentMethodId"]},
    method: "delete",
    pathTemplate: "/api/payment-services/{paymentMethodId}",
    executionParameters: [{"name":"paymentMethodId","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExportController_export", {
    name: "ExportController_export",
    description: `Retrieves exported the given resource.`,
    inputSchema: {"type":"object","properties":{"accept":{"type":"string"}},"required":["accept"]},
    method: "get",
    pathTemplate: "/api/export",
    executionParameters: [{"name":"accept","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ViewsController_getResourceViews", {
    name: "ViewsController_getResourceViews",
    description: `Get the given resource views`,
    inputSchema: {"type":"object","properties":{"resourceModel":{"type":"string","description":"The resource model to get views for"}},"required":["resourceModel"]},
    method: "get",
    pathTemplate: "/api/views/resource/{resourceModel}",
    executionParameters: [{"name":"resourceModel","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CurrenciesController_findAll", {
    name: "CurrenciesController_findAll",
    description: `Get all currencies`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."}},"required":["Authorization","organization-id"]},
    method: "get",
    pathTemplate: "/api/currencies",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CurrenciesController_create", {
    name: "CurrenciesController_create",
    description: `Create a new currency`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"requestBody":{"type":"object","properties":{"currencyName":{"type":"string","description":"The currency name"},"currencyCode":{"type":"string","description":"The currency code"},"currencySign":{"type":"string","description":"The currency sign"}},"required":["currencyName","currencyCode","currencySign"],"description":"The JSON request body."}},"required":["Authorization","organization-id","requestBody"]},
    method: "post",
    pathTemplate: "/api/currencies",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CurrenciesController_edit", {
    name: "CurrenciesController_edit",
    description: `Edit an existing currency`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number","description":"Currency ID"},"requestBody":{"type":"object","properties":{"currencyName":{"type":"string","description":"The currency name"},"currencySign":{"type":"string","description":"The currency sign"}},"required":["currencyName","currencySign"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/currencies/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CurrenciesController_delete", {
    name: "CurrenciesController_delete",
    description: `Delete a currency by code`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"code":{"type":"string","description":"Currency code"}},"required":["Authorization","organization-id","code"]},
    method: "delete",
    pathTemplate: "/api/currencies/{code}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"code","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["CurrenciesController_findOne", {
    name: "CurrenciesController_findOne",
    description: `Get a currency by code`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"currencyCode":{"type":"string","description":"Currency code"}},"required":["Authorization","organization-id","currencyCode"]},
    method: "get",
    pathTemplate: "/api/currencies/{currencyCode}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"currencyCode","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["MiscellaneousController_getDateFormats", {
    name: "MiscellaneousController_getDateFormats",
    description: `Executes GET /api/date-formats`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/date-formats",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_getUser", {
    name: "UsersController_getUser",
    description: `Retrieve user details of the given user id.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "get",
    pathTemplate: "/api/users/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_editUser", {
    name: "UsersController_editUser",
    description: `Edit details of the given user.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"},"requestBody":{"type":"object","properties":{"firstName":{"type":"string","description":"First name of the user"},"lastName":{"type":"string","description":"Last name of the user"},"email":{"type":"string","description":"Email address of the user"},"roleId":{"type":"number","description":"Role ID assigned to the user"}},"required":["firstName","lastName","email","roleId"],"description":"The JSON request body."}},"required":["Authorization","organization-id","id","requestBody"]},
    method: "put",
    pathTemplate: "/api/users/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_deleteUser", {
    name: "UsersController_deleteUser",
    description: `Soft deleting the given user.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "delete",
    pathTemplate: "/api/users/{id}",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_listUsers", {
    name: "UsersController_listUsers",
    description: `Retrieve the list of users.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"page_size":{"type":"number"},"page":{"type":"number"}},"required":["Authorization","organization-id","page_size","page"]},
    method: "get",
    pathTemplate: "/api/users",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"page_size","in":"query"},{"name":"page","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_activateUser", {
    name: "UsersController_activateUser",
    description: `Activate the given user.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/users/{id}/activate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersController_inactivateUser", {
    name: "UsersController_inactivateUser",
    description: `Inactivate the given user.`,
    inputSchema: {"type":"object","properties":{"Authorization":{"type":"string","description":"Value must be 'Bearer <token>' where <token> is an API key prefixed with 'bc_' or a JWT token."},"organization-id":{"type":"string","description":"Required if Authorization is a JWT token. The organization ID to operate within."},"id":{"type":"number"}},"required":["Authorization","organization-id","id"]},
    method: "put",
    pathTemplate: "/api/users/{id}/inactivate",
    executionParameters: [{"name":"Authorization","in":"header"},{"name":"organization-id","in":"header"},{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersInviteController_sendInvite", {
    name: "UsersInviteController_sendInvite",
    description: `Send an invitation to a new user.`,
    inputSchema: {"type":"object","properties":{"requestBody":{"type":"object","properties":{"email":{"type":"string","description":"Email address of the user to invite"},"roleId":{"type":"number","description":"Role ID to assign to the invited user"}},"required":["email","roleId"],"description":"The JSON request body."}},"required":["requestBody"]},
    method: "patch",
    pathTemplate: "/api/invite",
    executionParameters: [],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersInviteController_resendInvite", {
    name: "UsersInviteController_resendInvite",
    description: `Resend an invitation to an existing user.`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number"}},"required":["id"]},
    method: "post",
    pathTemplate: "/api/invite/users/{id}/resend",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersInvitePublicController_acceptInvite", {
    name: "UsersInvitePublicController_acceptInvite",
    description: `Accept a user invitation.`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string"},"requestBody":{"type":"object","properties":{"firstName":{"type":"string","description":"First name of the user to invite"},"lastName":{"type":"string","description":"Last name of the user to invite"},"password":{"type":"string","description":"Password for the invited user"}},"required":["firstName","lastName","password"],"description":"The JSON request body."}},"required":["token","requestBody"]},
    method: "post",
    pathTemplate: "/api/invite/accept/{token}",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: "application/json",
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["UsersInvitePublicController_checkInvite", {
    name: "UsersInvitePublicController_checkInvite",
    description: `Check if an invitation token is valid.`,
    inputSchema: {"type":"object","properties":{"token":{"type":"string"}},"required":["token"]},
    method: "get",
    pathTemplate: "/api/invite/check/{token}",
    executionParameters: [{"name":"token","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ContactsController_getAutoComplete", {
    name: "ContactsController_getAutoComplete",
    description: `Get the auto-complete contacts`,
    inputSchema: {"type":"object","properties":{}},
    method: "get",
    pathTemplate: "/api/contacts/auto-complete",
    executionParameters: [],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ContactsController_getContact", {
    name: "ContactsController_getContact",
    description: `Get contact by ID (customer or vendor)`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number","description":"Contact ID"}},"required":["id"]},
    method: "get",
    pathTemplate: "/api/contacts/{id}",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ContactsController_activateContact", {
    name: "ContactsController_activateContact",
    description: `Activate a contact`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number","description":"Contact ID"}},"required":["id"]},
    method: "patch",
    pathTemplate: "/api/contacts/{id}/activate",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ContactsController_inactivateContact", {
    name: "ContactsController_inactivateContact",
    description: `Inactivate a contact`,
    inputSchema: {"type":"object","properties":{"id":{"type":"number","description":"Contact ID"}},"required":["id"]},
    method: "patch",
    pathTemplate: "/api/contacts/{id}/inactivate",
    executionParameters: [{"name":"id","in":"path"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
  ["ExchangeRatesController_getLatestExchangeRate", {
    name: "ExchangeRatesController_getLatestExchangeRate",
    description: `Get the latest exchange rate`,
    inputSchema: {"type":"object","properties":{"from_currency":{"type":"string","description":"Source currency code (ISO 4217)"},"to_currency":{"type":"string","description":"Target currency code (ISO 4217)"}}},
    method: "get",
    pathTemplate: "/api/exchange-rates/latest",
    executionParameters: [{"name":"from_currency","in":"query"},{"name":"to_currency","in":"query"}],
    requestBodyContentType: undefined,
    securityRequirements: [{"bearerAuth":[]}]
  }],
]);

const INJECTED_HEADERS = new Set(["Authorization", "organization-id"]);
for (const def of toolDefinitionMap.values()) {
  def.executionParameters = def.executionParameters.filter(p => !(p.in === "header" && INJECTED_HEADERS.has(p.name)));
  const schema: any = def.inputSchema;
  if (schema && schema.properties) {
    for (const name of INJECTED_HEADERS) delete schema.properties[name];
  }
  if (schema && Array.isArray(schema.required)) {
    schema.required = schema.required.filter((n: string) => !INJECTED_HEADERS.has(n));
  }
}

/**
 * Security schemes from the OpenAPI spec
 */
const securitySchemes =   {
    "bearerAuth": {
      "type": "http",
      "scheme": "bearer",
      "bearerFormat": "JWT"
    }
  };


server.setRequestHandler(ListToolsRequestSchema, async () => {
  const toolsForClient: Tool[] = Array.from(toolDefinitionMap.values()).map(def => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema
  }));
  return { tools: toolsForClient };
});


server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest): Promise<CallToolResult> => {
  const { name: toolName, arguments: toolArgs } = request.params;
  const toolDefinition = toolDefinitionMap.get(toolName);
  if (!toolDefinition) {
    console.error(`Error: Unknown tool requested: ${toolName}`);
    return { content: [{ type: "text", text: `Error: Unknown tool requested: ${toolName}` }] };
  }
  return await executeApiTool(toolName, toolDefinition, toolArgs ?? {}, securitySchemes);
});



/**
 * Type definition for cached OAuth tokens
 */
interface TokenCacheEntry {
    token: string;
    expiresAt: number;
}

/**
 * Declare global __oauthTokenCache property for TypeScript
 */
declare global {
    var __oauthTokenCache: Record<string, TokenCacheEntry> | undefined;
}

/**
 * Acquires an OAuth2 token using client credentials flow
 * 
 * @param schemeName Name of the security scheme
 * @param scheme OAuth2 security scheme
 * @returns Acquired token or null if unable to acquire
 */
async function acquireOAuth2Token(schemeName: string, scheme: any): Promise<string | null | undefined> {
    try {
        // Check if we have the necessary credentials
        const clientId = process.env[`OAUTH_CLIENT_ID_SCHEMENAME`];
        const clientSecret = process.env[`OAUTH_CLIENT_SECRET_SCHEMENAME`];
        const scopes = process.env[`OAUTH_SCOPES_SCHEMENAME`];
        
        if (!clientId || !clientSecret) {
            console.error(`Missing client credentials for OAuth2 scheme '${schemeName}'`);
            return null;
        }
        
        // Initialize token cache if needed
        if (typeof global.__oauthTokenCache === 'undefined') {
            global.__oauthTokenCache = {};
        }
        
        // Check if we have a cached token
        const cacheKey = `${schemeName}_${clientId}`;
        const cachedToken = global.__oauthTokenCache[cacheKey];
        const now = Date.now();
        
        if (cachedToken && cachedToken.expiresAt > now) {
            console.error(`Using cached OAuth2 token for '${schemeName}' (expires in ${Math.floor((cachedToken.expiresAt - now) / 1000)} seconds)`);
            return cachedToken.token;
        }
        
        // Determine token URL based on flow type
        let tokenUrl = '';
        if (scheme.flows?.clientCredentials?.tokenUrl) {
            tokenUrl = scheme.flows.clientCredentials.tokenUrl;
            console.error(`Using client credentials flow for '${schemeName}'`);
        } else if (scheme.flows?.password?.tokenUrl) {
            tokenUrl = scheme.flows.password.tokenUrl;
            console.error(`Using password flow for '${schemeName}'`);
        } else {
            console.error(`No supported OAuth2 flow found for '${schemeName}'`);
            return null;
        }
        
        // Prepare the token request
        let formData = new URLSearchParams();
        formData.append('grant_type', 'client_credentials');
        
        // Add scopes if specified
        if (scopes) {
            formData.append('scope', scopes);
        }
        
        console.error(`Requesting OAuth2 token from ${tokenUrl}`);
        
        // Make the token request
        const response = await axios({
            method: 'POST',
            url: tokenUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
            },
            data: formData.toString()
        });
        
        // Process the response
        if (response.data?.access_token) {
            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 3600; // Default to 1 hour
            
            // Cache the token
            global.__oauthTokenCache[cacheKey] = {
                token,
                expiresAt: now + (expiresIn * 1000) - 60000 // Expire 1 minute early
            };
            
            console.error(`Successfully acquired OAuth2 token for '${schemeName}' (expires in ${expiresIn} seconds)`);
            return token;
        } else {
            console.error(`Failed to acquire OAuth2 token for '${schemeName}': No access_token in response`);
            return null;
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error acquiring OAuth2 token for '${schemeName}':`, errorMessage);
        return null;
    }
}


/**
 * Executes an API tool with the provided arguments
 * 
 * @param toolName Name of the tool to execute
 * @param definition Tool definition
 * @param toolArgs Arguments provided by the user
 * @param allSecuritySchemes Security schemes from the OpenAPI spec
 * @returns Call tool result
 */
async function executeApiTool(
    toolName: string,
    definition: McpToolDefinition,
    toolArgs: JsonObject,
    allSecuritySchemes: Record<string, any>
): Promise<CallToolResult> {
  try {
    // Validate arguments against the input schema
    let validatedArgs: JsonObject;
    try {
        const zodSchema = getZodSchemaFromJsonSchema(definition.inputSchema, toolName);
        const argsToParse = (typeof toolArgs === 'object' && toolArgs !== null) ? toolArgs : {};
        validatedArgs = zodSchema.parse(argsToParse);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const validationErrorMessage = `Invalid arguments for tool '${toolName}': ${error.errors.map(e => `${e.path.join('.')} (${e.code}): ${e.message}`).join(', ')}`;
            return { content: [{ type: 'text', text: validationErrorMessage }] };
        } else {
             const errorMessage = error instanceof Error ? error.message : String(error);
             return { content: [{ type: 'text', text: `Internal error during validation setup: ${errorMessage}` }] };
        }
    }

    // Prepare URL, query parameters, headers, and request body
    let urlPath = definition.pathTemplate;
    const queryParams: Record<string, any> = {};
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    let requestBodyData: any = undefined;

    // Apply parameters to the URL path, query, or headers
    definition.executionParameters.forEach((param) => {
        const value = validatedArgs[param.name];
        if (typeof value !== 'undefined' && value !== null) {
            if (param.in === 'path') {
                urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(value)));
            }
            else if (param.in === 'query') {
                queryParams[param.name] = value;
            }
            else if (param.in === 'header') {
                headers[param.name.toLowerCase()] = String(value);
            }
        }
    });

    // Ensure all path parameters are resolved
    if (urlPath.includes('{')) {
        throw new Error(`Failed to resolve path parameters: ${urlPath}`);
    }
    
    // Construct the full URL
    const requestUrl = API_BASE_URL ? `${API_BASE_URL}${urlPath}` : urlPath;

    // Handle request body if needed
    if (definition.requestBodyContentType && typeof validatedArgs['requestBody'] !== 'undefined') {
        requestBodyData = validatedArgs['requestBody'];
        headers['content-type'] = definition.requestBodyContentType;
    }


    // Apply security requirements if available
    // Security requirements use OR between array items and AND within each object
    const appliedSecurity = definition.securityRequirements?.find(req => {
        // Try each security requirement (combined with OR)
        return Object.entries(req).every(([schemeName, scopesArray]) => {
            const scheme = allSecuritySchemes[schemeName];
            if (!scheme) return false;
            
            // API Key security (header, query, cookie)
            if (scheme.type === 'apiKey') {
                return !!process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            // HTTP security (basic, bearer)
            if (scheme.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    return !!process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    return !!process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] && 
                           !!process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                }
            }
            
            // OAuth2 security
            if (scheme.type === 'oauth2') {
                // Check for pre-existing token
                if (process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    return true;
                }
                
                // Check for client credentials for auto-acquisition
                if (process.env[`OAUTH_CLIENT_ID_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`] &&
                    process.env[`OAUTH_CLIENT_SECRET_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`]) {
                    // Verify we have a supported flow
                    if (scheme.flows?.clientCredentials || scheme.flows?.password) {
                        return true;
                    }
                }
                
                return false;
            }
            
            // OpenID Connect
            if (scheme.type === 'openIdConnect') {
                return !!process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
            }
            
            return false;
        });
    });

    // If we found matching security scheme(s), apply them
    if (appliedSecurity) {
        // Apply each security scheme from this requirement (combined with AND)
        for (const [schemeName, scopesArray] of Object.entries(appliedSecurity)) {
            const scheme = allSecuritySchemes[schemeName];
            
            // API Key security
            if (scheme?.type === 'apiKey') {
                const apiKey = process.env[`API_KEY_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (apiKey) {
                    if (scheme.in === 'header') {
                        headers[scheme.name.toLowerCase()] = apiKey;
                        console.error(`Applied API key '${schemeName}' in header '${scheme.name}'`);
                    }
                    else if (scheme.in === 'query') {
                        queryParams[scheme.name] = apiKey;
                        console.error(`Applied API key '${schemeName}' in query parameter '${scheme.name}'`);
                    }
                    else if (scheme.in === 'cookie') {
                        // Add the cookie, preserving other cookies if they exist
                        headers['cookie'] = `${scheme.name}=${apiKey}${headers['cookie'] ? `; ${headers['cookie']}` : ''}`;
                        console.error(`Applied API key '${schemeName}' in cookie '${scheme.name}'`);
                    }
                }
            } 
            // HTTP security (Bearer or Basic)
            else if (scheme?.type === 'http') {
                if (scheme.scheme?.toLowerCase() === 'bearer') {
                    const token = process.env[`BEARER_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (token) {
                        headers['authorization'] = `Bearer ${token}`;
                        console.error(`Applied Bearer token for '${schemeName}'`);
                    }
                } 
                else if (scheme.scheme?.toLowerCase() === 'basic') {
                    const username = process.env[`BASIC_USERNAME_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    const password = process.env[`BASIC_PASSWORD_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                    if (username && password) {
                        headers['authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
                        console.error(`Applied Basic authentication for '${schemeName}'`);
                    }
                }
            }
            // OAuth2 security
            else if (scheme?.type === 'oauth2') {
                // First try to use a pre-provided token
                let token = process.env[`OAUTH_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                
                // If no token but we have client credentials, try to acquire a token
                if (!token && (scheme.flows?.clientCredentials || scheme.flows?.password)) {
                    console.error(`Attempting to acquire OAuth token for '${schemeName}'`);
                    token = (await acquireOAuth2Token(schemeName, scheme)) ?? '';
                }
                
                // Apply token if available
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OAuth2 token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
            // OpenID Connect
            else if (scheme?.type === 'openIdConnect') {
                const token = process.env[`OPENID_TOKEN_${schemeName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`];
                if (token) {
                    headers['authorization'] = `Bearer ${token}`;
                    console.error(`Applied OpenID Connect token for '${schemeName}'`);
                    
                    // List the scopes that were requested, if any
                    const scopes = scopesArray as string[];
                    if (scopes && scopes.length > 0) {
                        console.error(`Requested scopes: ${scopes.join(', ')}`);
                    }
                }
            }
        }
    } 
    // Log warning if security is required but not available
    else if (definition.securityRequirements?.length > 0) {
        // First generate a more readable representation of the security requirements
        const securityRequirementsString = definition.securityRequirements
            .map(req => {
                const parts = Object.entries(req)
                    .map(([name, scopesArray]) => {
                        const scopes = scopesArray as string[];
                        if (scopes.length === 0) return name;
                        return `${name} (scopes: ${scopes.join(', ')})`;
                    })
                    .join(' AND ');
                return `[${parts}]`;
            })
            .join(' OR ');
            
        // Suppressed: our Bigcapital auth is applied below, not via the generated env-var scheme.
    }

    // Bigcapital auth: applied last so it wins over any generated security-scheme injection.
    Object.assign(headers, await getAuthHeaders());

    // Prepare the axios request configuration
    const config: AxiosRequestConfig = {
      method: definition.method.toUpperCase(), 
      url: requestUrl, 
      params: queryParams, 
      headers: headers,
      ...(requestBodyData !== undefined && { data: requestBodyData }),
    };

    // Log request info to stderr (doesn't affect MCP output)
    console.error(`Executing tool "${toolName}": ${config.method} ${config.url}`);

    // Execute the request, retrying once after a forced JWT refresh on 401.
    let response;
    try {
      response = await axios(config);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.error(`Got 401 for "${toolName}"; refreshing JWT and retrying once.`);
        await forceRefresh();
        Object.assign(config.headers as Record<string, string>, await getAuthHeaders());
        response = await axios(config);
      } else {
        throw err;
      }
    }

    // Process and format the response
    let responseText = '';
    const contentType = String(response.headers['content-type'] ?? '').toLowerCase();
    
    // Handle JSON responses
    if (contentType.includes('application/json') && typeof response.data === 'object' && response.data !== null) {
         try { 
             responseText = JSON.stringify(response.data, null, 2); 
         } catch (e) { 
             responseText = "[Stringify Error]"; 
         }
    } 
    // Handle string responses
    else if (typeof response.data === 'string') { 
         responseText = response.data; 
    }
    // Handle other response types
    else if (response.data !== undefined && response.data !== null) { 
         responseText = String(response.data); 
    }
    // Handle empty responses
    else { 
         responseText = `(Status: ${response.status} - No body content)`; 
    }
    
    // Return formatted response
    return { 
        content: [ 
            { 
                type: "text", 
                text: `API Response (Status: ${response.status}):\n${responseText}` 
            } 
        ], 
    };

  } catch (error: unknown) {
    // Handle errors during execution
    let errorMessage: string;
    
    // Format Axios errors specially
    if (axios.isAxiosError(error)) { 
        errorMessage = formatApiError(error); 
    }
    // Handle standard errors
    else if (error instanceof Error) { 
        errorMessage = error.message; 
    }
    // Handle unexpected error types
    else { 
        errorMessage = 'Unexpected error: ' + String(error); 
    }
    
    // Log error to stderr
    console.error(`Error during execution of tool '${toolName}':`, errorMessage);
    
    // Return error message to client
    return { content: [{ type: "text", text: errorMessage }] };
  }
}


/**
 * Main function to start the server
 */
async function main() {
// Set up stdio transport
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`${SERVER_NAME} MCP Server (v${SERVER_VERSION}) running on stdio${API_BASE_URL ? `, proxying API at ${API_BASE_URL}` : ''}`);
  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

/**
 * Cleanup function for graceful shutdown
 */
async function cleanup() {
    console.error("Shutting down MCP server...");
    process.exit(0);
}

// Register signal handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start the server
main().catch((error) => {
  console.error("Fatal error in main execution:", error);
  process.exit(1);
});

/**
 * Formats API errors for better readability
 * 
 * @param error Axios error
 * @returns Formatted error message
 */
function formatApiError(error: AxiosError): string {
    let message = 'API request failed.';
    if (error.response) {
        message = `API Error: Status ${error.response.status} (${error.response.statusText || 'Status text not available'}). `;
        const responseData = error.response.data;
        const MAX_LEN = 200;
        if (typeof responseData === 'string') { 
            message += `Response: ${responseData.substring(0, MAX_LEN)}${responseData.length > MAX_LEN ? '...' : ''}`; 
        }
        else if (responseData) { 
            try { 
                const jsonString = JSON.stringify(responseData); 
                message += `Response: ${jsonString.substring(0, MAX_LEN)}${jsonString.length > MAX_LEN ? '...' : ''}`; 
            } catch { 
                message += 'Response: [Could not serialize data]'; 
            } 
        }
        else { 
            message += 'No response body received.'; 
        }
    } else if (error.request) {
        message = 'API Network Error: No response received from server.';
        if (error.code) message += ` (Code: ${error.code})`;
    } else { 
        message += `API Request Setup Error: ${error.message}`; 
    }
    return message;
}

/**
 * Converts a JSON Schema to a Zod schema for runtime validation
 * 
 * @param jsonSchema JSON Schema
 * @param toolName Tool name for error reporting
 * @returns Zod schema
 */
function getZodSchemaFromJsonSchema(jsonSchema: any, toolName: string): z.ZodTypeAny {
    if (typeof jsonSchema !== 'object' || jsonSchema === null) { 
        return z.object({}).passthrough(); 
    }
    try {
        const zodSchemaString = jsonSchemaToZod(jsonSchema);
        const zodSchema = eval(zodSchemaString);
        if (typeof zodSchema?.parse !== 'function') { 
            throw new Error('Eval did not produce a valid Zod schema.'); 
        }
        return zodSchema as z.ZodTypeAny;
    } catch (err: any) {
        console.error(`Failed to generate/evaluate Zod schema for '${toolName}':`, err);
        return z.object({}).passthrough();
    }
}
