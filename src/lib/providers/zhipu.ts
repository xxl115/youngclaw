import { streamOpenAiChat } from './openai'
import type { StreamChatOptions } from './index'

export async function streamZhipuChat(opts: StreamChatOptions): Promise<string> {
  // Use Zhipu Coding API endpoint for better performance and pricing
  const patchedSession = {
    ...opts.session,
    apiEndpoint: opts.session.apiEndpoint || 'https://open.bigmodel.cn/api/coding/paas/v4',
  }
  return streamOpenAiChat({ ...opts, session: patchedSession })
}
