import apiClient from './client';

export interface ChoicePayload {
  id?: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionPayload {
  id?: number;
  topic: number; // Foreign key ID of the topic
  text: string;
  explanation: string;
  difficulty: number; // integer (e.g. 1-10)
  choices: ChoicePayload[];
}

export interface TopicPayload {
  id?: number;
  name: string;
  slug: string;
  parent: number | null;
  description?: string;
  position?: number;
  is_unlocked?: boolean;
}

export interface TopicResponse extends TopicPayload {
  id: number;
  /** Archived topics are hidden from lists unless ?include_archived=true (D11). */
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionResponse extends QuestionPayload {
  id: number;
  /** Deactivated questions are hidden from lists unless ?include_inactive=true (D11). */
  is_active?: boolean;
}

/**
 * Outcome of deleting a topic or question (D11). Items that learners have
 * answered are never deleted: the backend archives the topic subtree or
 * deactivates the question instead and answers 200 `{"archived": true}`.
 */
export interface DeleteResult {
  archived: boolean;
  /** Size of the archived topic subtree (topics only). */
  archivedTopics?: number;
}

export const ARCHIVED_TOPIC_MESSAGE =
  "Learners have answered questions in this branch, so it was archived instead of deleted";

const toDeleteResult = (data: unknown): DeleteResult => {
  const body = (data ?? {}) as { archived?: unknown; archived_topics?: unknown };
  return {
    archived: body.archived === true,
    archivedTopics: typeof body.archived_topics === "number" ? body.archived_topics : undefined,
  };
};

/**
 * Fetches all topics for instructor curriculum management.
 */
export const getTopics = async (): Promise<TopicResponse[]> => {
  const response = await apiClient.get('/api/curriculum/instructor/topics/');
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return response.data;
};

/**
 * Creates a new curriculum topic.
 */
export const createTopic = async (topic: TopicPayload): Promise<TopicResponse> => {
  const response = await apiClient.post('/api/curriculum/instructor/topics/', topic);
  return response.data;
};

/**
 * Updates an existing curriculum topic.
 */
export const updateTopic = async (id: number, topic: Partial<TopicPayload>): Promise<TopicResponse> => {
  const response = await apiClient.patch(`/api/curriculum/instructor/topics/${id}/`, topic);
  return response.data;
};

/**
 * Deletes a curriculum topic, or archives its subtree when learners have answered in it.
 */
export const deleteTopic = async (id: number): Promise<DeleteResult> => {
  const response = await apiClient.delete(`/api/curriculum/instructor/topics/${id}/`);
  return toDeleteResult(response.data);
};

/**
 * Creates a new adaptive question inside the database.
 */
export const createQuestion = async (question: QuestionPayload): Promise<QuestionResponse> => {
  const response = await apiClient.post('/api/assessments/instructor/questions/', question);
  return response.data;
};

/**
 * Fetches all questions for a given topic ID from the question bank.
 */
export const getQuestionsByTopic = async (topicId: number): Promise<QuestionResponse[]> => {
  const response = await apiClient.get('/api/assessments/instructor/questions/', {
    params: { topic: topicId }
  });
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return response.data;
};

/**
 * Deletes a question from the question bank, or deactivates it when learners have answered it.
 */
export const deleteQuestion = async (id: number): Promise<DeleteResult> => {
  const response = await apiClient.delete(`/api/assessments/instructor/questions/${id}/`);
  return toDeleteResult(response.data);
};

/**
 * Updates an existing question in the question bank.
 */
export const updateQuestion = async (id: number, question: Partial<QuestionPayload>): Promise<QuestionResponse> => {
  const response = await apiClient.put(`/api/assessments/instructor/questions/${id}/`, question);
  return response.data;
};

/**
 * Bulk imports questions from Excel or Word template.
 */
export const importQuestions = async (topicId: number, file: File): Promise<{ detail: string; imported_count: number }> => {
  const formData = new FormData();
  formData.append('topic_id', String(topicId));
  formData.append('file', file);

  const response = await apiClient.post('/api/assessments/instructor/questions_import/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Downloads the question import template ("shablon") in Excel or Word format.
 * The endpoint is instructor-only, so the file is fetched with the auth header
 * and saved through a temporary object URL.
 */
export const downloadQuestionTemplate = async (format: 'excel' | 'word' = 'excel'): Promise<void> => {
  const response = await apiClient.get<Blob>('/api/assessments/instructor/templates/questions/', {
    params: { file_format: format },
    responseType: 'blob',
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = format === 'word' ? 'quiz_import_shablon.docx' : 'quiz_import_shablon.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// Curriculum Resource APIs

export interface TopicResource {
  id: number;
  topic: number;
  title: string;
  resource_type: 'VIDEO' | 'DOCUMENT' | 'TEXT_CONTENT';
  file: string | null;
  external_url: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const getResourcesByTopic = async (topicId: number): Promise<TopicResource[]> => {
  const response = await apiClient.get('/api/curriculum/instructor/resources/', {
    params: { topic: topicId }
  });
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }
  return response.data;
};

export const createResource = async (formData: FormData): Promise<TopicResource> => {
  const response = await apiClient.post('/api/curriculum/instructor/resources/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteResource = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/curriculum/instructor/resources/${id}/`);
};


