export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface CreateNoteDto {
  title: string;
  content: string;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
}
