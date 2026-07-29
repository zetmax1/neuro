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
  created_at: string;
  updated_at: string;
}

export interface QuestionResponse extends QuestionPayload {
  id: number;
}

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
 * Deletes a curriculum topic.
 */
export const deleteTopic = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/curriculum/instructor/topics/${id}/`);
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
 * Deletes a question from the question bank.
 */
export const deleteQuestion = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/assessments/instructor/questions/${id}/`);
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
 * Downloads question import template ("shablon") in Excel or Word format.
 */
export const downloadQuestionTemplate = (format: 'excel' | 'word' = 'excel'): void => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  window.open(`${baseUrl.replace(/\/$/, '')}/api/assessments/instructor/templates/questions/?file_format=${format}`, '_blank');
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


