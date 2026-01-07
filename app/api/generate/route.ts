import { route } from "@fal-ai/server-proxy/nextjs";

// 新版代理插件：专门配合 Next.js App Router 使用
// 它会自动读取 .env.local 里的 FAL_KEY，非常智能
export const { GET, POST } = route;