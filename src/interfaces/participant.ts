export interface Participant {
  [key: string]: string | number | (string | number)[] | Participant;
}
