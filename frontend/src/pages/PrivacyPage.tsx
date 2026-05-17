import { Link } from 'react-router-dom';

const LAST_UPDATED = '2026-05-17';

export default function PrivacyPage() {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-10">
      <div className="max-w-3xl mx-auto text-gray-200">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-300">← 返回首页</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">隐私政策</h1>
        <p className="text-sm text-gray-500 mb-8">最后更新：{LAST_UPDATED}</p>

        <section className="space-y-6 text-sm leading-relaxed">
          <p>
            C2C / CodingBot 是一个开源的、用户自带 API Key（BYOK）的编程教学平台。
            本政策说明我们收集、存储、使用了什么数据，以及数据流向哪里。
          </p>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">1. 我们收集的数据</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li><strong>账号信息</strong>：邮箱、昵称、密码（bcrypt 哈希存储，明文不落盘）。</li>
              <li><strong>API Key</strong>：你在「设置」中填入的第三方 LLM API Key（Anthropic / OpenAI / 通义 / 智谱 / 豆包 / Gemini 等），
                使用 Fernet 对称加密后存入数据库；只有运行时调用 LLM 才在内存中解密，从不写日志。</li>
              <li><strong>做题数据</strong>：你提交的代码、提交记录、笔记、笔记本、收藏夹。</li>
              <li><strong>使用日志</strong>：HTTP 请求方法/路径/状态码/耗时，含登录用户 ID（用于排查问题）。
                日志写入文件，按大小自动轮转，不保留到第三方分析平台。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">2. 我们 <em>不</em> 收集的数据</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>不收集真实姓名、电话、地址、身份证、年龄（除自我声明未成年人外）。</li>
              <li>不接入第三方广告 SDK、不做用户行为追踪。</li>
              <li>不在浏览器存第三方 cookie（除登录用的 access_token / refresh_token 存在 localStorage 外）。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">3. 数据流向（重要）</h2>
            <p className="text-gray-300 mb-2">
              当你触发 AI 功能（助教 / 提示 / 教学 / 出题）时，平台会用 <strong>你自己配置的 API Key</strong> 调用第三方 LLM。
              发送给 LLM 的内容包括：
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>题目内容（题面、测试用例、你的代码）。</li>
              <li>当前对话历史。</li>
            </ul>
            <p className="text-gray-300 mt-2">
              这部分数据会按 <strong>你所选 LLM provider 的隐私政策</strong> 处理，不在我们的控制范围内。
              请阅读你所用 provider 的官方政策：
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:text-cyan-300 ml-1">Anthropic</a>、
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:text-cyan-300 ml-1">OpenAI</a>、
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:text-cyan-300 ml-1">Google</a>、
              <a href="https://help.aliyun.com/document_detail/2867872.html" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:text-cyan-300 ml-1">阿里百炼</a>。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">4. 数据存储</h2>
            <p className="text-gray-300">
              服务器和数据库部署在境外（应用：Fly.io Sydney / Tokyo；数据库：Neon）。如你对数据跨境敏感，建议使用本地桌面版
              （从 GitHub Releases 下载），所有数据只存你自己电脑。
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">5. 你的权利</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>查看 / 修改：在「设置」「我的笔记」「提交记录」中查看和编辑。</li>
              <li>删除账号：发邮件给本仓库 GitHub Issues 中标注的联系方式，我们会在 30 天内删除你的账号及所有关联数据。</li>
              <li>导出数据：因为是开源项目，你可以直接克隆代码 + 拷贝你的 sqlite/postgres 数据自行处理。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">6. 安全</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-300">
              <li>密码用 bcrypt 单向哈希。</li>
              <li>API Key 用 Fernet 对称加密；加密密钥（ENCRYPTION_KEY）与数据库分开存放。</li>
              <li>HTTPS 强制（Fly.io 自带 TLS）。</li>
              <li>日志中可能出现的 API Key / Fernet token 会自动脱敏（详见 <code className="text-cyan-300">app/logging_config.py</code>）。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">7. 变更</h2>
            <p className="text-gray-300">
              本政策若有变更，会在本页面更新「最后更新」日期。重大变更（例如新增数据采集类型）会在登录后通过站内通知告知。
            </p>
          </div>

          <p className="text-gray-500 text-xs pt-6">
            See also: <Link to="/terms" className="text-cyan-400 hover:text-cyan-300">服务条款</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
