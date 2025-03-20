import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { Button, Card, Image, Space } from 'antd';
import { getMessageList, sendChatAndGetMessages } from './utils/api';
import { Spin } from 'antd';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [storyList, setStoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [retryCount, setRetryCount] = useState(0);

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

  const fetchStory = async (prompt) => {
    try {
      const res = await sendChatAndGetMessages({
        bot_id: '7483919423419056154',
        user_id: userId + retryCount.toString(),
        additional_messages: [
          {
            role: 'user',
            content: `请续写故事: ${prompt}`,
            content_type: 'text'
          }
        ]
      });
      const answerData = res.find(item => item.type === 'answer');
      if (answerData) {
        const content = answerData.content;
        const storyRegex = /“([^”]+)”/;
        const choiceRegex = /选择一：([^\n]+)\n选择二：([^\n]+)/;
        const storyMatch = content.match(storyRegex);
        const choiceMatch = content.match(choiceRegex);
        const storyText = storyMatch ? storyMatch[1] : '';
        const option1 = choiceMatch ? choiceMatch[1] : '';
        const option2 = choiceMatch ? choiceMatch[2] : '';
        const story = {
          text: storyText,
          image: await fetchImage(storyText, '「4:3」'),
          options: [
            { id: 1, text: option1, nextTheme: null },
            { id: 2, text: option2, nextTheme: null }
          ]
        };
        setStoryList([...storyList, story]);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  // 根据大模型获取图片
  const fetchImage = async (prompt, ratio = '「2:3」') => {
    try {
      const res = await sendChatAndGetMessages({
        bot_id: '7483550781116104704',
        user_id: userId + Math.random().toString(36).substring(7),
        additional_messages: [
          {
            role: 'user',
            content: `根据以下提示生成一张图片，图片风格为「黑白动漫」，比例 ${ratio}：${prompt}`,
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

  useEffect(() => {
    if (!selectedTheme) return;
    fetchStory(selectedTheme.name);
  }, [selectedTheme, retryCount]);

  return (
    <>
      <Spin spinning={isLoading} tip="加载中..." >
        <div style={{ width: '100%', height: '100%' }}>
          <h1>“短漫”的诞生</h1>
          {themes?.length > 0 && !selectedTheme && <Space style={{ marginBottom: '1rem' }}>选择漫画主题，开启你的专属“短漫” <button style={{ fontSize: '12px', padding: '4px 8px' }} onClick={fetchThemes}>换一批</button></Space>}
          {!selectedTheme && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    style={{ width: 'calc(33.33% - 16px)', aspectRatio: '2 / 3', backgroundImage: `url(${theme.image})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <p style={{ fontSize: 16, fontWeight: 'bold', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 8 }}>{theme.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedTheme && (
            <div>
              <Space style={{ marginBottom: '1rem' }}>
                {selectedTheme.name}
                <button style={{ fontSize: '12px', padding: '4px 8px' }} onClick={() => {
                  setStoryList([]);
                  setRetryCount(retryCount + 1);
                }}>点此重生</button></Space>
            </div>
          )}
          {storyList?.length > 0 && (
            <div>
              {storyList.map((story, index) => {
                return (
                  <div key={index}>
                    <p>{story.text}</p>
                    <Image src={story.image} width={300} />
                    <Space style={{ marginBottom: '1rem' }}>
                      {story.options.map((option) => (
                        <Button key={option.id} onClick={() => fetchStory(option.text)}>{option.text}</Button>
                      ))}
                    </Space>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Spin>
    </>
  );
}

export default App


