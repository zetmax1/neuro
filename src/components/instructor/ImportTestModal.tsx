import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Download, 
  X, 
  Loader2, 
  CheckCircle2, 
  FileUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importQuestions, downloadQuestionTemplate } from '@/api/instructor.api';
import { getApiErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';

interface ImportTestModalProps {
  topicId: number;
  topicName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportTestModal: React.FC<ImportTestModalProps> = ({
  topicId,
  topicName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel (.xlsx) or Word (.docx) file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await importQuestions(topicId, selectedFile);
      toast.success(res.detail || `Successfully imported questions into ${topicName}!`);
      setSelectedFile(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      // The backend lists problems per question (Y4, 2–4 options, one correct answer).
      const firstError = err.response?.data?.errors?.[0];
      const detail = getApiErrorMessage(err, "Failed to import questions. Please check the template format.");
      toast.error(firstError ? `${detail} Question ${firstError.question}: ${firstError.message}` : detail);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-6 relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Import Questions</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Topic: <strong className="text-slate-800">{topicName}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* English Import Rules Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs text-slate-700">
          <p className="font-semibold text-slate-900">Template Rules & Format:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 font-medium pl-0.5">
            <li>The <strong>first choice (Option 1)</strong> in your file MUST be the correct answer.</li>
            <li>Option choices are automatically <strong>shuffled</strong> when delivered to students.</li>
            <li>Supported formats: Excel (<strong>.xlsx</strong>, <strong>.csv</strong>) and Word (<strong>.docx</strong>, <strong>.txt</strong>).</li>
          </ul>
        </div>

        {/* Download Template Section */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            1. Download Template:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => downloadQuestionTemplate('excel').catch(() => toast.error('Failed to download template'))}
              className="gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold h-10 rounded-xl"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel Template (.xlsx)
              <Download className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => downloadQuestionTemplate('word').catch(() => toast.error('Failed to download template'))}
              className="gap-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold h-10 rounded-xl"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              Word Template (.docx)
              <Download className="w-3.5 h-3.5 ml-auto text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Upload File Drop Area */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            2. Select Completed File:
          </label>
          <label className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 transition-all text-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv, .docx, .doc, .txt" 
              onChange={handleFileChange}
              className="hidden" 
            />
            {selectedFile ? (
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-xs text-slate-400 font-normal">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700">Click to choose or drag Excel/Word file</p>
                <p className="text-[11px] text-slate-400">.xlsx, .csv, .docx, .txt supported</p>
              </div>
            )}
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isUploading} className="h-10 text-xs font-semibold rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl gap-2 shadow-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4" />
                Upload & Import Questions
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ImportTestModal;
