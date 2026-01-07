import { route } from "@fal-ai/serverless-client/nextjs";

// 这个文件负责处理前端发来的请求，并转发给 fal.ai
// 它会自动读取 .env.local 里的 FAL_KEY
export const { GET, POST } = route;