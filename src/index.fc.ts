import type { FCCallback, FCContext, FCEvent } from './types/fc';
import { defLogger } from './utils/log/def';
import { JSON5 } from './utils/json5';

/**
 * 公告
 */
const notice = async (msg?: string) => {
  defLogger.info(msg || `阿里云 FC 测试ing`);
};

export async function dailyMain() {
  notice();
  const { dailyHandler } = await import('./utils/serverless');
  return await dailyHandler.run();
}

export async function handler(event: Buffer, context: FCContext, callback: FCCallback) {
  try {
    const eventJson: FCEvent = JSON5.parse(event.toString());
    const { dailyHandler } = await import('./utils/serverless');
    dailyHandler.init({
      event: eventJson,
      context,
      slsType: 'fc',
    });
    let isReturn = false;
    if (eventJson.payload) {
      isReturn = await runTasks(eventJson.payload);
    }
    if (isReturn) {
      callback(null, 'success');
      return;
    }
    const message = await dailyMain();
    callback(null, message);
  } catch (error) {
    callback(error);
  }
}

export async function runTasks(payload: string) {
  try {
    const { runInputBiliTask } = await import('./task');
    const payloadJson = JSON5.parse(payload);
    if (payloadJson.task) {
      await runInputBiliTask(payloadJson.task);
      return true;
    }
  } catch {}
  return false;
}
