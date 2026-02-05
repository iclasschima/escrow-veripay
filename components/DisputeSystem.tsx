'use client';

import { useState } from 'react';
import { Transaction } from '@/types';
import { useTransactionStore } from '@/store/transactionStore';
import { AlertTriangle, Upload, MessageSquare, Image as ImageIcon } from 'lucide-react';

interface DisputeSystemProps {
  transaction: Transaction;
  userRole: 'buyer' | 'seller';
}

export default function DisputeSystem({
  transaction,
  userRole,
}: DisputeSystemProps) {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);

  const disputeTransaction = useTransactionStore((state) => state.disputeTransaction);
  const addEvidence = useTransactionStore((state) => state.addEvidence);
  const addChatMessage = useTransactionStore((state) => state.addChatMessage);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidenceFiles([...evidenceFiles, ...files]);

    // In production, upload to storage and get URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate upload - in production, use actual storage service
        const evidenceUrl = URL.createObjectURL(file);
        addEvidence(transaction.id, evidenceUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitDispute = () => {
    if (!disputeReason.trim()) return;

    disputeTransaction(transaction.id, disputeReason);
    setShowDisputeForm(false);
    setDisputeReason('');
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    addChatMessage(transaction.id, {
      id: `msg_${Date.now()}`,
      sender: userRole,
      message: chatMessage,
      timestamp: new Date(),
    });

    setChatMessage('');
  };

  if (transaction.isDisputed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="text-orange-600" size={24} />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Transaction Disputed
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {transaction.disputeReason}
            </p>

            {transaction.evidence.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Evidence Submitted
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {transaction.evidence.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={18} />
              {showChat ? 'Hide' : 'Show'} Chat Logs
            </button>

            {showChat && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {transaction.chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === userRole ? 'justify-end' : 'justify-start'
                        }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${msg.sender === userRole
                            ? 'bg-purple-600 text-white'
                            : msg.sender === 'system'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Dispute & Evidence
        </h3>
        <button
          onClick={() => setShowDisputeForm(!showDisputeForm)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <AlertTriangle size={18} />
          Raise Dispute
        </button>
      </div>

      {showDisputeForm && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-3">
            Freeze Transaction
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Dispute
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                rows={3}
                placeholder="Describe the issue (wrong item, damaged goods, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Evidence
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">
                    Click to upload photos
                  </span>
                  <span className="text-xs text-gray-500">
                    Wrong item, damaged goods, etc.
                  </span>
                </label>
              </div>

              {evidenceFiles.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {evidenceFiles.map((file, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700 flex items-center gap-1"
                    >
                      <ImageIcon size={14} />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmitDispute}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Freeze Transaction
              </button>
              <button
                onClick={() => {
                  setShowDisputeForm(false);
                  setDisputeReason('');
                  setEvidenceFiles([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {transaction.evidence.length > 0 && !transaction.isDisputed && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Evidence Locker
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {transaction.evidence.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Evidence ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
