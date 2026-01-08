import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { contact, message } = await req.json();

    // 这里填你刚才获取的 WxPusher 信息
    // 建议以后放到环境变量里，现在为了方便直接填
    const APP_TOKEN = "AT_A5n9JrcOrq4PaF4Om7m6iDE3RyUcFlDI"; // 替换成你的 APP_TOKEN
    const MY_UID = "UID_zOZTyreNlpn1NLGj2MOohzUB3Yek";   // 替换成你的 UID

    // 发送请求给 WxPusher
    const res = await fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appToken: APP_TOKEN,
        content: `【新客户留言】\n联系方式：${contact}\n留言内容：${message}`,
        contentType: 1, // 1表示文字
        uids: [MY_UID],
      }),
    });

    const data = await res.json();
    
    if (data.code === 1000) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: data.msg }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}