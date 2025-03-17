import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';
import { Card } from 'antd';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [story, setStory] = useState(null);

  const fetchThemes = async () => {
    try {
      const mockRes = [
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "{\"name\":\"baiduxiaoshuopaixingbang-baiduxiaoshuo_top_search\",\"arguments\":{\"category\":\"都市,玄幻,现代言情\"},\"plugin_id\":7369189469855023155,\"plugin_name\":\"baiduxiaoshuopaixingbang\",\"api_id\":7369189469855039539,\"api_name\":\"baiduxiaoshuo_top_search\",\"plugin_type\":1}",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215981,
            "id": "7482760656693788681",
            "role": "assistant",
            "type": "function_call",
            "updated_at": 1742215981
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "{\"error\":\"Response form is not json. Failed to parse: json: cannot unmarshal string into Go value of type map[string]interface {}\"}",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215984,
            "id": "7482760666344996873",
            "role": "assistant",
            "type": "tool_response",
            "updated_at": 1742215984
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "=====\n   - 主题 1：在繁华都市中，平凡青年偶得神秘系统，凭借智慧与勇气逆袭成商业传奇。\n   - 主题 2：少年误入玄幻世界，觉醒上古血脉，在诸强林立中踏上热血的逆天征程。\n   - 主题 3：现代职场上，性格迥异的男女从互看不顺眼到渐生情愫，谱出浪漫恋曲。\n=====",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215981,
            "id": "7482760656693772297",
            "reasoning_content": "",
            "role": "assistant",
            "type": "answer",
            "updated_at": 1742215988
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "{\"msg_type\":\"generate_answer_finish\",\"data\":\"{\\\"finish_reason\\\":0,\\\"FinData\\\":\\\"\\\"}\",\"from_module\":null,\"from_unit\":null}",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215990,
            "id": "7482760686448443442",
            "role": "assistant",
            "type": "verbose",
            "updated_at": 1742215990
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "写一篇主角获得神秘系统的热门小说大纲",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215990,
            "id": "7482760694429909001",
            "role": "assistant",
            "type": "follow_up",
            "updated_at": 1742215990
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "推荐一些主角逆袭成商业传奇的热门小说",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215990,
            "id": "7482760694429925385",
            "role": "assistant",
            "type": "follow_up",
            "updated_at": 1742215990
        },
        {
            "bot_id": "7482756583320666146",
            "chat_id": "7482760640977862682",
            "content": "有哪些小说网站可以找到热门小说？",
            "content_type": "text",
            "conversation_id": "7482760640977846298",
            "created_at": 1742215990,
            "id": "7482760694429941769",
            "role": "assistant",
            "type": "follow_up",
            "updated_at": 1742215990
        }
    ]
    // 根据mockRes的内容，提取出主题信息
    const answerData = mockRes.find(item => item.type === 'answer');
    if (answerData) {
      const themesContent = answerData.content;
      const themeLines = themesContent.split('\n').filter(line => line.includes('主题'));
      const themes = themeLines.map((line, index) => ({
        id: index + 1,
        name: line.trim().replace(`主题 ${index + 1}：`, '')
      }));
      setThemes(themes);
    } else {
      setThemes([]);
    }
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
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

  useEffect(() => {
    fetchThemes();
  }, []);

  return (
    <>
      <div>
        <h1>小说生成器</h1>
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
    </>
  );
}

export default App
