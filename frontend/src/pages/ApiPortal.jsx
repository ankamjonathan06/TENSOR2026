import { useState } from 'react';
import { HiOutlineKey, HiOutlineEye, HiOutlineEyeOff, HiOutlineClipboardCopy, HiOutlineTerminal } from 'react-icons/hi';
import './ApiPortal.css';

export default function ApiPortal() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey] = useState('az_prod_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="api-portal-page">
      <h1>API Portal Debug</h1>
    </div>
  );
}
