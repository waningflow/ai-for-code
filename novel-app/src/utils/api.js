import axios from 'axios';

// 提取基础配置
const baseConfig = {
  headers: {
    Authorization:
      'Bearer pat_mlbScGjq1V4NYLgxxtoHU1lSYeZ1H73axIRSNazDKVPYchkXNqt3ZmptaNInHaYP',
  },
};

// 提取请求函数
const makeRequest = async (url, method, params = {}, data = {}) => {
  try {
    const response = await axios({ ...baseConfig, url, method, params, data });
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
};

// 获取消息列表
const getMessageList = async (conversation_id, chat_id) => {
  const baseURL = 'https://api.coze.cn/v3/chat/message/list';
  const response = await makeRequest(baseURL, 'get', {
    conversation_id,
    chat_id,
  });
  return response.data;
};

// 发送聊天请求
const sendChatRequest = async (data) => {
  const url = 'https://api.coze.cn/v3/chat';
  const response = await makeRequest(url, 'post', {}, data);
  return response.data;
};

// 检索聊天记录
const retrieveChat = async (conversation_id, chat_id) => {
  const url = 'https://api.coze.cn/v3/chat/retrieve';
  const response = await makeRequest(url, 'get', { conversation_id, chat_id });
  return response.data;
};

// 封装新方法
const sendChatAndGetMessages = async (data) => {
  try {
    // 发送聊天请求
    const response = await sendChatRequest(data);
    const conversation_id = response.conversation_id;
    const chat_id = response.id;
    // 轮询检索消息记录，直到状态为 completed 或 failed
    let status = '';
    while (status !== 'completed' && status !== 'failed') {
      const response = await retrieveChat(conversation_id, chat_id);
      status = response.status;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (status === 'failed') {
      throw new Error('Chat request failed');
    }
    // 获取消息列表
    const messageList = await getMessageList(conversation_id, chat_id);
    return messageList;
  } catch (error) {
    console.error('Error in sendChatAndGetMessages:', error);
    throw error;
  }
};

export {
  getMessageList,
  sendChatRequest,
  retrieveChat,
  sendChatAndGetMessages,
};
