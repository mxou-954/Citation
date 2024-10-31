export interface QuotesData {
  quote: string;
  author: string;
  date: Date;
  id: number;
  like :  number;
}

export interface APIResponse {
  success: Boolean;
  message: String;
}
