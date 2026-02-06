import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyAuth } from "./auth";

export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        
        const identity = await verifyAuth(ctx);

        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            ownerId: identity.subject,
            updatedAt: Date.now(),
        });

        return projectId;
    }
})

export const getPartial = query({
    args: {
        limit: v.number(),
    },
    handler: async (ctx, args) => {

        const identity = await verifyAuth(ctx);

        return await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
            .order("desc")
            .take(args.limit);
    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {

        const identity = await verifyAuth(ctx);

        return await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
            .order("desc")
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