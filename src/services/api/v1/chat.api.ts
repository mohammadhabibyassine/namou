import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import {
  ChatConversationPage,
  ChatConversationView,
  ChatMessagePage,
  ChatMessageView,
  CreateChatConversationDto,
  ListChatConversationsQueryDto,
  ListChatMessagesQueryDto,
  SendChatMessageDto,
  UpdateChatConversationStatusDto,
} from "@/types/models/chat.model";

export const getChatConversations = async (
  query?: ListChatConversationsQueryDto,
): Promise<ChatConversationPage> => {
  const response = await apiClient.get<ChatConversationPage>(
    API_ENDPOINTS.CHAT.CONVERSATIONS,
    { params: query },
  );
  return response.data;
};

export const createChatConversation = async (
  input?: CreateChatConversationDto,
): Promise<ChatConversationView> => {
  const response = await apiClient.post<ChatConversationView>(
    API_ENDPOINTS.CHAT.CONVERSATIONS,
    input ?? {},
  );
  return response.data;
};

export const getChatMessages = async (
  conversationId: string,
  query?: ListChatMessagesQueryDto,
): Promise<ChatMessagePage> => {
  const response = await apiClient.get<ChatMessagePage>(
    API_ENDPOINTS.CHAT.MESSAGES(conversationId),
    { params: query },
  );
  return response.data;
};

export const sendChatMessage = async (
  conversationId: string,
  input: SendChatMessageDto,
): Promise<ChatMessageView> => {
  const response = await apiClient.post<ChatMessageView>(
    API_ENDPOINTS.CHAT.MESSAGES(conversationId),
    input,
  );
  return response.data;
};

export const markChatConversationRead = async (
  conversationId: string,
): Promise<{ updatedCount: number }> => {
  const response = await apiClient.patch<{ updatedCount: number }>(
    API_ENDPOINTS.CHAT.READ(conversationId),
  );
  return response.data;
};

export const closeChatConversation = async (
  conversationId: string,
): Promise<ChatConversationView> => {
  const response = await apiClient.patch<ChatConversationView>(
    API_ENDPOINTS.CHAT.CLOSE(conversationId),
  );
  return response.data;
};

// Admin Operations
export const getAdminChatConversations = async (
  query?: ListChatConversationsQueryDto,
): Promise<ChatConversationPage> => {
  const response = await apiClient.get<ChatConversationPage>(
    API_ENDPOINTS.CHAT.ADMIN.CONVERSATIONS,
    { params: query },
  );
  return response.data;
};

export const getAdminChatMessages = async (
  conversationId: string,
  query?: ListChatMessagesQueryDto,
): Promise<ChatMessagePage> => {
  const response = await apiClient.get<ChatMessagePage>(
    API_ENDPOINTS.CHAT.ADMIN.MESSAGES(conversationId),
    { params: query },
  );
  return response.data;
};

export const assignAdminChatConversation = async (
  conversationId: string,
): Promise<ChatConversationView> => {
  const response = await apiClient.patch<ChatConversationView>(
    API_ENDPOINTS.CHAT.ADMIN.ASSIGNMENT(conversationId),
  );
  return response.data;
};

export const sendAdminChatMessage = async (
  conversationId: string,
  input: SendChatMessageDto,
): Promise<ChatMessageView> => {
  const response = await apiClient.post<ChatMessageView>(
    API_ENDPOINTS.CHAT.ADMIN.MESSAGES(conversationId),
    input,
  );
  return response.data;
};

export const markAdminChatConversationRead = async (
  conversationId: string,
): Promise<{ updatedCount: number }> => {
  const response = await apiClient.patch<{ updatedCount: number }>(
    API_ENDPOINTS.CHAT.ADMIN.READ(conversationId),
  );
  return response.data;
};

export const updateAdminChatStatus = async (
  conversationId: string,
  input: UpdateChatConversationStatusDto,
): Promise<ChatConversationView> => {
  const response = await apiClient.patch<ChatConversationView>(
    API_ENDPOINTS.CHAT.ADMIN.STATUS(conversationId),
    input,
  );
  return response.data;
};
