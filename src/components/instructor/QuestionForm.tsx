import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createQuestion, QuestionPayload } from '@/api/instructor.api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const questionSchema = z.object({
  text: z.string().min(5, "Question text must be at least 5 characters"),
  difficulty: z.coerce.number().min(1).max(3),
  explanation: z.string().min(5, "Explanation must be at least 5 characters"),
  choices: z.array(
    z.object({
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
  onSuccess?: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ topicId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

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

      await createQuestion(payload);
      toast.success("Question created successfully");
      
      // Reset form but keep difficulty
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
      toast.error(err.response?.data?.detail || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">Add Question to Bank</h3>

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
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
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
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
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

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 h-12 text-sm shadow-md shadow-indigo-100"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Question"
          )}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;
