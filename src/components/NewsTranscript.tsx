import React from 'react';
import { DebateMessage } from '@/types/debate';
import { motion } from 'framer-motion';

interface NewsTranscriptProps {
  messages: DebateMessage[];
}

const NewsTranscript = ({ messages }: NewsTranscriptProps) => {
  return (
    <div className="w-full">
      <div className="space-y-4 max-h-[400px] overflow-y-auto px-4">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {[...messages].reverse().map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${message.character === 1 ? 'justify-start' : 'justify-end'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div
                className={`max-w-[80%] ${
                  message.character === 1
                    ? 'bg-blue-100 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                    : 'bg-green-100 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
                } p-4 shadow-sm`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  message.character === 1 ? 'text-blue-700' : 'text-green-700'
                }`}>
                  {message?.characterName || `Character ${message.character}`}
                </div>
                <p className="text-sm text-gray-800">{message.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsTranscript; 