import { Link } from 'react-router-dom';

const LAST_UPDATED = '2026-05-17';

export default function TermsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10">
      <div className="max-w-3xl mx-auto text-gray-200">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-300">← 返回首页</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">服务条款</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：{LAST_UPDATED}</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <p>
            欢迎使用 C2C / CodingBot。注册账号或继续使用即表示你已阅读并同意以下条款。
            本服务源码以 <a href="https://github.com/Charlies2001/C2C-coding-coach/blob/main/LICENSE" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:text-cyan-300">MIT License</a> 开源；
            你可以自行部署运行。
          </p>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">1. 服务定位（教育合规声明）</h2>
            <p className="text-gray-300">
              本平台是 <strong>编程学习辅助工具</strong>，不是答案生成器。AI 助教被刻意调整为：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-300 mt-2">
              <li><strong>不直接告诉答案</strong>：助教模式只引导思路、问反问、给提示。</li>
              <li><strong>教学模式</strong>：把抽象概念拆解成可理解的步骤，但仍由学生自己写出代码。</li>
              <li><strong>提示模式</strong>：按学生当前卡点的最小步幅给提示，避免一次性透露解法。</li>
            </ul>
            <p className="text-gray-300 mt-2">
              使用者应理解：直接复制 AI 输出当作业提交，可能违反所在学校的学术诚信规则。
              本平台不对滥用行为承担责任。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">2. 未成年人使用</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>本平台原则上面向 <strong>13 岁及以上</strong> 用户。13–17 岁用户应在家长或法定监护人知情同意下使用。</li>
              <li>对欧盟 / 英国 / 韩国等地区，年龄下限按当地法律（GDPR 16 岁、PIPA 14 岁等）执行。</li>
              <li>建议未成年人使用功能时优先选择 <strong>不收集训练数据</strong> 的 LLM provider，
                  或使用桌面版本地运行（数据不出本机）。</li>
              <li>如发现 13 岁以下用户注册，平台会主动删除账号。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">3. BYOK（自带 API Key）免责</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>本平台不代付 LLM token 费用。所有 AI 调用计入 <strong>你自己的 provider 账户</strong>。</li>
              <li>建议在 provider 控制台设置月度预算告警，避免误用导致超支。</li>
              <li>API Key 仅服务端用于代发请求；不会主动用于训练或分享给第三方。平台被入侵的极端情况下，
                  加密的 Key 仍需破解 ENCRYPTION_KEY 才能解出 — 建议 provider 控制台同时设置 IP 白名单 / 用量上限。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">4. 禁止的行为</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>不得用本平台生成的内容用于违法、违背公序良俗、侵犯他人权利的目的。</li>
              <li>不得探测、攻击、绕过平台的速率限制 / 认证机制。</li>
              <li>不得提交恶意代码企图获取服务器执行权限。学生代码统一在 Pyodide Web Worker 沙盒中运行，
                  不接触服务端文件系统；但仍请勿尝试。</li>
              <li>不得将 BYOK 通道用于商业代理转发（你只能用自己的账号、为自己学习）。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">5. 服务可用性</h2>
            <p className="text-gray-300">
              本服务按"现状"提供，不承诺 SLA。计划性升级会在登录页提前公告。
              因第三方 LLM provider 宕机、网络中断、Fly.io / Neon 故障等不可抗力导致的服务中断，平台不承担赔偿责任。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">6. 内容归属</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>题目库中的内置题目以 MIT 协议随源码开放。</li>
              <li>你自己创建的题目、笔记、提交代码归你所有；你授予平台为提供服务所必需的存储、展示、传输许可。</li>
              <li>AI 生成的内容不属于平台或 provider；适用于你所选 provider 关于"生成内容归属"的条款。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">7. 终止</h2>
            <p className="text-gray-300">
              你可随时删除账号；平台在你违反本条款时可暂停或终止你的账号。源码 MIT 开源，
              即使账号被终止你仍可自行部署。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">8. 适用法律与争议</h2>
            <p className="text-gray-300">
              本条款的解释、效力适用部署运营者所在地法律。优先通过 GitHub Issues 沟通解决；
              协商不成，提交至运营者所在地有管辖权的法院。
            </p>
          </div>

          <p className="text-gray-500 text-xs pt-6">
            See also: <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">隐私政策</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
