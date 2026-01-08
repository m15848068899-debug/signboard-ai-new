"use client";

import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { Send, Diamond, Download, Gift, MessageSquare, Image as ImageIcon, Sparkles, ShoppingBag, ArrowRight, Layers, Type } from "lucide-react";

fal.config({
  proxyUrl: "/api/generate",
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  // --- 状态管理 ---
  const [remainingCount, setRemainingCount] = useState<number>(3); 
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  
  // 留言表单
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // 初始化检查
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("usageDate");
    const savedCount = localStorage.getItem("count");

    if (lastDate !== today) {
      const current = parseInt(savedCount || "3");
      if (current < 3) {
        localStorage.setItem("usageDate", today);
        localStorage.setItem("count", "3");
        setRemainingCount(3);
      } else {
        setRemainingCount(current);
      }
    } else {
      setRemainingCount(parseInt(savedCount || "3"));
    }
  }, []);

  const updateCount = (newVal: number) => {
    setRemainingCount(newVal);
    localStorage.setItem("count", newVal.toString());
  };

  // 兑换码逻辑
  const handleRedeem = () => {
    // 这里是你设置的闲鱼发货卡密
    const validCodes = ["XY-NORTH-20", "XY-8888-20", "VIP-2026"]; 
    if (validCodes.includes(redeemCode.toUpperCase())) {
      const newCount = remainingCount + 20;
      updateCount(newCount);
      setShowRechargeModal(false);
      setRedeemCode("");
      alert(`🎉 兑换成功！次数已增加 20 次！当前剩余：${newCount}`);
    } else {
      alert("❌ 兑换码无效，请核对闲鱼发货的卡密");
    }
  };

  // 发送留言
  const handleSendFeedback = async () => {
    if (!feedbackContact || !feedbackMsg) return alert("请填写完整信息");
    setSendingMsg(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ contact: feedbackContact, message: feedbackMsg }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ 留言已发送！设计师会尽快添加您的微信。");
        setShowFeedbackModal(false);
        setFeedbackMsg("");
      } else {
        alert("发送失败，请稍后重试");
      }
    } catch (e) {
      alert("网络错误，请检查网络");
    } finally {
      setSendingMsg(false);
    }
  };

  // --- 表单数据 ---
  const [formData, setFormData] = useState({
    shopName: "BEIJIBIAO",
    type: "technology_company",
    style: "minimalist_modern",
    color: "white_wood",
    materialBoard: "aluminum_composite", // 底板材质
    materialText: "led_acrylic",         // 文字材质
    width: "4.0",
    height: "1.2",
  });

  // --- 智能比例计算 ---
  const getSmartAspectRatio = (w: string, h: string) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    const ratio = width / height;

    if (ratio >= 2.4) return "landscape_21_9"; 
    if (ratio >= 1.7) return "landscape_16_9"; 
    if (ratio >= 1.4) return "landscape_3_2";  
    if (ratio >= 1.1) return "landscape_4_3";  
    if (ratio >= 0.9) return "square_hd";      
    if (ratio >= 0.7) return "portrait_4_3";   
    return "portrait_16_9";                    
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingCount <= 0) {
      setShowRechargeModal(true);
      return;
    }
    setLoading(true);
    setImage(null);

    try {
      const sizeRatio = getSmartAspectRatio(formData.width, formData.height);
      
      const prompt = `
        Close-up architectural photography of a Storefront Signboard.
        Focus primarily on the signboard design and texture.
        
        Store Type: ${formData.type}.
        Shop Name: "${formData.shopName}" (Bold, legible, professional typography).
        
        Dimensions shape: ${formData.width}m width by ${formData.height}m height.
        
        Materials Configuration:
        1. Signboard Background: ${formData.materialBoard}.
        2. Lettering/Logo: ${formData.materialText}.
        
        Design Style: ${formData.style}.
        Color Palette: ${formData.color}.
        
        View: Straight-on front elevation, flat perspective, 90-degree angle.
        Lighting: Natural daylight, soft shadows, 8k resolution, high definition textures.
      `;

      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: sizeRatio, 
          num_inference_steps: 4, 
          enable_safety_checker: false,
        },
        logs: true,
      });

      if (result.data && result.data.images && result.data.images.length > 0) {
        setImage(result.data.images[0].url);
        updateCount(remainingCount - 1);
      } else if (result.images && result.images.length > 0) {
        setImage(result.images[0].url);
        updateCount(remainingCount - 1);
      }
    } catch (error) {
      alert("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[a-zA-Z0-9\s\-_.,'&]*$/.test(val)) {
      setFormData({ ...formData, shopName: val });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center py-8 px-4 font-sans text-slate-800">
      
      {/* 顶部导航 */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            北极标 AI 设计
          </h1>
        </div>
        <div className="flex gap-3 items-center">
          <div 
            onClick={() => setShowRechargeModal(true)}
            className="cursor-pointer flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-100 transition"
          >
            <Diamond size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">剩余次数: <b className="text-xl ml-1">{remainingCount}</b></span>
            <div className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">充值</div>
          </div>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-lg text-sm font-bold"
          >
            <MessageSquare size={16} />
            <span>售后/咨询</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧控制面板 */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-white/50 h-fit">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 店铺名称 */}
            <div>
              <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">店铺名称 (英文/拼音)</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-0 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium" placeholder="例如: BEIJIBIAO" value={formData.shopName} onChange={handleNameChange} />
              <p className="text-[10px] text-slate-400 mt-2 ml-1">* 提示：AI 暂不支持汉字，请先用英文/拼音占位。</p>
            </div>

            {/* 尺寸输入 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">牌匾长度 (m)</label>
                <input type="number" step="0.1" className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">牌匾高度 (m)</label>
                <input type="number" step="0.1" className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            {/* 店铺类型 (15种) */}
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">店铺类型 (15类)</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="technology_company">科技互联网公司</option>
                <option value="real_estate_agency">房产中介/事务所</option>
                <option value="law_firm_finance">律所/金融机构</option>
                <option value="beauty_salon_spa">美容院/SPA会所</option>
                <option value="hair_barber_shop">理发店/造型沙龙</option>
                <option value="clothing_boutique">服装精品店</option>
                <option value="jewelry_store">珠宝首饰店</option>
                <option value="coffee_shop_cafe">咖啡馆 (Cafe)</option>
                <option value="bubble_tea_shop">奶茶饮品店</option>
                <option value="bakery_pastry">烘焙面包店</option>
                <option value="restaurant_dining">特色餐饮/饭店</option>
                <option value="bar_nightclub">酒吧/夜店</option>
                <option value="gym_fitness_center">健身房/瑜伽馆</option>
                <option value="flower_shop_florist">花店/园艺</option>
                <option value="convenience_store">便利店/超市</option>
              </select>
            </div>

            {/* 材质拆分: 底板材质 (10种) */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-500 ml-1 mb-1">
                <Layers size={12}/> 底板材质
              </label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.materialBoard} onChange={(e) => setFormData({...formData, materialBoard: e.target.value})}>
                <option value="aluminum_composite_panel">铝塑板 (平整通用)</option>
                <option value="brushed_stainless_steel">拉丝不锈钢 (金属感)</option>
                <option value="natural_wood_planks">实木/防腐木条 (自然)</option>
                <option value="tempered_glass_back">烤漆玻璃/背漆玻璃</option>
                <option value="stone_marble_slab">大理石/岩板 (厚重)</option>
                <option value="concrete_cement_wall">水泥/清水混凝土 (工业)</option>
                <option value="aluminum_grille_mesh">铝格栅/金属网 (透气)</option>
                <option value="3d_geometric_panel">3D立体浮雕板</option>
                <option value="green_plant_wall">仿真绿植墙 (生态)</option>
                <option value="retro_red_brick">复古红砖墙</option>
              </select>
            </div>

            {/* 材质拆分: 文字材质 (10种) */}
            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-slate-500 ml-1 mb-1">
                <Type size={12}/> 文字/Logo材质
              </label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.materialText} onChange={(e) => setFormData({...formData, materialText: e.target.value})}>
                <option value="led_acrylic_lightbox">LED亚克力发光字</option>
                <option value="neon_glass_tubes">霓虹灯管 (赛博/复古)</option>
                <option value="stainless_steel_3d">不锈钢精工字 (不发光)</option>
                <option value="backlit_metal_halo">背发光金属字 (高级)</option>
                <option value="mini_acrylic_letters">迷你发光字 (精致)</option>
                <option value="bulb_channel_letters">灯泡字 (美式复古)</option>
                <option value="gold_titanium_mirror">钛金镜面字 (奢华)</option>
                <option value="black_matte_metal">哑光黑漆金属字</option>
                <option value="solid_wood_carving">实木雕刻字</option>
                <option value="resin_epoxy_letters">树脂发光字 (通透)</option>
              </select>
            </div>

            {/* 风格 (15种) */}
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">设计风格 (15种)</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})}>
                <option value="minimalist_modern">现代极简风</option>
                <option value="cyberpunk_future_neon">赛博朋克/未来科技</option>
                <option value="industrial_loft_raw">工业Loft/废墟风</option>
                <option value="luxury_premium_elegant">轻奢高端/黑金</option>
                <option value="chinese_new_retro">新中式/国潮</option>
                <option value="japanese_wabi_sabi">日式原木/寂诧风</option>
                <option value="american_retro_pop">美式复古/波普艺术</option>
                <option value="nordic_scandinavian">北欧清新/INS风</option>
                <option value="french_romantic_chic">法式浪漫/奶油风</option>
                <option value="hongkong_neon_street">港式复古/霓虹街头</option>
                <option value="bauhaus_geometric">包豪斯/几何构成</option>
                <option value="memphis_colorful_pop">孟菲斯/撞色艺术</option>
                <option value="zen_nature_organic">禅意/自然有机</option>
                <option value="cute_cartoon_illustration">可爱卡通/二次元</option>
                <option value="gothic_dark_mystery">暗黑/哥特神秘风</option>
              </select>
            </div>

            {/* 色系 (20种) */}
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">色系搭配 (20种)</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}>
                <option value="white_wood_warm">🤍 原木 + 暖白 (温馨)</option>
                <option value="black_gold_luxury">🖤 黑金 + 射灯 (奢华)</option>
                <option value="black_white_minimal">🐼 黑白 + 极简 (经典)</option>
                <option value="tech_blue_silver">💙 科技蓝 + 银色 (未来)</option>
                <option value="chinese_red_gold">❤️ 中国红 + 金色 (喜庆)</option>
                <option value="dark_green_gold">🌲 墨绿 + 铜金 (复古)</option>
                <option value="klein_blue_white">🔵 克莱因蓝 + 白 (潮流)</option>
                <option value="orange_vibrant">🧡 活力橙 + 灰色 (醒目)</option>
                <option value="lemon_yellow_black">💛 柠檬黄 + 黑色 (警示)</option>
                <option value="pink_rose_gold">🌸 脏粉 + 玫瑰金 (女性)</option>
                <option value="purple_neon_cyber">💜 霓虹紫 + 青色 (赛博)</option>
                <option value="cement_grey_industrial">🩶 水泥灰 + 铁锈 (工业)</option>
                <option value="mint_green_pastel">🍃 薄荷绿 + 奶白 (清新)</option>
                <option value="navy_blue_brass">⚓ 海军蓝 + 黄铜 (英伦)</option>
                <option value="chocolate_brown_cream">🍫 巧克力 + 奶油 (烘焙)</option>
                <option value="beige_cream_soft">🥯 米色 + 杏色 (温柔)</option>
                <option value="transparent_glass">🧊 全透明 + 白光 (通透)</option>
                <option value="rainbow_gradient">🌈 炫彩渐变 (网红)</option>
                <option value="silver_mirror_finish">🪞 全镜面银 (前卫)</option>
                <option value="charcoal_matte_black">🌑 极致哑光全黑 (酷)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95 ${loading ? "bg-slate-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"}`}>
              {loading ? "AI 正在绘图中..." : "立即生成效果图"}
            </button>
          </form>
        </div>

        {/* 右侧展示区域 */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <div className="bg-white/60 backdrop-blur-md p-4 rounded-[2rem] shadow-2xl shadow-indigo-50 border border-white/60 flex-1 flex items-center justify-center relative overflow-hidden group">
            {image ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={image} alt="Result" className="max-w-full max-h-[75vh] object-contain shadow-2xl rounded-xl" />
                <div className="absolute bottom-8 right-8 transition-transform hover:scale-105">
                  <a href={image} download className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold shadow-2xl flex items-center gap-2">
                    <Download size={20} /> 下载高清原图
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 flex flex-col items-center">
                {loading ? (
                   <div className="flex flex-col items-center animate-bounce">
                      <Sparkles className="text-indigo-400 mb-4" size={48} />
                      <p>AI 正在根据尺寸和材质计算光影...</p>
                   </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ImageIcon className="text-slate-300" size={40} />
                    </div>
                    <p className="text-2xl font-bold text-slate-300">等待生成...</p>
                    <p className="text-sm text-slate-400 mt-2">请在左侧选择详细参数</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 充值弹窗 */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">✕</button>
            <div className="text-center mb-8">
              <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <Gift size={32} className="text-yellow-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">获取更多点数</h2>
              <p className="text-slate-500 mt-2">闲鱼购买充值卡，9.9元 / 20次</p>
            </div>
            <div className="space-y-6">
              <a 
                href="https://m.tb.cn/h.7RH42eA?tk=nAb7UcRw7ed" 
                target="_blank" 
                className="group relative flex items-center justify-between p-4 bg-[#ffda44] hover:bg-[#ffcd00] rounded-xl shadow-lg shadow-yellow-100 transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center gap-3"><div className="bg-white/30 p-2 rounded-lg text-slate-900"><ShoppingBag size={24} /></div><div className="text-left"><div className="text-base font-extrabold text-slate-900">会员获取方式</div><div className="text-xs text-slate-800/80">点击跳转 闲鱼APP 购买</div></div></div><div className="bg-white/20 p-2 rounded-full"><ArrowRight size={18} className="text-slate-900" /></div>
              </a>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-400">购买后在此输入卡密</span></div></div>
              <div className="flex gap-2">
                <input type="text" placeholder="输入卡密" className="flex-1 bg-slate-50 border-0 p-3 rounded-xl text-slate-900 uppercase font-mono tracking-widest outline-none" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} />
                <button onClick={handleRedeem} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800">兑换</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 售后弹窗 */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">✕</button>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">售后 / 咨询</h2>
            <p className="text-sm text-slate-500 mb-6">留言将直接发送到设计师微信。</p>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold text-slate-700 mb-1">您的联系方式</label><input type="text" placeholder="微信号 / 手机号" className="w-full p-3 bg-slate-50 border-0 rounded-xl outline-none" value={feedbackContact} onChange={(e) => setFeedbackContact(e.target.value)} /></div>
              <div><label className="block text-sm font-bold text-slate-700 mb-1">留言内容</label><textarea rows={4} placeholder="请描述您的需求..." className="w-full p-3 bg-slate-50 border-0 rounded-xl outline-none resize-none" value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)}></textarea></div>
              <button onClick={handleSendFeedback} disabled={sendingMsg} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all">{sendingMsg ? "发送中..." : <><Send size={18} /> 发送留言</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}