import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";
import { DocumentUpload } from "./DocumentUpload";

interface ChatbotFormProps {
  chatbotId?: Id<"chatbots"> | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function ChatbotForm({ chatbotId, onSuccess, onCancel }: ChatbotFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [trainingData, setTrainingData] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "training" | "documents">("basic");

  const createChatbot = useMutation(api.chatbots.create);
  const updateChatbot = useMutation(api.chatbots.update);
  const existingChatbot = useQuery(
    api.chatbots.get,
    chatbotId ? { id: chatbotId } : "skip"
  );

  useEffect(() => {
    if (existingChatbot) {
      setName(existingChatbot.name);
      setDescription(existingChatbot.description || "");
      setInstructions(existingChatbot.instructions || "");
      // setTrainingData(existingChatbot.trainingData || ""); // trainingData not in schema
    }
  }, [existingChatbot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !instructions.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (chatbotId) {
        await updateChatbot({
          id: chatbotId,
          name: name.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim(),
        });
        toast.success("Chatbot updated successfully!");
      } else {
        await createChatbot({
          name: name.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim(),
        });
        toast.success("Chatbot created successfully!");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save chatbot");
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: "⚙️" },
    { id: "training", label: "Training Data", icon: "📝" },
    { id: "documents", label: "Documents", icon: "📄" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {chatbotId ? "Edit Chatbot" : "Create New Chatbot"}
          </h2>
          <p className="text-gray-600 mt-2">
            {chatbotId 
              ? "Update your chatbot's configuration and training data"
              : "Set up your AI chatbot with custom instructions and training data"
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "basic" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chatbot Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Customer Support Bot"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your chatbot's purpose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions *
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide detailed instructions for how your chatbot should behave, respond to users, and handle different scenarios..."
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Be specific about the chatbot's personality, tone, and how it should handle different types of questions.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("training")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Next: Training Data
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  {chatbotId ? "Update Chatbot" : "Create Chatbot"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "training" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Data
                </label>
                <textarea
                  value={trainingData}
                  onChange={(e) => setTrainingData(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any specific information, FAQs, product details, or knowledge that your chatbot should know about..."
                />
                <p className="text-sm text-gray-600 mt-2">
                  This data will be used to train your chatbot. Include FAQs, product information, company policies, or any other relevant content.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back: Basic Info
                </button>
                <div className="space-x-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab("documents")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Next: Documents
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    {chatbotId ? "Update Chatbot" : "Create Chatbot"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && chatbotId && (
            <div className="space-y-6">
              <DocumentUpload chatbotId={chatbotId} />
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("training")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back: Training Data
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Update Chatbot
                </button>
              </div>
            </div>
          )}

          {activeTab === "documents" && !chatbotId && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Upload Available After Creation</h3>
              <p className="text-gray-600 mb-6">
                Create your chatbot first, then you can upload PDF and DOCX files to enhance its knowledge.
              </p>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("training")}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back: Training Data
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Chatbot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
