function filterRequested(occupaid, shadowBow) {
    let updatedShadowBow = [];

    for (const shadow of shadowBow) {
        let shadowStart = shadow.optimisedTimeFrom === 0 ? 24 * 60 : shadow.optimisedTimeFrom;
        let shadowEnd = shadow.optimisedTimeTo === 0 ? 24 * 60 : shadow.optimisedTimeTo;

        if (shadowStart > shadowEnd) shadowEnd += 24 * 60;

        for (const occupaidInterval of occupaid) {
            let occupaidStart = occupaidInterval.optimisedTimeFrom === 0 ? 24 * 60 : occupaidInterval.optimisedTimeFrom;
            let occupaidEnd = occupaidInterval.optimisedTimeTo === 0 ? 24 * 60 : occupaidInterval.optimisedTimeTo;

            if (occupaidStart > occupaidEnd) occupaidEnd += 24 * 60;
            if (occupaidEnd <= shadowStart || occupaidStart >= shadowEnd) continue;

            if (occupaidStart <= shadowStart && occupaidEnd >= shadowEnd) {

                shadowStart = null;
                break;
            }
            if (occupaidStart > shadowStart && occupaidEnd >= shadowEnd) {
                shadowEnd = occupaidStart;
            }


            if (occupaidStart <= shadowStart && occupaidEnd < shadowEnd) {

                shadowStart = occupaidEnd;
            }

            if (occupaidStart > shadowStart && occupaidEnd < shadowEnd) {

                updatedShadowBow.push({ optimisedTimeFrom: shadowStart, optimisedTimeTo: occupaidStart });
                updatedShadowBow.push({ optimisedTimeFrom: occupaidEnd, optimisedTimeTo: shadowEnd });
                shadowStart = null;
                break;
            }
        }
        if (shadowStart !== null && shadowStart < shadowEnd) {
            updatedShadowBow.push({
                optimisedTimeFrom: shadowStart % (24 * 60),
                optimisedTimeTo: shadowEnd % (24 * 60)
            });
        }
    }

    return updatedShadowBow.sort((a, b) => a.optimisedTimeFrom - b.optimisedTimeFrom);
}


const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const formatTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    hours = hours >= 24 ? hours - 24 : hours;
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hours.toString().padStart(2, '0')}:${mins}`;
};

const occupaid = [

];

const shadowBow = [
    { optimisedTimeFrom: parseTime('03:00'), optimisedTimeTo: parseTime('05:00') },
    { optimisedTimeFrom: parseTime('23:45'), optimisedTimeTo: parseTime('01:30') }
];

console.log(filterRequested(occupaid, shadowBow))
