
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Copy, Check, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function IceBreakerModal({ profile, isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [iceBreaker, setIceBreaker] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (isOpen && profile) {
      generateIceBreaker();
    }
    
    return () => {
      setIceBreaker("");
    };
  }, [isOpen, profile]);

  const generateIceBreaker = async () => {
    setIsLoading(true);
    setIceBreaker("");

    try {
      const user = await base44.auth.me();
      const userLanguage = user?.language || 'en';

      const conversation = await base44.agents.createConversation({
        agent_name: "ice_breaker",
        metadata: { name: `Ice breaker for ${profile.name}`, profile_id: profile.id }
      });

      let prompt = `Please create personalized ice breaker messages for connecting with this person.\n`;
      prompt += `IMPORTANT: Write all messages in the language code: ${userLanguage}\n\n`;
      prompt += `**Name:** ${profile.name}\n`;
      if (profile.title) prompt += `**Title:** ${profile.title}\n`;
      if (profile.company) prompt += `**Company:** ${profile.company}\n`;
      if (profile.location) prompt += `**Location:** ${profile.location}\n`;
      if (profile.notes) prompt += `**Additional Context:** ${profile.notes}\n`;
      prompt += `\nPlease provide 3 different ice breaker message options in ${userLanguage}.`;

      const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
        const assistantMessages = data.messages.filter(m => m.role === 'assistant');
        if (assistantMessages.length > 0) {
          const latestMessage = assistantMessages[assistantMessages.length - 1];
          setIceBreaker(latestMessage.content || "");
          if (latestMessage.content && !data.is_streaming) setIsLoading(false);
        }
      });

      await base44.agents.addMessage(conversation, { role: "user", content: prompt });

      setTimeout(() => {
        unsubscribe();
        if (isLoading) setIsLoading(false);
      }, 30000);
    } catch (error) {
      console.error("Error generating ice breaker:", error);
      setIceBreaker("Sorry, I couldn't generate an ice breaker message. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const extractMessages = () => {
    if (!iceBreaker) return [];
    const messages = [];
    const sections = iceBreaker.split(/\*\*(Short|Medium|Detailed) Message/i);
    for (let i = 1; i < sections.length; i += 2) {
      const type = sections[i];
      const content = sections[i + 1]?.replace(/^\s*\*\*?\s*/, '').trim();
      if (content) messages.push({ type, content });
    }
    return messages;
  };

  const messages = extractMessages();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Ice Breaker Messages
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Personalized messages for {profile?.name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={generateIceBreaker} disabled={isLoading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4">
          {isLoading && !iceBreaker ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-0 animate-pulse" />
              </div>
              <p className="text-gray-600 text-center">Crafting personalized messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {msg.type} Message
                    </h3>
                    <Button variant="outline" size="sm" onClick={() => handleCopyMessage(msg.content, index)} className="gap-2">
                      {copiedIndex === index ? (
                        <><Check className="w-4 h-4 text-green-600" />Copied!</>
                      ) : (
                        <><Copy className="w-4 h-4" />Copy</>
                      )}
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-gray-700 leading-relaxed">
                    <ReactMarkdown components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : iceBreaker ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">AI-Generated Ice Breaker</h3>
                {isLoading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin ml-2" />}
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{iceBreaker}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No messages available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
