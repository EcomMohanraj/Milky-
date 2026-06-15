"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogController = void 0;
const prisma_1 = require("../lib/prisma");
function serializeBlog(b) {
    return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        content: b.content,
        image: b.image,
        created_at: b.createdAt.toISOString()
    };
}
exports.blogController = {
    async list(req, res) {
        try {
            const blogs = await prisma_1.prisma.blogPost.findMany({
                orderBy: { createdAt: "desc" }
            });
            return res.json(blogs.map(serializeBlog));
        }
        catch (err) {
            console.error("List blogs error:", err);
            return res.status(500).json({ success: false, error: "Failed to list blogs." });
        }
    },
    async getBySlug(req, res) {
        try {
            const { slug } = req.params;
            const blog = await prisma_1.prisma.blogPost.findUnique({
                where: { slug }
            });
            if (!blog) {
                return res.status(404).json({ success: false, error: "Article not found." });
            }
            return res.json(serializeBlog(blog));
        }
        catch (err) {
            console.error("Get blog error:", err);
            return res.status(500).json({ success: false, error: "Failed to get article." });
        }
    },
    async create(req, res) {
        try {
            const { title, slug, content, image } = req.body;
            if (!title || !slug || !content || !image) {
                return res.status(400).json({ success: false, error: "All required fields must be provided." });
            }
            const existing = await prisma_1.prisma.blogPost.findUnique({ where: { slug } });
            if (existing) {
                return res.status(400).json({ success: false, error: "Slug must be unique." });
            }
            const blog = await prisma_1.prisma.blogPost.create({
                data: { title, slug, content, image }
            });
            return res.status(201).json(serializeBlog(blog));
        }
        catch (err) {
            console.error("Create blog error:", err);
            return res.status(500).json({ success: false, error: "Failed to create article." });
        }
    },
    async delete(req, res) {
        try {
            const { id } = req.params;
            // Note: check by ID or Slug polymorphic lookup
            const blog = await prisma_1.prisma.blogPost.findFirst({
                where: {
                    OR: [
                        { id },
                        { slug: id }
                    ]
                }
            });
            if (!blog) {
                return res.status(404).json({ success: false, error: "Article not found." });
            }
            await prisma_1.prisma.blogPost.delete({
                where: { id: blog.id }
            });
            return res.json({ success: true });
        }
        catch (err) {
            console.error("Delete blog error:", err);
            return res.status(500).json({ success: false, error: "Failed to delete article." });
        }
    }
};
