import { Animal } from "../models/animals";
import { get } from "./serviceBase";
import { AnimalDetails } from "../models/animalDetails";
import { MS_PER_HOUR, HOURS_THRESHOLD_3, HOURS_THRESHOLD_4, API_URL, STORAGE_KEY_ANIMALS } from "@/app/constants";

const convertLastFedToDate = <T extends { lastFed?: any }>(animal: T): T => {
    return {
        ...animal,
        lastFed: animal.lastFed ? new Date(animal.lastFed) : null
    } as T;
};

export const getAnimals = async () => {
    try {
        const data = await get<Animal[]>(API_URL);
        const storedAnimals = localStorage.getItem(STORAGE_KEY_ANIMALS);

        if (storedAnimals) {
            const stored = JSON.parse(storedAnimals) as any[];
            const enrichedData = data.map(animal => {
                const storedAnimal = stored.find(a => a.id === animal.id);
                return storedAnimal 
                    ? convertLastFedToDate(storedAnimal)
                    : { ...animal, isFed: false, lastFed: null };
            });

            localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(enrichedData));
            return enrichedData;
        }

        const initializedData = data.map(animal => ({ 
            ...animal, 
            isFed: false, 
            lastFed: null 
        }));
        
        localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(initializedData));
        return initializedData;
    } catch (error) {
        console.error("Error fetching animals:", error);
        const cachedAnimals = localStorage.getItem(STORAGE_KEY_ANIMALS);
        if (cachedAnimals) {
            const parsed = JSON.parse(cachedAnimals) as any[];
            return parsed.map(convertLastFedToDate);
        }
        throw error;
    }
};

export const getAnimalById = async (id: number): Promise<AnimalDetails | null> => {
    try {
        const animal = await get<AnimalDetails>(`${API_URL}/${id}`);
        const storedAnimals = localStorage.getItem(STORAGE_KEY_ANIMALS);
        if (storedAnimals) {
            const stored = JSON.parse(storedAnimals) as AnimalDetails[];
            const storedAnimal = stored.find(a => a.id === id);
            if (storedAnimal) {
                return {
                    ...animal,
                    isFed: storedAnimal.isFed,
                    lastFed: storedAnimal.lastFed ? new Date(storedAnimal.lastFed) : null
                };
            }
        }
        return {
            ...animal,
            isFed: false,
            lastFed: null
        };
    } catch (error) {
        console.error(`Error fetching animal with id ${id}:`, error);
        const cachedAnimals = localStorage.getItem(STORAGE_KEY_ANIMALS);
        if (cachedAnimals) {
            const animals = JSON.parse(cachedAnimals) as AnimalDetails[];
            const found = animals.find((animal) => animal.id === id);
            return found ? convertLastFedToDate(found) : null;
        }
        throw error;
    }
};

export const updateAnimalFedStatus = (id: number, isFed: boolean): void => {
    try {
        const animals = localStorage.getItem(STORAGE_KEY_ANIMALS);
        if (animals) {
            const data = JSON.parse(animals) as any[];
            const animal = data.find(a => a.id === id);
            if (animal) {
                animal.isFed = isFed;
                animal.lastFed = isFed ? new Date() : null;
                localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(data));
            }
        }
    } catch (error) {
        console.error("Error updating animal fed status:", error);
    }
};

export const checkIfNeedsFeeding = (lastFed: Date | null): boolean => {
    if (!lastFed) return true;
    const now = new Date();
    const lastFedDate = new Date(lastFed);
    const hoursSinceFed = (now.getTime() - lastFedDate.getTime()) / MS_PER_HOUR;
    return hoursSinceFed > HOURS_THRESHOLD_4;
};

export const checkIfFeedingExpired = (lastFed: Date | null): boolean => {
    if (!lastFed) return false;
    const now = new Date();
    const lastFedDate = new Date(lastFed);
    const hoursSinceFed = (now.getTime() - lastFedDate.getTime()) / MS_PER_HOUR;
    return hoursSinceFed > HOURS_THRESHOLD_3;
};

export const resetFeedingIfExpired = (id: number): boolean => {
    try {
        const animals = localStorage.getItem(STORAGE_KEY_ANIMALS);
        if (animals) {
            const data = JSON.parse(animals) as any[];
            const animal = data.find(a => a.id === id);
            if (animal && animal.isFed && checkIfFeedingExpired(animal.lastFed ? new Date(animal.lastFed) : null)) {
                animal.isFed = false;
                animal.lastFed = null;
                localStorage.setItem(STORAGE_KEY_ANIMALS, JSON.stringify(data));
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Error resetting feeding status:", error);
        return false;
    }
};