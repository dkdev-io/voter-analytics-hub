
import { OpenAIChat } from '@/components/ai-chat/OpenAIChat';

const AIChat = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>
      <OpenAIChat />
    </div>
  );
};

export default AIChat;
