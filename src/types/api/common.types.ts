export interface CursorPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: CursorPageInfo;
}

export interface CursorPaginationQuery {
  cursor?: string;
  pageSize?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}
