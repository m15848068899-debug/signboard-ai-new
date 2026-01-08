"use client";

import { useState } from "react";
import { fal } from "@fal-ai/client";

fal.config({
  proxyUrl: "/api/generate",
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shopName: "BEI JI BIAO",
    type: "technology_company",
    style: "minimalist",
    color: "white_wood",
    width: "4.5",
    height: "1.2",
  });

  // 修复点：Flux 模型只支持标准 enum，不支持自定义的 landscape_21_9
  // 我们这里把超长图统一映射为 landscape_16_9，虽然比例没那么长，但能保证生成成功
  const getAspectRatio = (w: string, h: string) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    const ratio = width / height;

    if (ratio > 1.2) return "landscape_16_9"; // 横版统统用 16:9
    if (ratio < 0.8) return "portrait_16_9";  // 竖版统统用 16:9
    return "square_hd";                       // 其他都用正方形
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImage(null);

    try {
      const sizeRatio = getAspectRatio(formData.width, formData.height);
      
      const prompt = `A realistic street view of a ${formData.type} storefront signboard. 
      The signboard says "${formData.shopName}" in clear, professional 3D typography.
      The storefront dimensions are roughly ${formData.width}m wide by ${formData.height}m high.
      Design style: ${formData.style}. 
      Color scheme: ${formData.color}. 
      Context: Mounted on a modern building facade, outdoors, sunny day.
      Quality: 8k resolution, architectural photography, photorealistic, cinematic lighting, sharp focus.`;

      // 使用 Flux Schnell 模型
      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: sizeRatio, // 这里现在只传标准值了
          num_inference_steps: 4,
          enable_safety_checker: false,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log(update.logs);
          }
        },
      });

      if (result.data && result.data.images && result.data.images.length > 0) {
        setImage(result.data.images[0].url);
      } else if (result.images && result.images.length > 0) {
        setImage(result.images[0].url);
      }
    } catch (error) {
      alert("生成失败，参数校验未通过，请重试");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">北极标广告</h1>
      <p className="text-lg text-slate-500 mb-8 font-light">AI 门头设计生成系统</p>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧表单 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">店铺名称 (建议英文/拼音)</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900"
                placeholder="例如: HUAWEI"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">场所类型</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="technology_company">科技公司</option>
                <option value="corporate_office">公司企业</option>
                <option value="coffee_shop">咖啡店</option>
                <option value="restaurant">餐饮</option>
                <option value="clothing_store">服装店</option>
                <option value="flower_shop">花店</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">长度 (米)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-slate-200 rounded-lg text-slate-900"
                  value={formData.width}
                  onChange={(e) => setFormData({...formData, width: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">高度 (米)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-slate-200 rounded-lg text-slate-900"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">设计风格</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
              >
                <option value="minimalist_modern">现代简约</option>
                <option value="cyberpunk_neon">赛博朋克</option>
                <option value="industrial_loft">工业风</option>
                <option value="luxury_classic">欧式轻奢</option>
                <option value="chinese_retro">新中式</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">色系搭配</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              >
                <option value="blue_silver_glass">科技蓝+银色</option>
                <option value="black_gold_metal">黑金+金属</option>
                <option value="white_wood">原木+白</option>
                <option value="red_gold">红+金</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${
                loading ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "设计生成中..." : "生成效果图"}
            </button>
          </form>
        </div>

        {/* 右侧展示 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 min-h-[500px] flex items-center justify-center relative">
          {image ? (
            <div className="flex flex-col items-center w-full">
              <img src={image} alt="Result" className="w-full rounded-lg shadow-2xl mb-4" />
              <a href={image} download className="px-6 py-2 bg-green-600 text-white rounded font-bold">下载原图</a>
            </div>
          ) : (
             <div className="text-slate-400 text-center">
               {loading ? "正在绘制..." : "等待生成"}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}