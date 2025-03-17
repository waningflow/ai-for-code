import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';

function App() {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [story, setStory] = useState(null);

  const fetchThemes = async () => {
    try {
      const response = await axios.get('https://example.com/api/themes');
      setThemes(response.data);
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  };

  const fetchStory = async (theme) => {
    try {
      const response = await axios.get(`https://example.com/api/story?theme=${theme}`);
      setStory(response.data);
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
            <ul>
              {themes.map((theme) => (
                <li key={theme.id} onClick={() => setSelectedTheme(theme)}>
                  {theme.name}
                </li>
              ))}
            </ul>
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
