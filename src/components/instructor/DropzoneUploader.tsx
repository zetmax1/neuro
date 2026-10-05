import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2, AlertTriangle, Link2, Clock } from 'lucide-react';
import { createResource, TopicResource } from '@/api/instructor.api';
import { toast } from 'sonner';
import { getApiErrorMessage } from "@/lib/apiError";

interface DropzoneUploaderProps {
  topicId: number;
  onSuccess?: () => void;
  existingResources?: TopicResource[];
}

const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

export const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({ 
  topicId, 
  onSuccess,
  existingResources = []
}) => {
  const currentCount = existingResources.length;

  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrorMsg(null);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const onDropRejected = useCallback((fileRejections: unknown[]) => {
    setFile(null);
    if (fileRejections.length > 0) {
      const error = (fileRejections[0] as { errors: { code?: string; message?: string }[] }).errors[0];
      if (error.code === 'file-too-large') {
        setErrorMsg('File exceeds the 50MB limit');
      } else if (error.code === 'too-many-files') {
        setErrorMsg('Too many files');
      } else if (error.code === 'file-invalid-type') {
        setErrorMsg('Invalid file type. Supported formats: PDF, MP4, MKV');
      } else {
        setErrorMsg(error.message || 'File upload rejected');
      }
    }
  }, []);

  const remainingSlots = Math.max(0, 5 - currentCount);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxSize: 52428800, // 50MB in bytes
    maxFiles: remainingSlots || 1,
    accept: {
      'application/pdf': ['.pdf'],
      'video/*': ['.mp4', '.mkv', '.avi'],
    }
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('topic', topicId.toString());
      formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
      formData.append('resource_type', file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT');
      formData.append('file', file);
      formData.append('duration_minutes', durationMinutes.toString());
      
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      await createResource(formData);
      clearInterval(interval);
      setProgress(100);
      
      toast.success('Resource uploaded successfully');
      setFile(null);
      setDurationMinutes(10);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to upload resource'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);

    if (!linkTitle.trim()) {
      setLinkError('Resource Title is required');
      return;
    }
    if (!linkUrl.trim()) {
      setLinkError('External URL is required');
      return;
    }
    if (!isValidUrl(linkUrl.trim())) {
      setLinkError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setUploading(true);
    setProgress(20);
    try {
      const formData = new FormData();
      formData.append('topic', topicId.toString());
      formData.append('title', linkTitle.trim());
      formData.append('resource_type', 'VIDEO');
      formData.append('external_url', linkUrl.trim());
      formData.append('duration_minutes', durationMinutes.toString());

      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      await createResource(formData);
      clearInterval(interval);
      setProgress(100);

      toast.success('Link resource saved successfully');
      setLinkTitle('');
      setLinkUrl('');
      setDurationMinutes(10);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to save link resource'));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleTabChange = (tab: 'file' | 'link') => {
    setActiveTab(tab);
    setErrorMsg(null);
    setLinkError(null);
  };

  if (currentCount >= 5) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900 font-sans">Maximum capacity reached</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed font-sans">
            A topic can have a maximum of 5 resources. Please delete an existing resource to add a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Tab/Toggle for External Links */}
      <div className="flex border-b border-slate-100 pb-px">
        <button
          type="button"
          onClick={() => handleTabChange('file')}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
            activeTab === 'file'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          disabled={uploading}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('link')}
          className={`flex-1 pb-2.5 text-xs font-bold border-b-2 text-center transition-colors ${
            activeTab === 'link'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          disabled={uploading}
        >
          Embed YouTube Link
        </button>
      </div>

      {activeTab === 'file' ? (
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-500/5' 
                : 'border-slate-200 hover:border-indigo-500 hover:bg-slate-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-slate-100 rounded-full text-slate-500">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="text-xs text-slate-400">
                Max 50MB per file. Supported formats: PDF, MP4, MKV.
              </p>
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-500 font-semibold mt-1">{errorMsg}</p>
          )}

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!uploading && (
                    <button 
                      type="button"
                      onClick={() => setFile(null)} 
                      className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="fileDuration" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Estimated Duration (Minutes)
                </label>
                <input
                  id="fileDuration"
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-800"
                  disabled={uploading}
                />
              </div>
            </div>
          )}

          {file && !uploading && (
            <button 
              onClick={handleUpload}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 py-2 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Confirm and Upload
            </button>
          )}
        </div>
      ) : (
        /* Tab 2: The YouTube/External Link View */
        <form onSubmit={handleSaveLink} className="space-y-4">
          <div>
            <label htmlFor="linkTitle" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resource Title
            </label>
            <input
              id="linkTitle"
              type="text"
              value={linkTitle}
              onChange={(e) => {
                setLinkTitle(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="e.g. YouTube Video Guide"
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder:text-slate-400 text-slate-800"
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="linkUrl" className="block text-xs font-semibold text-slate-700 mb-1.5">
              External URL
            </label>
            <input
              id="linkUrl"
              type="url"
              value={linkUrl}
              onChange={(e) => {
                setLinkUrl(e.target.value);
                if (linkError) setLinkError(null);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder:text-slate-400 text-slate-800"
              disabled={uploading}
            />
          </div>

          <div>
            <label htmlFor="linkDuration" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Duration (Minutes)
            </label>
            <input
              id="linkDuration"
              type="number"
              min="1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-800"
              disabled={uploading}
            />
          </div>

          {linkError && (
            <p className="text-xs text-red-500 font-semibold">{linkError}</p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4 py-2 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              'Save Link'
            )}
          </button>
        </form>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              {activeTab === 'file' ? 'Uploading large media resource...' : 'Saving external link...'}
            </span>
            <span className="text-slate-700">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DropzoneUploader;
