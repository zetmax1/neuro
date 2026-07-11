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

