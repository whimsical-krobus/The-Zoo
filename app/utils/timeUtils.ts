const HOURS_THRESHOLD_3 = 0.5;
const HOURS_THRESHOLD_4 = 1;
const MS_PER_HOUR = 1000 * 60 * 60;

export const getHoursSince = (date: Date | null): number => {
    if (!date) return Infinity;
    const now = new Date();
    const givenDate = new Date(date);
    return (now.getTime() - givenDate.getTime()) / MS_PER_HOUR;
};

export const isMoreThan3HoursPassed = (date: Date | null): boolean => {
    return getHoursSince(date) > HOURS_THRESHOLD_3;
};

export const isMoreThan4HoursPassed = (date: Date | null): boolean => {
    return getHoursSince(date) > HOURS_THRESHOLD_4;
};

export const formatLastFedTime = (date: Date | null): string => {
    if (!date) return "Never";
    const hours = Math.floor(getHoursSince(date));
    const minutes = Math.floor((getHoursSince(date) % 1) * 60);

    if (hours === 0) {
        return `${minutes} minutes ago`;
    } else if (hours === 1) {
        return "1 hour ago";
    } else {
        return `${hours} hours ago`;
    }
};
