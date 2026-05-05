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

export interface TicketDTO {
  id: number;
  ticketCode: string;
  issueDate: string;
  status: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  userId: number;
  participantFullName: string;
  qrCodeBase64: string; // ⭐ image QR en base64
}
export interface EventStatsDTO {
  eventId: number;
  eventTitle: string;
  eventDate: string;
  status: string;
  campingName: string;
  totalActivities: number;
  easyActivities: number;
  mediumActivities: number;
  hardActivities: number;
  totalParticipations: number;
  maxParticipants: number;
  fillRate: number;
  totalPosts: number;
  totalComments: number;
  totalTickets: number;
  validTickets: number;
  usedTickets: number;
  cancelledTickets: number;
}

export interface CampingRankingDTO {
  campingId: number;
  campingName: string;
  campingStatus: string;
  totalEvents: number;
  totalActivities: number;
  totalParticipations: number;
  totalPosts: number;
  totalTickets: number;
  totalWasteCollected: number;
  avgFillRate: number;
  engagementScore: number;
}

export interface DropoutFeaturesDTO {
  cancel_rate_user:       number;
  activity_difficulty:    number;
  nb_participations_user: number;
  month:                  number;
}

export interface DropoutPredictionDTO {
  dropout_probability: number;
  risk_level:          'LOW' | 'MEDIUM' | 'HIGH';
}

export interface EventFeaturesDTO {
  nb_activities:    number;
  month:            number;
  difficulty_score: number;
  camping_open:     number;
  history_rate:     number;
}

export interface EventPredictionDTO {
  predicted_participants: number;
  confidence:             string;
}