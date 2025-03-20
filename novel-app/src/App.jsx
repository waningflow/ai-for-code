import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { Card, Image } from 'antd';
import { getMessageList, sendChatAndGetMessages } from './utils/api';
import { Spin } from 'antd';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const res = await sendChatAndGetMessages({
        bot_id: '7482756583320666146',
        user_id: userId,
        additional_messages: [
          {
            role: 'user',
            content: '随机生成3种不同的热门小说主题，分别用一段简短的文字介绍',
            content_type: 'text'
          }
        ]
      });
      const answerData = res.find(item => item.type === 'answer');
      if (answerData) {
        const themesContent = answerData.content;
        const themeLines = themesContent.split('\n').filter(line => line.includes('主题'));
        const themes = await Promise.all(themeLines.map(async (line, index) => {
          const topic = line.replace(`- 主题 ${index + 1}：`, '').trim();
          return {
            id: index + 1,
            name: topic,
            image: await fetchImage(topic)
          }
        }))
        setThemes(themes);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
    setIsLoading(false);
  };

  const fetchStory = async (theme) => {
    try {
      const mockStory = {
        text: '这是一个模拟的故事内容。',
        image: 'https://example.com/mock-image.jpg',
        options: [
          { id: 1, text: '选项1', nextTheme: 2 },
          { id: 2, text: '选项2', nextTheme: 1 },
          // 可以添加更多模拟选项
        ]
      };
      setStory(mockStory);
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  // 根据大模型获取图片
  const fetchImage = async (prompt) => {
    try {
      const res = await sendChatAndGetMessages({
        bot_id: '7483550781116104704',
        user_id: userId + Math.random().toString(36).substring(7),
        additional_messages: [
          {
            role: 'user',
            content: `根据以下提示生成一张图片，图片风格为「黑白动漫」，比例 「2:3」：${prompt}`,
            content_type: 'text'
          }
        ]
      });
      const answerData = res.find(item => item.type === 'answer');
      if (answerData) {
        const urlRegex = /(https?:\/\/[\w\d\._\-\/\?&=]+)/g;
        const match = answerData.content.match(urlRegex);
        if (match) {
          return match[0];
        }
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  useEffect(() => {
    setUserId(Math.random().toString(36).substring(7))
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchThemes();
  }, [userId]);

  return (
    <>
      <Spin spinning={isLoading} tip="加载中..." >
        <div style={{ width: '100%', height: '100%' }}>
          <h1>“短漫”的诞生</h1>
          {!selectedTheme && (
            <div>
              <h2>选择小说主题</h2>
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  style={{ marginBottom: 16 }}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <p style={{ fontSize: 16, fontWeight: 'bold' }}>{theme.name}</p>
                  <Image
                    width={200}
                    src={theme.image} />
                </Card>
              ))}
              <button onClick={fetchThemes}>刷新主题</button>
            </div>
          )}
          {selectedTheme && (
            <div>
              <h2>你选择的主题是: {selectedTheme.name}</h2>
              <button onClick={() => setSelectedTheme(null)}>重新选择</button>
              <button onClick={() => fetchStory(selectedTheme.id)}>开始故事</button>
            </div>
          )}
          {story && (
            <div>
              <h2>故事内容</h2>
              <p>{story.text}</p>
              <img src={story.image} alt="故事图片" />
              <h3>后续发展</h3>
              <ul>
                {story.options.map((option) => (
                  <li key={option.id} onClick={() => fetchStory(option.nextTheme)}>
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Spin>
    </>
  );
}

export default App


