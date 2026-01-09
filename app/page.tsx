"use client";

import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { Send, Diamond, Download, Gift, MessageSquare, Image as ImageIcon, Sparkles, ShoppingBag, ArrowRight, Layers, Type, User, LogOut, Phone, ScanLine, Ruler } from "lucide-react";

fal.config({
  proxyUrl: "/api/generate",
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  // --- 用户状态 ---
  const [userPhone, setUserPhone] = useState(""); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, setCredits] = useState(0); 
  
  // --- 弹窗 ---
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // --- 输入 ---
  const [loginInput, setLoginInput] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // 初始化
  useEffect(() => {
    const savedPhone = localStorage.getItem("currentUser");
    if (savedPhone) loginUser(savedPhone);
  }, []);

  const loginUser = (phone: string) => {
    setUserPhone(phone);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", phone);
    setShowLoginModal(false);
    const userCredits = localStorage.getItem(`credits_${phone}`);
    if (userCredits === null) {
      localStorage.setItem(`credits_${phone}`, "3");
      setCredits(3);
    } else {
      setCredits(parseInt(userCredits));
    }
  };

  const handleLoginSubmit = () => {
    if (!/^1[3-9]\d{9}$/.test(loginInput)) return alert("请输入正确的11位手机号");
    loginUser(loginInput);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setUserPhone("");
    setCredits(0);
    setImage(null);
  };

  const updateCredits = (newVal: number) => {
    setCredits(newVal);
    localStorage.setItem(`credits_${userPhone}`, newVal.toString());
  };

  const handleRedeem = () => {
    const validCodes = ["XY-NORTH-20", "XY-8888-20", "VIP-2026", "CZ009"]; 
    const usedCodes = JSON.parse(localStorage.getItem("usedCodes") || "[]");
    if (usedCodes.includes(redeemCode)) return alert("❌ 该卡密已被使用！");

    if (validCodes.includes(redeemCode.toUpperCase())) {
      const newCount = credits + 20;
      updateCredits(newCount);
      usedCodes.push(redeemCode);
      localStorage.setItem("usedCodes", JSON.stringify(usedCodes));
      setShowRechargeModal(false);
      setRedeemCode("");
      alert(`🎉 充值成功！当前余额：${newCount} 次`);
    } else {
      alert("❌ 无效卡密，请去闲鱼购买");
    }
  };

  // --- 表单数据 ---
  const [formData, setFormData] = useState({
    shopName: "BEIJIBIAO",
    type: "technology_company",
    style: "minimalist_modern",
    color: "white_wood",
    materialBoard: "aluminum_composite", 
    materialText: "led_acrylic",
    width: "4.0",
    height: "1.2",
  });

  // --- 形状计算器 ---
  const getSignboardShapePrompt = (w: string, h: string) => {
    const width = parseFloat(w);
    const height = parseFloat(h);
    const ratio = width / height;

    if (ratio >= 6.0) return "super wide and extremely thin strip signboard";
    if (ratio >= 4.0) return "very long and thin horizontal signboard";
    if (ratio >= 2.5) return "wide panoramic rectangular signboard";
    if (ratio >= 1.5) return "standard rectangular signboard (16:9 ratio shape)";
    if (ratio >= 1.1) return "boxy rectangular signboard";
    if (ratio >= 0.9) return "perfectly square signboard";
    if (ratio >= 0.5) return "vertical portrait signboard";
    return "tall vertical pillar signboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return setShowLoginModal(true);
    if (credits <= 0) return setShowRechargeModal(true);

    setLoading(true);
    setImage(null);

    try {
      const shapeDesc = getSignboardShapePrompt(formData.width, formData.height);
      
      // 🌟 核心升级：超广角 + 强制地面 🌟
      const prompt = `
        Ultra-wide architectural photography, Full Street View.
        Shot from across the street (Long distance shot).
        
        COMPOSITION REQUIREMENTS:
        1. Show the ENTIRE building facade from top to bottom.
        2. MUST show the street pavement and ground level clearly at the bottom.
        3. The storefront should be in the center, surrounded by the building wall.
        
        SIGNBOARD DETAILS:
        - Position: Mounted horizontally above the main entrance door.
        - Shape: ${shapeDesc}.
        - Text: "${formData.shopName}" (3D, Bold, Professional).
        - Dimensions context: The signboard is ${formData.width}m wide and ${formData.height}m high relative to the door.
        
        STORE DESIGN:
        - Type: ${formData.type}.
        - Style: ${formData.style}.
        - Color Theme: ${formData.color}.
        - Materials: ${formData.materialBoard} backboard with ${formData.materialText} text.
        
        CAMERA SETTINGS: 14mm Ultra-Wide Lens, Eye-level view from the street, 8k resolution, Photorealistic.
      `;

      const result: any = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "landscape_16_9", // 保持固定宽屏
          num_inference_steps: 4, 
          enable_safety_checker: false,
        },
        logs: true,
      });

      if (result.data?.images?.[0]?.url) {
        setImage(result.data.images[0].url);
        updateCredits(credits - 1);
      }
    } catch (error) {
      alert("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!feedbackContact || !feedbackMsg) return alert("请填写完整信息");
    setSendingMsg(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ contact: feedbackContact, message: feedbackMsg }),
      });
      alert("✅ 留言已发送！");
      setShowFeedbackModal(false);
      setFeedbackMsg("");
    } catch (e) {
      alert("发送失败");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[a-zA-Z0-9\s\-_.,'&]*$/.test(val)) setFormData({ ...formData, shopName: val });
  };

  const currentRatio = parseFloat(formData.width) && parseFloat(formData.height) 
    ? (parseFloat(formData.width) / parseFloat(formData.height)).toFixed(1) 
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex flex-col items-center py-6 px-4 font-sans text-slate-800">
      
      {/* 顶部导航 */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm sticky top-2 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
            北极标 AI
          </h1>
        </div>

        <div className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              <div onClick={() => setShowRechargeModal(true)} className="cursor-pointer flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-100 transition">
                <Diamond size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">余额: <b className="text-xl ml-1">{credits}</b></span>
                <div className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">充值</div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-600">
                <User size={16} />
                <span>{userPhone}</span>
                <button onClick={handleLogout} className="ml-2 p-1 hover:bg-slate-200 rounded-full"><LogOut size={14} /></button>
              </div>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg font-bold">
              <User size={18} /><span>登录 / 注册</span>
            </button>
          )}
          <button onClick={() => setShowFeedbackModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-50 transition font-bold">
            <MessageSquare size={18} /><span className="hidden sm:inline">售后</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧控制面板 */}
        <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-white/50 h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">店铺名称 (英文)</label>
              <input type="text" className="w-full p-4 bg-slate-50 border-0 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold" placeholder="BEIJIBIAO" value={formData.shopName} onChange={handleNameChange} />
            </div>

            {/* 尺寸输入 */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 relative z-10">
                    <Ruler size={16} className="text-indigo-500"/>
                    <span className="text-xs font-bold text-indigo-900">牌匾尺寸 (单位:米)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 block">长度 Width</label>
                      <input type="number" step="0.1" className="w-full p-3 bg-white border-0 rounded-xl text-sm font-bold text-indigo-900" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 ml-1 mb-1 block">高度 Height</label>
                      <input type="number" step="0.1" className="w-full p-3 bg-white border-0 rounded-xl text-sm font-bold text-indigo-900" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-indigo-400 bg-white/50 p-2 rounded-lg">
                   <span>牌匾长高比: <span className="font-bold text-indigo-600">{currentRatio} : 1</span></span>
                   <span>画布: 固定 16:9</span>
                </div>
            </div>

            {/* 选项 */}
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">店铺类型 (15类)</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="technology_company">科技/互联网公司</option>
                <option value="real_estate_agency">房产中介/事务所</option>
                <option value="beauty_salon_spa">美容院/SPA/美甲</option>
                <option value="hair_salon_barber">理发店/造型沙龙</option>
                <option value="clothing_boutique">服装店/精品店</option>
                <option value="coffee_shop_cafe">咖啡馆 (Cafe)</option>
                <option value="bubble_tea_shop">奶茶店/饮品店</option>
                <option value="bakery_pastry_shop">面包烘焙店</option>
                <option value="restaurant_dining">特色餐饮/饭店</option>
                <option value="bar_nightclub_pub">酒吧/清吧</option>
                <option value="gym_fitness_studio">健身房/瑜伽馆</option>
                <option value="flower_shop_florist">花店/园艺店</option>
                <option value="convenience_store">便利店/超市</option>
                <option value="pet_shop_grooming">宠物店/宠物医院</option>
                <option value="education_center">教育机构/培训班</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1"><Layers size={10}/> 底板材质</label>
                  <select className="w-full p-2 bg-slate-50 border-0 rounded-lg text-xs" value={formData.materialBoard} onChange={(e) => setFormData({...formData, materialBoard: e.target.value})}>
                    <option value="aluminum_composite">铝塑板</option>
                    <option value="brushed_stainless">拉丝不锈钢</option>
                    <option value="natural_wood">防腐木/实木</option>
                    <option value="tempered_glass">烤漆玻璃</option>
                    <option value="marble_stone">大理石/岩板</option>
                    <option value="concrete_cement">清水混凝土</option>
                    <option value="metal_grid_mesh">金属格栅网</option>
                    <option value="3d_wave_panel">3D浮雕板</option>
                    <option value="green_plant_wall">仿真绿植</option>
                    <option value="red_brick_wall">复古红砖</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1"><Type size={10}/> 文字材质</label>
                  <select className="w-full p-2 bg-slate-50 border-0 rounded-lg text-xs" value={formData.materialText} onChange={(e) => setFormData({...formData, materialText: e.target.value})}>
                    <option value="led_acrylic">亚克力发光字</option>
                    <option value="neon_tube">霓虹灯管</option>
                    <option value="stainless_steel">不锈钢精工字</option>
                    <option value="backlit_metal">背发光金属字</option>
                    <option value="mini_acrylic">迷你发光字</option>
                    <option value="bulb_letters">美式灯泡字</option>
                    <option value="titanium_gold">钛金字</option>
                    <option value="matte_black_metal">黑漆铁皮字</option>
                    <option value="wood_carving">实木雕刻</option>
                    <option value="resin_epoxy">树脂字</option>
                  </select>
                </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">设计风格</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})}>
                <option value="minimalist_modern">现代极简风</option>
                <option value="cyberpunk_neon">赛博朋克/科技风</option>
                <option value="industrial_loft">工业废墟风</option>
                <option value="luxury_premium">轻奢黑金风</option>
                <option value="chinese_new_retro">新中式国潮</option>
                <option value="japanese_zen">日式原木/寂诧风</option>
                <option value="american_retro">美式复古/波普</option>
                <option value="nordic_ins">北欧INS风</option>
                <option value="french_cream">法式奶油风</option>
                <option value="hongkong_neon">港式复古霓虹</option>
                <option value="cute_cartoon">可爱卡通/二次元</option>
                <option value="bauhaus_geometric">包豪斯/几何风</option>
                <option value="nature_organic">自然森系/绿植</option>
                <option value="gothic_dark">暗黑哥特风</option>
                <option value="art_deco_vintage">Art Deco/复古艺术</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">色系搭配</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}>
                <option value="white_and_wood">🤍 原木 + 暖白</option>
                <option value="black_and_gold">🖤 黑金 + 暖光</option>
                <option value="black_and_white">🐼 极简黑白</option>
                <option value="blue_and_silver">💙 科技蓝 + 银</option>
                <option value="red_and_gold">❤️ 中国红 + 金</option>
                <option value="dark_green_gold">🌲 墨绿 + 铜金</option>
                <option value="klein_blue_white">🔵 克莱因蓝</option>
                <option value="orange_grey">🧡 活力橙 + 灰</option>
                <option value="yellow_black">💛 柠檬黄 + 黑</option>
                <option value="pink_rose_gold">🌸 脏粉 + 玫瑰金</option>
                <option value="purple_cyan">💜 赛博紫 + 青</option>
                <option value="cement_grey">🩶 工业水泥灰</option>
                <option value="mint_green">🍃 薄荷绿 + 白</option>
                <option value="navy_gold">⚓ 海军蓝 + 金</option>
                <option value="chocolate_cream">🍫 巧克力 + 奶油</option>
                <option value="beige_apricot">🥯 米色 + 杏色</option>
                <option value="transparent_glass">🧊 全透明玻璃</option>
                <option value="rainbow_gradient">🌈 炫彩渐变</option>
                <option value="silver_mirror">🪞 全镜面银</option>
                <option value="all_matte_black">🌑 极致全黑</option>
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
                      <p>AI 正在构建建筑立面...</p>
                   </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ImageIcon className="text-slate-300" size={40} />
                    </div>
                    <p className="text-2xl font-bold text-slate-300">等待生成...</p>
                    <p className="text-sm text-slate-400 mt-2">请先登录，并在左侧输入参数</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">✕</button>
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">欢迎回来</h2>
              <p className="text-slate-500 text-sm mt-2">请输入手机号登录/注册 (自动创建)</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition">
                <Phone size={20} className="text-slate-400 mr-3" />
                <input type="tel" placeholder="请输入手机号" className="bg-transparent border-0 outline-none w-full text-slate-900 font-bold tracking-wider" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} maxLength={11} />
              </div>
              <button onClick={handleLoginSubmit} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">立即登录</button>
              <p className="text-xs text-center text-slate-400">* 仅作为本地账号凭证，无需验证码</p>
            </div>
          </div>
        </div>
      )}

      {/* 充值弹窗 */}
      {showRechargeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <button onClick={() => setShowRechargeModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">✕</button>
            <div className="text-center mb-8">
              <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                <Gift size={32} className="text-yellow-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">点数不足</h2>
              <p className="text-slate-500 mt-2">新用户送3次，更多次数请充值</p>
            </div>
            <div className="space-y-6">
              <a href="https://m.tb.cn/h.7RH42eA?tk=nAb7UcRw7ed" target="_blank" className="group relative flex items-center justify-between p-4 bg-[#ffda44] hover:bg-[#ffcd00] rounded-xl shadow-lg shadow-yellow-100 transition-all hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-3"><div className="bg-white/30 p-2 rounded-lg text-slate-900"><ShoppingBag size={24} /></div><div className="text-left"><div className="text-base font-extrabold text-slate-900">会员获取方式</div><div className="text-xs text-slate-800/80">点击跳转 闲鱼APP 购买</div></div></div><div className="bg-white/20 p-2 rounded-full"><ArrowRight size={18} className="text-slate-900" /></div>
              </a>
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