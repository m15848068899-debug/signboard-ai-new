"use client";

import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { Send, Diamond, Download, Gift, MessageSquare, Image as ImageIcon, Sparkles, ShoppingBag, ArrowRight } from "lucide-react";

fal.config({
  proxyUrl: "/api/generate",
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  
  // --- 状态管理 ---
  const [remainingCount, setRemainingCount] = useState<number>(3); 
  const [showRechargeModal, setShowRechargeModal] = useState(false); // 充值弹窗
  const [showFeedbackModal, setShowFeedbackModal] = useState(false); // 留言弹窗
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
      // 每日重置逻辑：如果次数少于3次，补满3次
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

  // 兑换码逻辑 (这里设置你的闲鱼卡密)
  const handleRedeem = () => {
    // ⚠️ 请在这里修改为你真实的卡密
    const validCodes = ["XY-NORTH-20", "XY-8888-20", "VIP-2026"]; 
    
    if (validCodes.includes(redeemCode.toUpperCase())) {
      const newCount = remainingCount + 20; // 增加20次
      updateCount(newCount);
      setShowRechargeModal(false);
      setRedeemCode("");
      alert(`🎉 兑换成功！次数已增加 20 次！当前剩余：${newCount}`);
    } else {
      alert("❌ 兑换码无效，请核对闲鱼发货的卡密");
    }
  };

  // 发送留言到微信
  const handleSendFeedback = async () => {
    if (!feedbackContact || !feedbackMsg) return alert("请填写完整信息");
    setSendingMsg(true);
    
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ contact: feedbackContact, message: feedbackMsg }),
      });
      if (res.ok) {
        alert("✅ 留言已发送！我们会尽快通过微信联系您。");
        setShowFeedbackModal(false);
        setFeedbackMsg("");
      } else {
        alert("发送失败，请稍后重试");
      }
    } catch (e) {
      alert("网络错误");
    } finally {
      setSendingMsg(false);
    }
  };

  // 表单数据
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
    
    if (remainingCount <= 0) {
      setShowRechargeModal(true);
      return;
    }

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
        Lighting: Natural daylight, soft shadows, high definition, 8k resolution.
        Background: Clean building facade.
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
        updateCount(remainingCount - 1); // 扣费
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
      
      {/* 顶部导航栏 */}
      <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-sm sticky top-4 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
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
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-200 text-sm font-bold"
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
            
            <div>
              <label className="text-sm font-bold text-slate-700 ml-1 mb-2 block">店铺名称 (英文/拼音)</label>
              <input
                type="text"
                className="w-full p-4 bg-slate-50 border-0 rounded-2xl text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                placeholder="例如: LUCKY COFFEE"
                value={formData.shopName}
                onChange={handleNameChange}
              />
              <p className="text-[10px] text-slate-400 mt-2 ml-1">
                * 建议先用英文占位，设计完成后自行替换中文
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">店铺类型</label>
                  <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="technology_company">科技公司</option>
                    <option value="coffee_shop">咖啡店</option>
                    <option value="restaurant">餐饮美食</option>
                    <option value="clothing_store">服装店</option>
                    <option value="flower_shop">花店</option>
                  </select>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">风格</label>
                  <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.style} onChange={(e) => setFormData({...formData, style: e.target.value})}>
                    <option value="minimalist_modern">现代极简</option>
                    <option value="cyberpunk_future">赛博朋克</option>
                    <option value="industrial_loft">工业风</option>
                    <option value="luxury_elegant">轻奢高端</option>
                    <option value="chinese_traditional_retro">新中式</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">长度 (m)</label>
                <input type="number" step="0.1" className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">高度 (m)</label>
                <input type="number" step="0.1" className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">材质质感</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})}>
                <option value="acrylic_led_lightbox">亚克力 + LED 发光字</option>
                <option value="brushed_stainless_steel">拉丝不锈钢</option>
                <option value="neon_glass_tubes">霓虹灯管</option>
                <option value="natural_wood_timber">实木/防腐木</option>
                <option value="aluminum_composite_panel">铝塑板</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1 mb-1 block">色系</label>
              <select className="w-full p-3 bg-slate-50 border-0 rounded-xl text-sm" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}>
                <option value="white_wood_clean">原木色 + 白色</option>
                <option value="black_gold_luxury">黑金商务</option>
                <option value="red_festive_bold">中国红 + 金色</option>
                <option value="tech_blue_silver">科技蓝 + 银色</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95 ${
                loading ? "bg-slate-300 cursor-not-allowed" : 
                "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
              }`}
            >
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
                      <p>正在进行光影渲染...</p>
                   </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <ImageIcon className="text-slate-300" size={40} />
                    </div>
                    <p className="text-2xl font-bold text-slate-300">等待生成...</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- 弹窗组件: 闲鱼充值 (新设计) --- */}
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
              {/* 重点修改的部分：会员获取方式按钮 */}
              <a 
                href="https://m.tb.cn/h.7RH42eA?tk=nAb7UcRw7ed CZ009" // ⚠️ 记得换成你的闲鱼商品链接！
                target="_blank"
                className="group relative flex items-center justify-between p-4 bg-[#ffda44] hover:bg-[#ffcd00] rounded-xl shadow-lg shadow-yellow-100 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                   <div className="bg-white/30 p-2 rounded-lg text-slate-900">
                      <ShoppingBag size={24} />
                   </div>
                   <div className="text-left">
                     <div className="text-base font-extrabold text-slate-900">会员获取方式</div>
                     <div className="text-xs text-slate-800/80">点击跳转 闲鱼APP 购买</div>
                   </div>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                    <ArrowRight size={18} className="text-slate-900" />
                </div>
              </a>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400">购买后在此输入卡密</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="输入卡密 (如: XY-8888)" 
                  className="flex-1 bg-slate-50 border-0 p-3 rounded-xl text-slate-900 uppercase font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                />
                <button 
                  onClick={handleRedeem}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800"
                >
                  兑换
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 弹窗组件: 售后留言 --- */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowFeedbackModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600">✕</button>
            
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">售后 / 咨询</h2>
            <p className="text-sm text-slate-500 mb-6">留言将直接发送到设计师微信，我们会尽快回复。</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">您的联系方式</label>
                <input 
                  type="text" 
                  placeholder="微信号 / 手机号"
                  className="w-full p-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={feedbackContact}
                  onChange={(e) => setFeedbackContact(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">留言内容</label>
                <textarea 
                  rows={4}
                  placeholder="请描述您的问题，或需要精修的要求..."
                  className="w-full p-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                ></textarea>
              </div>

              <button 
                onClick={handleSendFeedback}
                disabled={sendingMsg}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition-all"
              >
                {sendingMsg ? "发送中..." : <><Send size={18} /> 发送留言</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}