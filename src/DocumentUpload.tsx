import { useState, useRef } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { toast } from "sonner";

interface DocumentUploadProps {
  chatbotId: Id<"chatbots">;
}

export function DocumentUpload({ chatbotId }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const documents = useQuery(api.documents.getDocuments, { chatbotId }) || [];
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const saveDocument = useMutation(api.documents.saveDocument);
  const deleteDocument = useMutation(api.documents.deleteDocument);
  const processDocument = useAction(api.documents.processDocument);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload only PDF or DOCX files");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const responseData = await result.json();
      if (!responseData.storageId) {
        throw new Error("No storage ID returned from upload");
      }

      const { storageId } = responseData;

      // Step 3: Save document metadata
      const documentId = await saveDocument({
        chatbotId,
        storageId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!documentId) {
        throw new Error("Failed to save document metadata");
      }

      // Step 4: Process document (don't await to avoid blocking UI)
      processDocument({ documentId }).catch((error) => {
        console.error("Document processing failed:", error);
        // The document is still saved, just processing failed
      });

      toast.success("Document uploaded successfully! Processing in background...");
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to upload document: ${errorMessage}`);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: Id<"documents">) => {
    try {
      await deleteDocument({ documentId });
      toast.success("Document deleted successfully");
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    return '📄';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'processed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Documents</h3>
        <p className="text-gray-600 text-sm">
          Upload PDF or DOCX files to train your chatbot with additional knowledge.
        </p>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? "Uploading..." : "Upload Documents"}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop or click to select PDF or DOCX files (max 10MB)
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploading ? "Processing..." : "Choose Files"}
          </button>
        </div>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon("document")}</span>
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Document</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        completed
                      </span>
                      <span>{new Date(doc._creationTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📚</div>
          <p>No documents uploaded yet</p>
          <p className="text-sm">Upload PDF or DOCX files to enhance your chatbot's knowledge</p>
        </div>
      )}
    </div>
  );
}
