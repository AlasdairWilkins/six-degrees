export type InvalidLink = {
  movieId: number;
  personId: number;
};

export type SubmissionResponse = {
  isValid: boolean;
  invalidLinks: InvalidLink[];
};
