import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createQuestion, updateQuestion, QuestionPayload, QuestionResponse } from '@/api/instructor.api';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Plus, X } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  difficulty: z.coerce.number().min(1).max(3),
  explanation: z.string().min(5, "Explanation must be at least 5 characters"),
  choices: z.array(
    z.object({
      id: z.number().optional(),
      text: z.string().min(1, "Choice text is required"),
      is_correct: z.boolean(),
    })
  ).length(4, "Exactly 4 choices are required")
  .refine(
    (choices) => choices.filter(c => c.is_correct).length === 1,
    { message: "Exactly one choice must be marked as correct", path: [] }
  )
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  topicId: number;
  editingQuestion?: QuestionResponse | null;
  onSuccess?: () => void;
  onCancelEdit?: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ topicId, editingQuestion, onSuccess, onCancelEdit }) => {
  const [loading, setLoading] = useState(false);
  const isEditing = !!editingQuestion;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors }
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      difficulty: 2, // Medium by default
      explanation: "",
      choices: [
        { text: "", is_correct: true },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ]
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "choices"
  });

  // Reset form when editingQuestion changes
  useEffect(() => {
    if (editingQuestion) {
      const choices = editingQuestion.choices.map((c, idx) => ({
        id: c.id,
        text: c.text,
        is_correct: 'is_correct' in c ? (c as any).is_correct : idx === 0
      }));

      // Ensure 4 choices
      while (choices.length < 4) {
        choices.push({ text: "", is_correct: false });
      }

      reset({
        text: editingQuestion.text,
        difficulty: editingQuestion.difficulty,
        explanation: editingQuestion.explanation || "",
        choices: choices.slice(0, 4)
      });
    } else {
      reset({
        text: "",
        difficulty: 2,
        explanation: "",
        choices: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ]
      });
    }
  }, [editingQuestion, reset]);

  const handleCorrectChoiceChange = (selectedIndex: number) => {
    const currentChoices = getValues("choices");
    const updatedChoices = currentChoices.map((choice, idx) => ({
      ...choice,
      is_correct: idx === selectedIndex
    }));
    setValue("choices", updatedChoices, { shouldValidate: true });
  };

  const onSubmit = async (values: QuestionFormValues) => {
    setLoading(true);
    try {
      const payload: QuestionPayload = {
        topic: topicId,
        text: values.text,
        explanation: values.explanation,
        difficulty: values.difficulty,
        choices: values.choices,
      };

      if (isEditing && editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
        toast.success("Question updated successfully!");
      } else {
        await createQuestion(payload);
        toast.success("Question created successfully!");
      }
      
      reset({
        text: "",
        difficulty: values.difficulty,
        explanation: "",
        choices: [
          { text: "", is_correct: true },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
          { text: "", is_correct: false },
        ]
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, `Failed to ${isEditing ? 'update' : 'create'} question`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">
          {isEditing ? `Edit Question #${editingQuestion.id}` : "Add Question to Bank"}
        </h3>
        {isEditing && onCancelEdit && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} className="text-slate-500 gap-1">
            <X className="w-4 h-4" /> Cancel Edit
          </Button>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Question Text</label>
        <textarea
          {...register("text")}
          rows={3}
          placeholder="e.g. What is the time complexity of binary search?"
          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
        />
        {errors.text && <p className="text-xs text-red-500 mt-1 font-medium">{errors.text.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
          <select
            {...register("difficulty")}
            className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white"
          >
            <option value="1">Easy (1 pt)</option>
            <option value="2">Medium (2 pt)</option>
            <option value="3">Hard (3 pt)</option>
          </select>
          {errors.difficulty && <p className="text-xs text-red-500 mt-1 font-medium">{errors.difficulty.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Explanation</label>
        <textarea
          {...register("explanation")}
          rows={2}
          placeholder="Provide detail showing why the correct answer is correct."
          className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
        />
        {errors.explanation && <p className="text-xs text-red-500 mt-1 font-medium">{errors.explanation.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Choices (Define 4 options & mark exactly 1 correct)</label>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct-choice"
                checked={getValues(`choices.${index}.is_correct`)}
                onChange={() => handleCorrectChoiceChange(index)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <input
                {...register(`choices.${index}.text` as const)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
          ))}
        </div>
        {errors.choices && <p className="text-xs text-red-500 mt-2 font-medium">{errors.choices.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {isEditing && onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit} className="h-11 px-5">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="px-8 h-11 text-sm font-bold shadow-md shadow-indigo-100 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isEditing ? "Update Question" : "Create Question"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
