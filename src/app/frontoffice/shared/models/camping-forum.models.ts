export interface EventDTO {
  id: number;
  title: string;
  eventDate: string;
  maxParticipants: number;
  status: string;
  wasteCollected: number;
  campingId: number;
  campingName: string;
}

export interface PostDTO {
  id: number;
  content: string;
  createDate: string;
  eventId: number;
  eventTitle: string;
  userId: number;
  authorFullName: string;
}

export interface CommentDTO {
  id: number;
  content: string;
  createDate: string;
  postId: number;
  userId: number;
  authorFullName: string;
}

export interface ActivityDTO {
  id: number;
  name: string;
  description: string;
  duration: number;
  difficulty: string;
  eventId: number;
  eventTitle: string;
  campingId: number;
  campingName: string;
  totalParticipations: number;
}

export interface ParticipationDTO {
  id: number;
  participationDate: string;
  status: string;
  activityId: number;
  activityName: string;
  userId: number;
  participantFullName: string;
}

export interface CampingDTO {
  campingId: number;
  name: string;
  address: string;
  description: string;
  postalCode: string;
  status: string;
  totalEvents: number;
  totalActivities: number;
}
