import { Animal } from "./animals";

export type AnimalDetails = Animal & {
    latinName: string;
    yearOfBirth: number;
    longDescription: string;
    medicine: string;
    lastFed: Date | null;
};