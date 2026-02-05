import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        
        const identity = await ctx.auth.getUserIdentity();
        
        if (!identity) {
            throw new Error("Not authenticated");
        }

        await ctx.db.insert("projects", {
            name: args.name,
            ownerId: identity.subject,
        });
    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {

        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return [];
        }

        return await ctx.db
        .query("projects")
        .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
        .collect();
    }
})

//TODO : I add this not in the video remove this remove function
export const remove = mutation({
    args: {
        projectId: v.id("projects"),
    },
    handler: async (ctx, args) => {

        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        await ctx.db.delete(args.projectId);
    }
})