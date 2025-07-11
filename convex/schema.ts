import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("student")),
    
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
  })
  .index("by_clerk_id", ["clerkId"]),
   // Add index for querying by role
  
  
});