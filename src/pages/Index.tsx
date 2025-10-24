import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mb-6"
          >
            <Calendar className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Smart Exam Scheduling
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            AI-powered exam scheduling system that eliminates conflicts and optimizes resource allocation
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="gradient-primary text-lg px-8 py-6 gap-2"
            >
              Get Started
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 shadow-glass rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-muted-foreground">
                Advanced algorithms optimize schedules while respecting all constraints
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6 shadow-glass rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Live synchronization ensures everyone sees the latest schedule
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-6 shadow-glass rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Conflict-Free</h3>
              <p className="text-muted-foreground">
                Automatically detects and prevents scheduling conflicts
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
