import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane, HiOutlineSparkles } from 'react-icons/hi';
import './Chatbot.css';

const DICTIONARY = {
  en: {
    langName: "English",
    title: "AdaptZip Assistant",
    subtitle: "Online",
    placeholder: "Ask a question...",
    initialMsg: "Hello! I'm the AdaptZip Assistant. I can help you understand how our AI compression works, how to upload datasets, or explain the different algorithms. What can I help you with?",
    quickReplies: [
      "What is AdaptZip?",
      "How does AI selection work?",
      "Supported formats?",
      "What is Fidelity Threshold?"
    ],
    responses: {
      "What is AdaptZip?": "AdaptZip is an AI-powered adaptive compression system. Instead of using one compression algorithm for an entire file, it analyzes each column independently and uses Machine Learning to pick the absolute best algorithm (like ZFP, SZ3, or Huffman) for that specific data type!",
      "How does AI selection work?": "Our AI selection works by profiling your dataset first. It checks each column for its data type, entropy, and sparsity. Then, our heuristic ML model scores different algorithms against these stats to choose the one that maximizes compression ratio while respecting your fidelity threshold.",
      "Supported formats?": "We currently support tabular and multidimensional scientific datasets. You can upload files in CSV (.csv), HDF5 (.h5, .hdf5), or NetCDF (.nc, .netcdf)",
      "What is Fidelity Threshold?": "The Fidelity Threshold (measured as RMSE) restricts how much error is allowed during lossy compression. Setting it to a lower number guarantees higher accuracy upon reconstruction, while a higher number allows more aggressive compression."
    },
    fallback: "That's a great question! While my knowledge is currently focused on AdaptZip's core features, I recommend trying a Demo Dataset on the Compress page to see the engine in action!"
  },
  ta: {
    langName: "தமிழ்",
    title: "AdaptZip உதவியாளர்",
    subtitle: "ஆன்லைனில்",
    placeholder: "ஒரு கேள்வியைக் கேளுங்கள்...",
    initialMsg: "வணக்கம்! நான் AdaptZip உதவியாளர். AI சுருக்கம் எவ்வாறு செயல்படுகிறது என்பதைப் புரிந்துகொள்ள நான் உங்களுக்கு உதவ முடியும். நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    quickReplies: [
      "AdaptZip என்றால் என்ன?",
      "AI தேர்வு எவ்வாறு செயல்படுகிறது?",
      "ஆதரிக்கப்படும் வடிவங்கள்?",
      "Fidelity Threshold என்றால் என்ன?"
    ],
    responses: {
      "AdaptZip என்றால் என்ன?": "AdaptZip என்பது AI அறிவ திறன் கொண்ட அடாப்டிவ் கம்ப்ரஷன் அமைப்பாகும். இது ஒவ்வொரு நிரலையும் தனித்தனியாகப் பகுப்பாய்வு செய்து, சிறந்த அல்காரிதத்தை (ZFP, Huffman) தேர்ந்தெடுக்க இயந்திர கற்றலைப் பயன்படுத்துகிறது!",
      "AI தேர்வு எவ்வாறு செயல்படுகிறது?": "எங்கள் AI உங்கள் தரவுத்தொகுப்பை ആദ്യം சுயவிவரப்படுத்துவதன் மூலம் செயல்படுகிறது. பின்னர், இது சிறந்த சுருக்க விகிதத்தை அதிகப்படுத்தும் அல்காரிதத்தைத் தேர்ந்தெடுக்கிறது.",
      "ஆதரிக்கப்படும் வடிவங்கள்?": "நாங்கள் தற்போது CSV (.csv), HDF5 (.h5) மற்றும் NetCDF (.nc) தரவுத்தொகுப்புகளை ஆதரிக்கிறோம்.",
      "Fidelity Threshold என்றால் என்ன?": "Fidelity Threshold என்பது சுருக்கத்தின் போது எவ்வளவு பிழை அனுமதிக்கப்படுகிறது என்பதைக் கட்டுப்படுத்துகிறது. குறைந்த எண் அதிக துல்லியத்திற்கு உத்தரவாதம் அளிக்கிறது."
    },
    fallback: "நல்ல கேள்வி! எனது அறிவு தற்போது AdaptZip இன் முக்கிய அம்சங்களில் மட்டுமே உள்ளது. தயவுசெய்து ஒரு டெமோவை முயற்சிக்கவும்!"
  },
  ml: {
    langName: "മലയാളം",
    title: "AdaptZip അസിസ്റ്റന്റ്",
    subtitle: "ഓൺലൈനിൽ",
    placeholder: "ഒരു ചോദ്യം ചോദിക്കുക...",
    initialMsg: "നമസ്കാരം! ഞാൻ AdaptZip അസിസ്റ്റന്റ് ആണ്. നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
    quickReplies: [
      "എന്താണ് AdaptZip?",
      "AI തിരഞ്ഞെടുപ്പ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
      "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ?",
      "എന്താണ് Fidelity Threshold?"
    ],
    responses: {
      "എന്താണ് AdaptZip?": "AdaptZip ഒരു AI അധിഷ്ഠിത കംപ്രഷൻ സിസ്റ്റമാണ്. ഓരോ നിരയും സ്വതന്ത്രമായി വിശകലനം ചെയ്ത് മികച്ച അൽഗോരിതം തിരഞ്ഞെടുക്കാൻ ഇത് മെഷീൻ ലേണിംഗ് ഉപയോഗിക്കുന്നു.",
      "AI തിരഞ്ഞെടുപ്പ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?": "ഞങ്ങളുടെ AI നിങ്ങളുടെ ഡാറ്റാസെറ്റ് ആദ്യം പരിശോധിക്കുന്നു. ഡാറ്റയുടെ സ്വഭാവം മനസ്സിലാക്കി ഏറ്റവും അനുയോജ്യമായ അൽഗോരിതം അത് കണ്ടെത്തുന്നു.",
      "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ?": "ഞങ്ങൾ നിലവിൽ CSV, HDF5, NetCDF ഫോർമാറ്റുകൾ പിന്തുണയ്ക്കുന്നു.",
      "എന്താണ് Fidelity Threshold?": "കമ്പ്രഷൻ സമയത്ത് ഡാറ്റയിൽ എത്രമാത്രം മാറ്റം വരാം എന്ന് തീരുമാനിക്കുന്നത് ഫിഡെലിറ്റി ത്രെഷോൾഡ് ആണ്."
    },
    fallback: "നല്ല ചോദ്യം! ദയവായി ഞങ്ങളുടെ ഡെമോ പേജ് സന്ദർശിക്കുക!"
  },
  te: {
    langName: "తెలుగు",
    title: "AdaptZip అసిస్టెంట్",
    subtitle: "ఆన్‌లైన్",
    placeholder: "ఒక ప్రశ్న అడగండి...",
    initialMsg: "నమస్కారం! నేను AdaptZip అసిస్టెంట్‌ని. AI కంప్రెషన్ గురించి నేను మీకు సహాయం చేయగలను. మీకేం కావాలి?",
    quickReplies: [
      "AdaptZip అంటే ఏమిటి?",
      "AI ఎంపిక ఎలా పనిచేస్తుంది?",
      "మద్దతు ఉన్న ఫార్మాట్‌లు?",
      "ఫిడెలిటీ థ్రెషోల్డ్ అంటే ఏమిటి?"
    ],
    responses: {
      "AdaptZip అంటే ఏమిటి?": "AdaptZip ఒక AI ఆధారిత కంప్రెషన్ సిస్టమ్. మొత్తం ఫైల్‌కి ఒకే పద్ధతి వాడే బదులు, ఇది ప్రతి విభాగాన్ని వేరుగా విశ్లేషించి సరైన అల్గోరిథం ఎంచుకుంటుంది.",
      "AI ఎంపిక ఎలా పనిచేస్తుంది?": "మా AI ముందుగా మీ డేటాను ప్రొఫైల్ చేస్తుంది. తరువాత మెరుగైన కంప్రెషన్ కోసం సరైన అల్గోరిథంను ఎంచుకుంటుంది.",
      "మద్దతు ఉన్న ఫార్మాట్‌లు?": "మేము ప్రస్తుతం CSV, HDF5, మరియు NetCDF ఫైల్స్ ని సపోర్ట్ చేస్తాము.",
      "ఫిడెలిటీ థ్రెషోల్డ్ అంటే ఏమిటి?": "కంప్రెషన్ చేసేటప్పుడు డేటాలో ఎంత మార్పును అనుమతించాలో ఇది నిర్దేశిస్తుంది."
    },
    fallback: "మంచి ప్రశ్న! నా పరిజ్ఞానం ప్రస్తుతం పరిమితం. మరింత సమాచారం కోసం డెమోని ప్రయత్నించండి."
  },
  hi: {
    langName: "हिन्दी",
    title: "AdaptZip सहायक",
    subtitle: "ऑनलाइन",
    placeholder: "एक प्रश्न पूछें...",
    initialMsg: "नमस्ते! मैं AdaptZip सहायक हूँ। मैं आपको यह समझने में मदद कर सकता हूँ कि हमारा AI संपीड़न कैसे काम करता है। मैं आपकी क्या मदद कर सकता हूँ?",
    quickReplies: [
      "AdaptZip क्या है?",
      "AI चयन कैसे काम करता है?",
      "समर्थित प्रारूप?",
      "फिडेलिटी थ्रेशोल्ड क्या है?"
    ],
    responses: {
      "AdaptZip क्या है?": "AdaptZip एक AI-संचालित संपीड़न प्रणाली है। पूरे फ़ाइल के लिए एक ही एल्गोरिदम का उपयोग करने के बजाय, यह मशीन लर्निंग का उपयोग करके सबसे अच्छे एल्गोरिदम का चयन करता है।",
      "AI चयन कैसे काम करता है?": "हमारा AI आपके डेटासेट को प्रोफाइल करके काम करता है। फिर यह संपीड़न अनुपात को अधिकतम करने के लिए सही एल्गोरिदम चुनता है।",
      "समर्थित प्रारूप?": "हम वर्तमान में CSV, HDF5 और NetCDF प्रारूप का समर्थन करते हैं।",
      "फिडेलिटी थ्रेशोल्ड क्या है?": "फिडेलिटी थ्रेशोल्ड यह सीमित करता है कि संपीड़न के दौरान कितनी त्रुटि की अनुमति है।"
    },
    fallback: "यह एक बढ़िया सवाल है! अधिक जानने के लिए कृपया हमारा डेमो आज़माएं।"
  }
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const dict = DICTIONARY[lang];

  const [messages, setMessages] = useState([
    { id: 1, text: dict.initialMsg, sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // When language changes, reset the conversation to the new language
  const handleLangChange = (newLang) => {
    setLang(newLang);
    setMessages([
      { id: Date.now(), text: DICTIONARY[newLang].initialMsg, sender: 'bot' }
    ]);
  };

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
      // Very basic keyword intelligence or exact match based on language dictionary
      let botResponse = dict.fallback;
      
      // Check for exact quick reply matches
      if (dict.responses[text]) {
        botResponse = dict.responses[text];
      } else {
        // Fallback for English text roughly
        if (lang === 'en') {
          const lowerMsg = text.toLowerCase();
          if (lowerMsg.includes('adaptzip')) botResponse = dict.responses["What is AdaptZip?"];
          else if (lowerMsg.includes('ai')) botResponse = dict.responses["How does AI selection work?"];
          else if (lowerMsg.includes('format')) botResponse = dict.responses["Supported formats?"];
          else if (lowerMsg.includes('fidelity')) botResponse = dict.responses["What is Fidelity Threshold?"];
        }
      }

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
                  <div className="chatbot-title">{dict.title}</div>
                  <div className="chatbot-subtitle">{dict.subtitle}</div>
                </div>
              </div>
              <div className="chatbot-header-actions">
                <select 
                  className="chatbot-lang-select" 
                  value={lang} 
                  onChange={(e) => handleLangChange(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="ml">മലയാളം</option>
                  <option value="te">తెలుగు</option>
                  <option value="hi">हिन्दी</option>
                </select>
                <button className="chatbot-close" onClick={() => setIsOpen(false)}>
                  <HiOutlineX />
                </button>
              </div>
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
                {dict.quickReplies.map((reply, i) => (
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
                  placeholder={dict.placeholder} 
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
