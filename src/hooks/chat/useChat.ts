import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeChatConversation,
  createChatConversation,
  getChatConversations,
  getChatMessages,
  markChatConversationRead,
  sendChatMessage,
} from "@/services/api/v1/chat.api";
import {
  CreateChatConversationDto,
  ListChatConversationsQueryDto,
  ListChatMessagesQueryDto,
  SendChatMessageDto,
} from "@/types/models/chat.model";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/store";

export const CHAT_KEYS = {
  conversations: (query?: ListChatConversationsQueryDto) =>
    queryKeys.chat.conversations(query),
  messages: (conversationId: string, query?: ListChatMessagesQueryDto) =>
    [...queryKeys.chat.messages(conversationId), query] as const,
};

export const useChatConversations = (query?: ListChatConversationsQueryDto) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: CHAT_KEYS.conversations(query),
    queryFn: () => getChatConversations(query),
    enabled: isAuthenticated,
  });
};

export const useChatMessages = (
  conversationId: string,
  query?: ListChatMessagesQueryDto,
) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: CHAT_KEYS.messages(conversationId, query),
    queryFn: () => getChatMessages(conversationId, query),
    enabled: isAuthenticated && Boolean(conversationId),
  });
};

export const useCreateChatConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: CreateChatConversationDto) =>
      createChatConversation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      input,
    }: {
      conversationId: string;
      input: SendChatMessageDto;
    }) => sendChatMessage(conversationId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
};

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      markChatConversationRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });
    },
  });
};

export const useCloseConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      closeChatConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });
};
