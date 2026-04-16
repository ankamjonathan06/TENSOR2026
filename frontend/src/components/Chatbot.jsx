import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane, HiOutlineSparkles } from 'react-icons/hi';
import './Chatbot.css';

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hello! I'm the AdaptZip Assistant. I can help you understand how our AI compression works, how to upload datasets, or explain the different algorithms. What can I help you with?",
  sender: 'bot'
};

const QUICK_REPLIES = [
  "What is AdaptZip?",
  "How does AI selection work?",
  "Supported formats?",
  "What is Fidelity Threshold?"
];

// Simple hardcoded intelligence
const getBotResponse = (msg) => {
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes('what is') && (lowerMsg.includes('adaptzip') || lowerMsg.includes('this'))) {
    return "AdaptZip is an AI-powered adaptive compression system. Instead of using one compression algorithm for an entire file, it analyzes each column independently and uses Machine Learning to pick the absolute best algorithm (like ZFP, SZ3, or Huffman) for that specific data type!";
  }
  if (lowerMsg.includes('ai selection') || lowerMsg.includes('how does ai work') || lowerMsg.includes('machine learning')) {
    return "Our AI selection works by profiling your dataset first. It checks each column for its data type, entropy, and sparsity. Then, our heuristic ML model scores different algorithms against these stats to choose the one that maximizes compression ratio while respecting your fidelity threshold.";
  }
  if (lowerMsg.includes('format') || lowerMsg.includes('support')) {
    return "We currently support tabular and multidimensional scientific datasets. You can upload files in CSV (.csv), HDF5 (.h5, .hdf5), or NetCDF (.nc, .netcdf) formats up to 500 MB in size.";
  }
  if (lowerMsg.includes('fidelity') || lowerMsg.includes('threshold') || lowerMsg.includes('rmse')) {
    return "The Fidelity Threshold (measured as RMSE, Root Mean Square Error) restricts how much error is allowed during lossy compression. Setting it to a lower number (like 0.0001) guarantees higher accuracy upon reconstruction, while a higher number allows more aggressive compression.";
  }
  if (lowerMsg.includes('upload') || lowerMsg.includes('how to')) {
    return "You can upload a dataset by clicking the 'Upload Dataset' button on the Dashboard or navigating to the 'Compress' page using the sidebar. Just drag and drop your file and hit 'Start Compression'!";
  }

  if (lowerMsg.includes('what algorithm') || lowerMsg.includes('why')) {
    return "Our engine assigns Algorithms dynamically based on column profiles! For Continuous data (like floats), we use ZFP. For Categorical data, we pair Huffman with RLE. For Sparse arrays, we prepend Bitshuffle before BLOSC. For Sequential/Timestamps, we use Delta encoding + ZSTD. All chosen by the heuristic net!";
  }

  // Fallback
  return "That's a great question! While my knowledge is currently focused on AdaptZip's core features (AI Selection, Supported Formats, Algorithms), I recommend trying a Demo Dataset on the Compress page to see the engine in action!";
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate network/thinking delay
    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend(inputValue);
    }
  };

  return (
    <div className="chatbot-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-header-info">
                <div className="chatbot-bot-icon">
                  <HiOutlineSparkles />
                </div>
                <div>
                  <div className="chatbot-title">AdaptZip Assistant</div>
                  <div className="chatbot-subtitle">Online</div>
                </div>
              </div>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                <HiOutlineX />
              </button>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat-bubble-typing">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chatbot-input-area">
              <div className="chatbot-quick-replies">
                {QUICK_REPLIES.map((reply, i) => (
                  <button 
                    key={i} 
                    className="quick-reply-btn"
                    onClick={() => handleSend(reply)}
                    disabled={isTyping}
                  >
                    {reply}
                  </button>
                ))}
              </div>
              
              <div className="chatbot-input-form">
                <input 
                  type="text" 
                  placeholder="Ask a question..." 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <button 
                  onClick={() => handleSend(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <HiOutlineX /> : <HiOutlineChat />}
      </motion.button>
    </div>
  );
}
