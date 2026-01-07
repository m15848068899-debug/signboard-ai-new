"use client";

import { useState } from "react";
import * as fal from "@fal-ai/serverless-client";

// 配置 Fal.ai
fal.config({
  proxyUrl: "/api/generate",
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  // 表单数据：现在包含具体的长宽尺寸
  const [formData, setFormData] = useState({
    shopName: "BEI JI BIAO",
    type: "technology_company", // 默认改成科技公司演示
    style: "minimalist",
    color: "white_wood",
    width: "4.5", // 默认长度
    height: "1.2", // 默认高度
  });

  // 辅助函数：根据用户输入的尺寸，自动计算最适合 AI 的图片比例
  const getAspectRatio = (w: string, h: string) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    const ratio = width / height;

    // Flux 模型通常支持以下标准比例
    if (ratio >= 2.2) return "landscape_21_9"; // 超长
    if (ratio >= 1.6) return "landscape_16_9"; // 标准宽屏
    if (ratio >= 1.2) return "landscape_4_3";  // 略宽
    if (ratio >= 0.9) return "square_hd";      // 正方形
    return "portrait_4_3";                     // 竖版
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImage(null);

    try {
      // 1. 计算最佳比例字符串
      const sizeRatio = getAspectRatio(formData.width, formData.height);
      
      // 2. 构建 Prompt
      // 如果选了科技或商务，提示词会自动调整得更专业
      const prompt = `A realistic street view of a ${formData.type} storefront signboard. 
      The signboard says "${formData.shopName}" in clear, professional 3D typography.
      The storefront dimensions are roughly ${formData.width}m wide by ${formData.height}m high.
      Design style: ${formData.style}. 
      Color scheme: ${formData.color}. 
      Context: Mounted on a modern building facade, outdoors, sunny day.
      Quality: 8k resolution, architectural photography, photorealistic, cinematic lighting, sharp focus.`;

      // 3. 调用 AI
      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: sizeRatio, // 动态使用计算出的比例
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

      if (result.images && result.images.length > 0) {
        setImage(result.images[0].url);
      }
    } catch (error) {
      alert("生成失败，请检查网络或 Key 余额");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* 标题修改 */}
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">北极标广告</h1>
      <p className="text-lg text-slate-500 mb-8 font-light">AI 门头设计生成系统</p>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：输入表单 */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 店铺名称 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">店铺/公司名称 (建议拼音/英文)</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-slate-900"
                placeholder="例如: HUAWEI / ALIBABA"
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
              />
            </div>

            {/* 店铺类型：增加了商务类选项 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">场所类型</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <optgroup label="商业办公">
                  <option value="corporate_office">公司企业 (Corporate Office)</option>
                  <option value="technology_company">科技公司 (Tech Company)</option>
                  <option value="business_center">商务中心 (Business Center)</option>
                  <option value="creative_studio">创意工作室 (Creative Studio)</option>
                </optgroup>
                <optgroup label="实体店铺">
                  <option value="coffee_shop">咖啡店 (Coffee Shop)</option>
                  <option value="restaurant">餐饮饭店 (Restaurant)</option>
                  <option value="clothing_store">服装店 (Clothing Store)</option>
                  <option value="barber_shop">美发沙龙 (Hair Salon)</option>
                  <option value="flower_shop">花店 (Flower Shop)</option>
                  <option value="bakery">烘焙店 (Bakery)</option>
                  <option value="convenience_store">便利店 (Convenience Store)</option>
                </optgroup>
              </select>
            </div>

            {/* 尺寸输入：改为具体的长宽 */}
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
            <p className="text-xs text-slate-400">系统将根据长宽自动调整图片比例</p>

            {/* 风格 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">设计风格</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
              >
                <option value="minimalist_modern">现代简约 (Modern)</option>
                <option value="futuristic_tech">未来科技感 (Futuristic Tech)</option>
                <option value="professional_business">高端商务 (Professional)</option>
                <option value="cyberpunk_neon">赛博朋克 (Cyberpunk)</option>
                <option value="industrial_loft">工业风 (Industrial)</option>
                <option value="luxury_classic">欧式轻奢 (Luxury)</option>
                <option value="chinese_retro">新中式 (Chinese Retro)</option>
              </select>
            </div>

            {/* 颜色 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">色系搭配</label>
              <select
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 bg-white"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              >
                <option value="blue_silver_glass">科技蓝 + 银色 + 玻璃</option>
                <option value="black_gold_metal">黑金 + 金属质感</option>
                <option value="white_grey_concrete">纯白 + 灰色 + 水泥</option>
                <option value="wood_warm_light">原木 + 暖光</option>
                <option value="red_gold">中国红 + 金色</option>
                <option value="green_nature">生态绿 + 白色</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all transform hover:scale-[1.02] ${
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "AI 正在设计中..." : "生成门头效果图"}
            </button>
          </form>
        </div>

        {/* 右侧：结果展示 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 min-h-[500px] overflow-hidden relative">
            {image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                 {/* 图片展示 */}
                <img 
                  src={image} 
                  alt="AI Generated Signboard" 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
                />
              </div>
            ) : (
              <div className="text-center text-slate-400">
                {loading ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="text-5xl mb-4">🏗️</div>
                    <p className="text-lg font-medium">正在根据尺寸建模...</p>
                    <p className="text-sm">解析 prompt: {formData.type} / {formData.width}m x {formData.height}m</p>
                  </div>
                ) : (
                  <>
                    <div className="text-6xl mb-4 opacity-50">🖼️</div>
                    <p className="text-xl font-medium text-slate-500">等待设计指令</p>
                    <p className="text-sm mt-2">在左侧输入参数，AI 将为您生成专属方案</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 下载按钮区域 */}
          {image && (
            <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="font-bold text-slate-700">设计完成</p>
                <p className="text-xs text-slate-500">尺寸比例参考: {formData.width}m x {formData.height}m</p>
              </div>
              <a 
                href={image} 
                download={`beijibiao_${formData.shopName}.jpg`} 
                target="_blank"
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-sm flex items-center gap-2"
              >
                <span>⬇️</span> 下载高清原图
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}