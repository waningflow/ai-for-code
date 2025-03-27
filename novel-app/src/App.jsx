import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import axios from 'axios';
import { Button, Card, Image, Space } from 'antd';
import { getMessageList, sendChatAndGetMessages, sendStreamChatRequest } from './utils/api';
import { Spin } from 'antd';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [storyList, setStoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isFetchingStory, setIsFetchingStory] = useState(false);
  const [isColorful, setIsColorful] = useState(true);

  const getCoverImagePrompt = (roleInfo, storyTitle, storyText, ratio) => {
    const prompt = `根据以下提示生成一张漫画封面，风格为「${isColorful ? '彩色' : '黑白'}动漫」，比例 ${ratio}。漫画标题"${storyTitle}"。人物背景介绍：${roleInfo.name}, ${roleInfo.identity}, ${roleInfo.appearance}。故事介绍：${storyText}`;
    return prompt;
  };

  const fetchThemes = async () => {
    setIsLoading(true);
    try {
      const res = await sendStreamChatRequest({
        bot_id: '7482756583320666146',
        user_id: userId,
        additional_messages: [
          {
            role: 'user',
            content: '随机生成3种不同风格的小说概要，分别起一个小说名（标题中不要包含主题的字眼），用一段简短的文字介绍故事内容（用第二人称表达），并对主角（只能有一人）的姓名、身份、样貌和形象进行介绍。输出成如下的json格式：[{\"title\":\"\",\"description\":\"\",\"protagonist\":{\"name\":\"\",\"identity\":\"\",\"appearance\":\"\",\"image\":\"\"}}]，不要包含其他内容。',
            content_type: 'text',
          },
        ],
      });
      // const answerData = res.find((item) => item.type === 'answer');
      const answerData = res
      if (answerData) {
        const themesContent = JSON.parse(answerData);
        console.log(themesContent);
        const themes = await Promise.all(
          themesContent.map(async (theme) => {
            const imagePrompte = getCoverImagePrompt(
              theme.protagonist,
              theme.title,
              theme.description,
              '「2:3」'
            );
            const image = await fetchImage(imagePrompte);
            return {
              title: theme.title,
              description: theme.description,
              protagonist: {
                name: theme.protagonist.name,
                identity: theme.protagonist.identity,
                appearance: theme.protagonist.appearance,
              },
              image: image,
            };
          })
        );
        setThemes(themes);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
    setIsLoading(false);
  };

  const getStoryStartPrompt = (roleInfo, storyTitle, storyText) => {
    const prompt = `小说标题"${storyTitle}"。故事简介"${storyText}"，人物背景介绍：${roleInfo.name}, ${roleInfo.identity}, ${roleInfo.appearance}。`;
    return prompt;
  };

  const getStoryImagePrompt = (roleInfo, storyTitle, storyText, ratio) => {
    const prompt = `根据以下提示生成一张漫画，风格为「${isColorful ? '彩色' : '黑白'}动漫」，比例 「4:3」。故事画面介绍"${storyText}", 人物背景介绍：${roleInfo.name}, ${roleInfo.identity}, ${roleInfo.appearance}。`;
    return prompt;
  };

  const fetchStory = async (prompt) => {
    try {
      const res = await sendStreamChatRequest({
        bot_id: '7483919423419056154',
        user_id: userId + retryCount.toString(),
        additional_messages: [
          {
            role: 'user',
            content: prompt,
            content_type: 'text',
          },
        ],
      });
      // const answerData = res.find((item) => item.type === 'answer');
      const answerData = res
      if (answerData) {
        const content = JSON.parse(answerData)
        const storyContent = content['续写内容']
        const option1Text = content['选择一']
        const option2Text = content['选择二']
        const storyImagePrompt = getStoryImagePrompt(
          selectedTheme.protagonist,
          selectedTheme.title,
          storyContent,
          '「4:3」'
        );
        const story = {
          text: storyContent,
          image: await fetchImage(storyImagePrompt),
          options: [
            { id: 1, text: option1Text },
            { id: 2, text: option2Text },
          ],
        };
        setStoryList([...storyList, story]);
      }
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  // 根据大模型获取图片
  const fetchImage = async (prompt) => {
    try {
      const res = await sendStreamChatRequest({
        bot_id: '7483550781116104704',
        user_id: userId + Math.random().toString(36).substring(7),
        additional_messages: [
          {
            role: 'user',
            content: prompt,
            content_type: 'text',
          },
        ],
      });
      // const answerData = res.find((item) => item.type === 'answer');
      const answerData = res
      if (answerData) {
        const urlRegex = /(https?:\/\/[\w\d\._\-\/\?&=]+)/g;
        const match = answerData.match(urlRegex);
        console.log(match);
        if (match) {
          return match[0];
        }
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  useEffect(() => {
    setUserId(Math.random().toString(36).substring(7));
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchThemes();
  }, [userId]);

  useEffect(() => {
    if (!selectedTheme) return;
    handleSelectTheme(selectedTheme);
  }, [selectedTheme, retryCount]);

  // storyList 变化时，自动滚动到底部
  useEffect(() => {
    console.log('storyList changed, ', storyList);
    setTimeout(() => {
      document.documentElement.scrollTop = document.documentElement.scrollHeight - window.innerHeight
    }, 500)
  }, [storyList]);

  const handleSelectTheme = async (theme) => {
    setStoryList([]);
    setIsFetchingStory(true);
    try {
      const storyStartPrompt = getStoryStartPrompt(
        theme.protagonist,
        theme.title,
        theme.description
      );
      await fetchStory(storyStartPrompt);
    } catch (error) {
      console.error('Error fetching story based on selected theme:', error);
      // 可以在这里添加更多的错误处理逻辑，比如显示错误提示给用户
    } finally {
      setIsFetchingStory(false);
    }
  };

  const handleClickChoice = async (option, storyIndex) => {
    setIsFetchingStory(true);
    storyList[storyIndex].selectedOption = option;
    setStoryList([...storyList]);
    setTimeout(() => {
      document.documentElement.scrollTop = document.documentElement.scrollHeight - window.innerHeight
    }, 500)
    try {
      const res = await fetchStory(option.text);
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setIsFetchingStory(false);
    }
  };

  const handleRefetchStory = async (storyIndex) => {
    setIsFetchingStory(true);
    storyList.splice(storyIndex, 1);
    setStoryList([...storyList]);
    try {
      const res = await fetchStory(storyList[storyIndex - 1].text);
    } catch (error) {
      console.error('Error fetching story:', error);
    } finally {
      setIsFetchingStory(false);
    }
  };

  return (
    <>
      <div className='bg'></div>
      {
        selectedTheme && <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '-28px' }}>
          <button
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={() => {
              window.location.reload();
            }}
          >
            回到首页
          </button>
          <button
            style={{ fontSize: '12px', padding: '4px 8px' }}
            onClick={() => {
              setStoryList([]);
              setRetryCount(retryCount + 1);
            }}
          >
            点此重生
          </button>
        </Space>
      }
      <div style={{ width: '100%', height: '100%' }} id="storyListContainer">
        <h1>短漫的诞生</h1>
        {themes?.length > 0 && !selectedTheme && (
          <Space style={{ marginBottom: '1rem' }}>
            选择漫画主题，开启你的专属短漫{' '}
            <button
              style={{ fontSize: '12px', padding: '4px 8px' }}
              onClick={() => {
                setThemes([]);
                fetchThemes();
              }}
            >
              换一批
            </button>
          </Space>
        )}
        {!selectedTheme && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {themes.map((theme) => (
              <div
                key={theme.id}
                className="theme-card"
                style={{
                  width: 'calc(33.33% - 16px)',
                  height: 'auto',
                  aspectRatio: '2 / 3',
                  backgroundImage: `url(${theme.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
                onClick={() => setSelectedTheme(theme)}
              >
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: 8,
                    textAlign: 'left'
                  }}
                >
                  {theme.description}
                </p>
              </div>
            ))}
          </div>
        )}
        {selectedTheme && (
          <div>
            <Space style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '24px' }}>{selectedTheme.title}</span>
            </Space>
          </div>
        )}
        {storyList?.length > 0 && (
          <Space style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: '10px', width: "100%" }} >
            {storyList.map((story, storyIndex) => {
              if (storyIndex >= 1 && (!story.text || !story.image || !story.options.length)) {
                return <button key={storyIndex} style={{ fontSize: '12px', padding: '4px 8px', display: 'block', margin: '0 auto' }} onClick={() => handleRefetchStory(storyIndex)}>重试</button>
              }
              return (
                <div key={storyIndex}>
                  <Space style={{ alignItems: 'start' }}>
                    <Image src={story.image} width={600} preview={false} />
                    <Space
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        flex: 1,
                        minWidth: '500px'
                      }}
                    >

                      <Space><p style={{ textAlign: 'left', fontWeight: 600 }}>
                        第{storyIndex + 1}章:
                      </p>
                      </Space>
                      <p style={{ textAlign: 'left', fontSize: '16px' }}>
                        {story.text}
                      </p>
                      {story.options.map((option, optionIndex) => (
                        <button
                          style={{ maxWidth: '600px', fontSize: '14px' }}
                          className={story.selectedOption && story.selectedOption.id === option.id ? 'selected' : storyList[storyIndex].selectedOption ? 'disabled' : ''}
                          key={option.id}
                          onClick={() =>
                            handleClickChoice(option, storyIndex)
                          }
                        >
                          选择{optionIndex === 0 ? '一' : '二'}：{option.text}
                        </button>
                      ))}
                    </Space>
                  </Space>
                </div>
              );
            })}
          </Space>
        )}
      </div>
      {(isLoading || isFetchingStory) && (
        <Spin spinning={true} tip="疯狂画稿中...">
          <div style={{
            width: '100%',
            height: '200px',
            borderRadius: '20px', // 增加圆角半径
            marginTop: '20px',
            marginBottom: '100px',
          }}></div>
        </Spin>
      )}
    </>
  );
}

export default App;
