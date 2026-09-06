import { CursorPage, CursorPaginationQuery } from "../api/common.types";

export const ChatConversationStatus = {
  Open: "open",
  Closed: "closed",
  Archived: "archived",
} as const;

export type ChatConversationStatus =
  (typeof ChatConversationStatus)[keyof typeof ChatConversationStatus];

export interface ChatParticipantView {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface ChatConversationView {
  id: string;
  userId: string;
  assignedAdminId: string | null;
  subject: string | null;
  status: ChatConversationStatus;
  user: ChatParticipantView;
  assignedAdmin: ChatParticipantView | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageSenderView {
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

export interface ChatMessageView {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  sender: ChatMessageSenderView;
  createdAt: string;
  updatedAt: string;
}

export type ChatConversationPage = CursorPage<ChatConversationView>;
export type ChatMessagePage = CursorPage<ChatMessageView>;

export interface CreateChatConversationDto {
  subject?: string;
}

export interface ListChatConversationsQueryDto extends CursorPaginationQuery {
  status?: ChatConversationStatus;
}

export interface UpdateChatConversationStatusDto {
  status: ChatConversationStatus;
}

export interface SendChatMessageDto {
  content: string;
}

export interface SendChatSocketMessageDto extends SendChatMessageDto {
  conversationId: string;
}

export interface ChatConversationSocketDto {
  conversationId: string;
}

export type ListChatMessagesQueryDto = CursorPaginationQuery;
