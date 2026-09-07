import {
  assignAdminChatConversation,
  closeChatConversation,
  createChatConversation,
  getAdminChatConversations,
  getAdminChatMessages,
  getChatConversations,
  getChatMessages,
  markAdminChatConversationRead,
  markChatConversationRead,
  sendAdminChatMessage,
  sendChatMessage,
  updateAdminChatStatus,
} from "@/services/api/v1/chat.api";
import type { ChatConversationStatus } from "@/types/api";

interface PageInput {
  cursor?: string;
  pageSize?: number;
}

/** View-friendly facade over the existing v1 chat service. */
export const chatApi = {
  conversations: (
    input: PageInput & { status?: ChatConversationStatus } = {},
  ) => getChatConversations(input),
  createConversation: (subject?: string) =>
    createChatConversation(subject ? { subject } : {}),
  messages: (conversationId: string, input: PageInput = {}) =>
    getChatMessages(conversationId, input),
  sendMessage: (conversationId: string, content: string) =>
    sendChatMessage(conversationId, { content }),
  markRead: markChatConversationRead,
  close: closeChatConversation,

  adminConversations: (
    input: PageInput & { status?: ChatConversationStatus } = {},
  ) => getAdminChatConversations(input),
  adminMessages: (conversationId: string, input: PageInput = {}) =>
    getAdminChatMessages(conversationId, input),
  adminAssign: assignAdminChatConversation,
  adminSendMessage: (conversationId: string, content: string) =>
    sendAdminChatMessage(conversationId, { content }),
  adminMarkRead: markAdminChatConversationRead,
  adminUpdateStatus: (conversationId: string, status: ChatConversationStatus) =>
    updateAdminChatStatus(conversationId, { status }),
};
