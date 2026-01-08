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
    shopName: "BEIJIBIAO",
    type: "technology_company",
    style: "minimalist_modern",
    color: "white_wood",
    material: "acrylic_led",
    width: "4.5",
    height: "1.2",
  });

  const getAspectRatio = (w: string, h: string) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    const ratio = width / height;
    if (ratio > 1.2) return "landscape_16_9";
    if (ratio < 0.8) return "portrait_16_9";
    return "square_hd";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setImage(null);

    try {
      const sizeRatio = getAspectRatio(formData.width, formData.height);
      
      const prompt = `
        Architectural photography, Front elevation view of a ${formData.type} storefront facade.
        Straight-on angle, symmetrical composition, flat perspective, 90 degree view.
        
        The signboard clearly says "${formData.shopName}" in large, bold, professional typography.
        Storefront dimensions: ${formData.width}m wide x ${formData.height}m high.
        
        Material & Texture details: ${formData.material}.
        Design Style: ${formData.style}.
        Color Palette: ${formData.color}.
        
        Lighting: Natural daylight, soft shadows, high definition, 8k resolution, photorealistic, sharp focus.
        Background: Clean building facade.
      `;

      // 这里已经确认切回了 schnell (极速版)，步数设为 4
      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: sizeRatio,
          num_inference_steps: 4, 
          enable_safety_checker: false,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") console.log(update.logs);
        },
      });

      if (result.data && result.data.images && result.data.images.length > 0) {
        setImage(result.data.images[0].url);
      } else if (result.images && result.images.length > 0) {
        setImage(result.images[0].url);
      }
    } catch (error) {
      alert("生成失败，请稍后重试");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化，强制过滤非英文字符
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 正则表达式：只允许 英文字母、数字、空格、减号、点、逗号、&符号
    // 如果输入了中文，test 就会返回 false，状态就不会更新，字就打不上去了
    if (/^[a-zA-Z0-9\s\-_.,'&]*$/.test(val)) {
      setFormData({ ...formData, shopName: val });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 font-sans">
      <h1 className="text-4xl font-extrabold text-slate-800 mb-2">北极标广告 AI 设计</h1>
      <p className="text-slate-500 mb-8">输入参数，一键生成专业门头效果图</p>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧控制面板 */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-xl h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 店铺名称 (已修改：限制只能输英文) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">店铺名称 (仅限英文/拼音)</label>
              <input
                type="text"
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例如: BEIJIBIAO"
                value={formData.shopName}
                onChange={handleNameChange} // 使用新的处理函数
              />
              <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                ⚠️ 提示：因为 AI 生成汉字可能会缺笔画，所以名称请先用英文/拼音代替，后期设计时再自行替换为中文。
              </p>
            </div>

            {/* 场所类型 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">店铺类型</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <optgroup label="餐饮美食">
                  <option value="coffee_shop">咖啡店</option>
                  <option value="bubble_tea_shop">奶茶店</option>
                  <option value="bakery">烘焙面包店</option>
                  <option value="japanese_restaurant">日料/寿司店</option>
                  <option value="hotpot_restaurant">火锅店</option>
                  <option value="bbq_grill_restaurant">烧烤店</option>
                  <option value="fast_food_restaurant">快餐店</option>
                  <option value="bar_pub">酒吧/酒馆</option>
                </optgroup>
                <optgroup label="零售百货">
                  <option value="clothing_boutique">服装精品店</option>
                  <option value="convenience_store">便利店 (7-11风格)</option>
                  <option value="flower_shop">花店</option>
                  <option value="jewelry_store">珠宝店</option>
                  <option value="fruit_shop">水果生鲜</option>
                  <option value="pharmacy_drugstore">药店</option>
                  <option value="pet_shop">宠物店</option>
                </optgroup>
                <optgroup label="服务/公司">
                  <option value="hair_salon">美发沙龙</option>
                  <option value="beauty_spa">美容SPA</option>
                  <option value="real_estate_agency">房产中介</option>
                  <option value="gym_fitness">健身房</option>
                  <option value="technology_company">科技公司</option>
                  <option value="law_firm_office">律所/商务办公</option>
                  <option value="kindergarten">幼儿园/教培</option>
                </optgroup>
              </select>
            </div>

            {/* 尺寸 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">长度 (m)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
                  value={formData.width}
                  onChange={(e) => setFormData({...formData, width: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">高度 (m)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-slate-300 rounded-lg text-slate-900"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                />
              </div>
            </div>

            {/* 材质 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">✨ 门头材质</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
              >
                <option value="acrylic_led_lightbox">亚克力 + LED 发光字</option>
                <option value="brushed_stainless_steel">拉丝不锈钢 (金属感)</option>
                <option value="neon_glass_tubes">霓虹灯管 (复古潮流)</option>
                <option value="natural_wood_timber">实木/防腐木 (自然风)</option>
                <option value="aluminum_composite_panel">铝塑板 (现代通用)</option>
                <option value="glass_curtain_wall">全玻璃幕墙 (高端)</option>
                <option value="stone_marble_texture">大理石/石材 (厚重)</option>
                <option value="3d_printed_plastic">3D打印/异形造型</option>
              </select>
            </div>

            {/* 风格 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">设计风格</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
              >
                <option value="minimalist_modern">现代极简</option>
                <option value="cyberpunk_future">赛博朋克/科技</option>
                <option value="industrial_loft">工业风</option>
                <option value="luxury_elegant">轻奢高端</option>
                <option value="chinese_traditional_retro">新中式国潮</option>
                <option value="japanese_wabi_sabi">日式寂诧风</option>
                <option value="american_pop_art">美式波普/复古</option>
                <option value="cute_cartoon">可爱/卡通</option>
              </select>
            </div>

            {/* 颜色 */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">色系搭配</label>
              <select
                className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 bg-white"
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
              >
                <option value="white_wood_clean">原木色 + 白色</option>
                <option value="black_gold_luxury">黑金商务</option>
                <option value="red_festive_bold">中国红 + 金色</option>
                <option value="tech_blue_silver">科技蓝 + 银色</option>
                <option value="pink_pastel_soft">粉色系 (马卡龙)</option>
                <option value="green_white_nature">生态绿 + 白色</option>
                <option value="orange_yellow_vibrant">活力橙 + 黄色</option>
                <option value="grey_concrete_mono">水泥灰 (工业风)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${
                loading ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "AI 设计师工作中..." : "立即生成效果图"}
            </button>
          </form>
        </div>

        {/* 右侧展示区域 */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex-1 min-h-[600px] flex items-center justify-center relative overflow-hidden group">
            {image ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
                <img 
                  src={image} 
                  alt="Result" 
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg" 
                />
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={image} download className="px-8 py-3 bg-green-600 text-white rounded-full font-bold shadow-lg hover:bg-green-700 flex items-center gap-2">
                    <span>⬇️</span> 下载原图
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                {loading ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-xl font-bold text-slate-600">正在进行光影渲染...</p>
                    <p className="text-sm mt-2">应用材质: {formData.material}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-7xl mb-6 opacity-30">🏪</div>
                    <p className="text-2xl font-bold text-slate-300">效果图展示区</p>
                    <p className="text-slate-400 mt-2">请在左侧选择详细参数</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm flex justify-between items-center">
             <span>💡 提示：效果图生成后，可使用 Photoshop 或美图秀秀替换为正式中文店名。</span>
             <span className="font-bold">By 北极标广告</span>
          </div>
        </div>

      </div>
    </div>
  );
}