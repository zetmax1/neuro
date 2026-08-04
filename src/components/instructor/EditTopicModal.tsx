import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateTopic, deleteTopic, TopicResponse, TopicPayload } from '@/api/instructor.api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, X, Save, Trash2, Edit3 } from 'lucide-react';

const topicSchema = z.object({
  name: z.string().min(2, "Module title must be at least 2 characters"),
  description: z.string().optional().default(""),
  parent: z.preprocess(
    (val) => (val === "" || val === "null" || val === null || val === undefined ? null : Number(val)),
    z.number().nullable()
  ).default(null),
  pass_mark_percentage: z.preprocess(
    (val) => (val === "" || val === undefined ? 60 : Number(val)),
    z.number().min(1).max(100)
  ).default(60),
  test_question_count: z.preprocess(
    (val) => (val === "" || val === undefined ? 10 : Number(val)),
    z.number().min(1).max(100)
  ).default(10),
});

type TopicFormValues = z.infer<typeof topicSchema>;

interface EditTopicModalProps {
  topic: TopicResponse | null;
  allTopics: TopicResponse[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTopicModal: React.FC<EditTopicModalProps> = ({
  topic,
  allTopics,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
  });

  useEffect(() => {
    if (topic) {
      reset({
        name: topic.name,
        description: topic.description || "",
        parent: topic.parent,
        pass_mark_percentage: (topic as any).pass_mark_percentage || 60,
        test_question_count: (topic as any).test_question_count || 10,
      });
    }
  }, [topic, reset]);

  if (!isOpen || !topic) return null;

  const handleSave = async (values: TopicFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<TopicPayload> = {
        name: values.name,
        description: values.description,
        parent: values.parent,
        pass_mark_percentage: values.pass_mark_percentage,
        test_question_count: values.test_question_count,
      };

      await updateTopic(topic.id, payload);
      toast.success("Curriculum model updated successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update curriculum topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete topic "${topic.name}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteTopic(topic.id);
      toast.success("Curriculum topic deleted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to delete topic");
    } finally {
      setIsDeleting(false);
    }
  };

  const possibleParents = allTopics.filter(t => t.id !== topic.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Update Curriculum Model</h3>
              <p className="text-xs text-slate-500 font-medium">Topic ID: #{topic.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Module / Topic Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Parent Module</label>
            <select
              {...register("parent")}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white font-medium"
            >
              <option value="">-- None (Root Level Curriculum) --</option>
              {possibleParents.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.parent && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.parent.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Overview of curriculum node and learning outcomes."
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pass Grade (%)</label>
              <input
                type="number"
                {...register("pass_mark_percentage")}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Test Question Count</label>
              <input
                type="number"
                {...register("test_question_count")}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="h-11 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Topic
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-11">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-md shadow-indigo-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Model
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditTopicModal;
