import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. Ask me anything about your exam schedule!" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-ai", {
        body: { message: userMessage, messages },
      });

      if (error) throw error;

      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast.error("Failed to get response from AI");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 z-50"
          >
            <Card className="glass-card shadow-elevated">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScrollArea className="h-80 pr-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce delay-100"></div>
                            <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about your schedule..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full gradient-primary shadow-elevated"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>
    </>
  );
};

export default ChatWidget;
