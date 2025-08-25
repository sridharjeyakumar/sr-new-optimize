// optii.js

const { section_data, line_data, road_line_data } = require("./data");

/**
 * Function to perform optimization on requestData and csvData.
 * @param {Object} requestData - The request data sent by the client.
 * @param {Array} csvData - The parsed CSV data.
 * @returns {Promise<Object>} - The optimized data.
 */
function nextDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
}

function calculateTotalDuration(fromTime, toTime) {
    const [fromHours, fromMinutes] = fromTime.split(":").map(Number);
    const [toHours, toMinutes] = toTime.split(":").map(Number);

    const fromDate = new Date(0, 0, 0, fromHours, fromMinutes);
    const toDate = new Date(0, 0, 0, toHours, toMinutes);

    if (fromDate > toDate) {
        toDate.setHours(toDate.getHours() + 24);
    }

    const totalDuration = (toDate - fromDate) / (1000 * 60 * 60);
    return totalDuration;
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

const groupBy = (data) => {
    return Object.values(data.reduce((acc, item) => {
        const groupKey = item.otherLinesAffected && item.otherLinesAffected.trim() !== ''
            ? `${item.date}-${item.missionBlock}-${item.selectedLine}-${item.otherLinesAffected}`
            : `${item.date}-${item.missionBlock}-${item.selectedLine}`;
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {}));
};

function sortReq(requests) {
    const sortedGroups = requests.map(group => {
        return group.sort((a, b) => {
            const durationA = (parseTime(a.demandTimeTo) - parseTime(a.demandTimeFrom)) / 60;
            const durationB = (parseTime(b.demandTimeTo) - parseTime(b.demandTimeFrom)) / 60;
            return durationB - durationA;
        });
    });

    sortedGroups.sort((a, b) => {
        const dateA = new Date(a[0].date);
        const dateB = new Date(b[0].date);
        return dateA - dateB;
    });

    return sortedGroups;
}
function adjustTimeRange(from, to) {

    const updatedFrom = typeof from === 'number' ? from : parseTime(from);
    let updatedTo = typeof to === 'number' ? to : parseTime(to);

    if (updatedFrom > updatedTo) {
        updatedTo += 24 * 60;
    }

    return { updatedFrom, updatedTo };
}


function findKeyForSection(targetSection) {
    return Object.keys(section_data).find(key => section_data[key].section.includes(targetSection));
}

const findCorridorBlock = (enggRequests, corridorData) => {

    try {

        enggRequests = sortReq(enggRequests);

        try {
            for (let i = 0; i < enggRequests.length; i++) {
                let matchingCorridors = corridorData.filter(corridor => {
                    if (enggRequests[i][0]['otherLinesAffected'] && enggRequests[i][0]['otherLinesAffected'].trim() !== '' && !enggRequests[i][0]['otherLinesAffected'].toLowerCase().includes('rd')) {
                        let selectedLine = enggRequests[i][0]['selectedLine'].trim().toLowerCase();
                        let otherLinesAffected = enggRequests[i][0]['otherLinesAffected']?.trim().toLowerCase();
                        let missionBlock = enggRequests[i][0]['missionBlock'].trim().toLowerCase();

                        let [firstLine, secondLine] = [selectedLine, otherLinesAffected].sort();
                        return (
                            missionBlock === corridor['Section/ station'].trim().toLowerCase() &&
                            firstLine === corridor['Line'].trim().toLowerCase() &&
                            secondLine === corridor['Line'].trim().toLowerCase()
                        );
                    } else {
                        return (
                            enggRequests[i][0]['missionBlock'].trim().toLowerCase() === corridor['Section/ station'].trim().toLowerCase() &&
                            enggRequests[i][0]['selectedLine'].trim().toLowerCase() === corridor['Line'].trim().toLowerCase() &&
                            'NULL' === corridor['Other Line Affected']
                        );
                    }
                });

                // console.log(enggRequests[i][0], matchingCorridors)
                let corridorTotalTime = 0;
                if (matchingCorridors.length !== 0) {
                    corridorTotalTime = calculateTotalDuration(matchingCorridors[0]['From'], matchingCorridors[0]['To']);
                } else {
                    matchingCorridors = [{
                        '': '',
                        From: '22:30',
                        To: '01:30',
                        Duration: '03:00'
                    }]
                    corridorTotalTime = 3
                    // enggRequests[i].forEach(item => {
                    //     item.comments = item.comments || [];
                    //     item.comments.push("No matching corridor found. Using default corridor time.");
                    // });
                }

                let total_requests_duration = 0;

                enggRequests[i].map((e) => {
                    const rt = calculateTotalDuration(e['demandTimeFrom'], e['demandTimeTo']);
                    e['duration'] = rt;
                    total_requests_duration = total_requests_duration + rt;
                })

                enggRequests[i].sort((a, b) => {
                    if ('pushed' in a && 'pushed' in b) {
                        return a.pushed - b.pushed;
                    } else if ('pushed' in a) {
                        return -1;
                    } else if ('pushed' in b) {
                        return 1;
                    } else {
                        return b.duration - a.duration;
                    }
                });

                while (total_requests_duration > corridorTotalTime && enggRequests[i].length > 1) {
                    const leastDuration = enggRequests[i].pop();

                    if (leastDuration) {
                        leastDuration['push'] = leastDuration['push'] ? leastDuration['push'] + 1 : 1;
                        leastDuration['date'] = nextDay(leastDuration['date']);

                        // leastDuration.comments = leastDuration.comments || [];
                        // leastDuration.comments.push(`Request duration exceeds available corridor time. Pushed to next day: ${leastDuration['date']}.`);

                        total_requests_duration -= leastDuration['duration'];
                        if (enggRequests[i + 1] && enggRequests[i + 1][0]['date'] === leastDuration['date']) {
                            enggRequests[i + 1].push(leastDuration);
                        } else {
                            enggRequests.splice(i + 1, 0, [leastDuration]);
                        }

                    }

                }


            };
        } catch (err) {
            console.log(err)
        }

        enggRequests.map((item) => {
            let matchingCorridors = corridorData.filter(corridor => {
                if (item[0]['otherLinesAffected'] && item[0]['otherLinesAffected'].trim() !== '' && !item[0]['otherLinesAffected'].toLowerCase().includes('rd')) {

                    let selectedLine = item[0]['selectedLine'].trim().toLowerCase();
                    let otherLinesAffected = item[0]['otherLinesAffected']?.trim().toLowerCase();
                    let missionBlock = item[0]['missionBlock'].trim().toLowerCase();

                    let [firstLine, secondLine] = [selectedLine, otherLinesAffected].sort();
                    return (
                        missionBlock === corridor['Section/ station'].trim().toLowerCase() &&
                        firstLine === corridor['Line'].trim().toLowerCase() &&
                        secondLine === corridor['Line'].trim().toLowerCase()
                    );
                } else {
                    return (
                        item[0]['missionBlock'].trim().toLowerCase() === corridor['Section/ station'].trim().toLowerCase() &&
                        item[0]['selectedLine'].trim().toLowerCase() === corridor['Line'].trim().toLowerCase() &&
                        'NULL' === corridor['Other Line Affected']
                    );
                }
            });

            if (matchingCorridors.length === 0) {
                matchingCorridors = [{
                    '': '',
                    From: '22:30',
                    To: '01:30',
                    Duration: '03:00'
                }]
            };
            let corridorFrom = parseTime(matchingCorridors[0]['From']);
            let corridorTo = parseTime(matchingCorridors[0]['To']);

            const checkCorrFrom = parseTime(matchingCorridors[0]['From']);
            const checkCorrTo = (parseTime(matchingCorridors[0]['From']) > parseTime(matchingCorridors[0]['To'])) ? (parseTime(matchingCorridors[0]['To']) + (24 * 60)) : parseTime(matchingCorridors[0]['To']);

            const checkDemandFrom = parseTime(item[0]['demandTimeFrom']);
            const checkDemandTo = (parseTime(item[0]['demandTimeFrom']) > parseTime(item[0]['demandTimeTo'])) ? (parseTime(item[0]['demandTimeTo']) + (24 * 60)) : parseTime(item[0]['demandTimeTo']);
            // item.map((e) => {
            //     if (e['requestId'] === '20241209-000122-0') {
            //         console.log(e, matchingCorridors[0]['From'], matchingCorridors[0]['To'], item[0]['demandTimeFrom'], item[0]['demandTimeTo'])
            //     }
            // })
            // console.log(matchingCorridors[0]['From'], matchingCorridors[0]['To'], item[0]['demandTimeFrom'], item[0]['demandTimeTo'], checkCorrFrom, checkCorrTo, checkDemandFrom, checkDemandTo, checkCorrFrom <= checkDemandFrom && checkCorrTo >= checkDemandTo)
            // if (item.length === 1 && (parseTime(item[0]['demandTimeTo']) - parseTime(item[0]['demandTimeFrom']) > (corridorTo - corridorFrom))) {
            if (item.length === 1 && (checkCorrFrom <= checkDemandFrom && checkCorrTo >= checkDemandTo)) {
                item[0]['optimisedTimeFrom'] = item[0]['demandTimeFrom'];
                item[0]['optimisedTimeTo'] = item[0]['demandTimeTo'];
            } else if (item[0]['duration'] > 3) {
                item[0]['optimisedTimeFrom'] = formatTime(corridorFrom);
                item[0]['optimisedTimeTo'] = formatTime(corridorFrom + (3 * 60));
            } else {
                item.map((data) => {

                    let demandFrom = parseTime(data['demandTimeFrom']);
                    let demandTo = parseTime(data['demandTimeTo']);
                    const duration = demandTo - demandFrom;

                    if (demandFrom < corridorFrom) {

                        data['optimisedTimeFrom'] = formatTime(corridorFrom);
                        data['optimisedTimeTo'] = formatTime(corridorFrom + duration);
                        corridorFrom = corridorFrom + duration;
                    } else if (demandTo > corridorTo) {
                        data['optimisedTimeTo'] = formatTime(corridorTo);
                        data['optimisedTimeFrom'] = formatTime(corridorTo - duration);
                        corridorTo = corridorTo - duration
                    } else {
                        data['optimisedTimeFrom'] = formatTime(corridorFrom);
                        data['optimisedTimeTo'] = formatTime(corridorFrom + duration);
                        corridorFrom = corridorFrom + duration;
                    }
                });
            }
        });

        return enggRequests.flat();
    } catch (err) {
        throw new Error(`Optimization failed: ${err.message}`);
    }
};


function mergeIntervals(intervals) {
    if (!intervals || !intervals.length) return [];

    intervals = intervals
        .filter(i => i.optimisedTimeFrom !== undefined && i.optimisedTimeTo !== undefined)
        .map(i => ({
            optimisedTimeFrom: parseTime(i.optimisedTimeFrom),
            optimisedTimeTo: parseTime(i.optimisedTimeTo)
        }))
        .sort((a, b) => a.optimisedTimeFrom - b.optimisedTimeFrom);

    if (!intervals.length) return [];

    let merged = [];
    for (let i of intervals) {
        if (!merged.length || merged[merged.length - 1].optimisedTimeTo < i.optimisedTimeFrom) {
            merged.push(i);
        } else {
            merged[merged.length - 1].optimisedTimeTo = Math.max(
                merged[merged.length - 1].optimisedTimeTo,
                i.optimisedTimeTo
            );
        }
    }
    return merged.map(i => ({
        optimisedTimeFrom: formatTime(i.optimisedTimeFrom),
        optimisedTimeTo: formatTime(i.optimisedTimeTo)
    }));
}


function getArrayAfterSearch(routes, searchTerm) {
    const index = routes.indexOf(searchTerm);
    return index !== -1 ? routes.slice(index + 1) : [];
}
function getArrayBeforeSearch(routes, searchTerm) {
    const index = routes.indexOf(searchTerm);
    return index !== -1 ? routes.slice(0, index) : [];
}

function getArrayBeforeAndAfter(routes, searchTerm) {
    const index = routes.indexOf(searchTerm);
    if (index === -1) return [];
    return [...routes.slice(0, index), ...routes.slice(index + 1)];
}

function filterRequested(occupiedIntervals, shadowIntervals) {

    const updatedShadowIntervals = [];
    for (const shadowInterval of shadowIntervals) {

        let shadowStartTime = parseTime(shadowInterval.optimisedTimeFrom) === 0 ? 24 * 60 : parseTime(shadowInterval.optimisedTimeFrom);
        let shadowEndTime = parseTime(shadowInterval.optimisedTimeTo) === 0 ? 24 * 60 : parseTime(shadowInterval.optimisedTimeTo);

        if (shadowStartTime > shadowEndTime) shadowEndTime += 24 * 60;

        for (const occupiedInterval of occupiedIntervals) {
            let occupiedStartTime = parseTime(occupiedInterval.optimisedTimeFrom) === 0 ? 24 * 60 : parseTime(occupiedInterval.optimisedTimeFrom);
            let occupiedEndTime = parseTime(occupiedInterval.optimisedTimeTo) === 0 ? 24 * 60 : parseTime(occupiedInterval.optimisedTimeTo);
            if (occupiedStartTime > occupiedEndTime) occupiedEndTime += 24 * 60;

            if (occupiedEndTime < shadowStartTime || occupiedStartTime > shadowEndTime) continue;

            if (occupiedStartTime <= shadowStartTime && occupiedEndTime >= shadowEndTime) {
                shadowStartTime = null;
                break;
            }

            if (occupiedStartTime > shadowStartTime && occupiedEndTime >= shadowEndTime) {

                shadowEndTime = occupiedStartTime;
            }
            if (occupiedStartTime <= shadowStartTime && occupiedEndTime < shadowEndTime) {

                shadowStartTime = occupiedEndTime;
            }
            if (occupiedStartTime > shadowStartTime && occupiedEndTime < shadowEndTime) {
                updatedShadowIntervals.push({ optimisedTimeFrom: formatTime(shadowStartTime % (24 * 60)), optimisedTimeTo: formatTime(occupiedStartTime % (24 * 60)) });
                updatedShadowIntervals.push({ optimisedTimeFrom: formatTime(occupiedEndTime % (24 * 60)), optimisedTimeTo: formatTime(shadowEndTime % (24 * 60)) });
                shadowStartTime = null;
                break;
            }
        }
        if (shadowStartTime !== null && shadowStartTime < shadowEndTime) {
            updatedShadowIntervals.push({
                optimisedTimeFrom: formatTime(shadowStartTime % (24 * 60)),
                optimisedTimeTo: formatTime(shadowEndTime % (24 * 60))
            });

        }
    }
    return updatedShadowIntervals

}





function findShadowNon(groupedNonEnggRequests, engOptiData, corridorData, section_data, line_data) {
    try {
        let nonEnggOptii = [];
        // groupedNonEnggRequests = groupedNonEnggRequests.reverse();

        for (let nonEngiIndex = 0; nonEngiIndex < groupedNonEnggRequests.length; nonEngiIndex++) {
            const item = groupedNonEnggRequests[nonEngiIndex];
            // let matchingCorridors = corridorData.filter(corridor => {

            //     item[0]['missionBlock'].trim() === corridor['Section/ station'].trim() &&
            //         item[0]['selectedLine'].trim() === corridor['Line'].trim()
            // });

            let matchingCorridors = corridorData.filter(corridor => {
                if (item[0]['otherLinesAffected'] && item[0]['otherLinesAffected'].trim() !== '' && !item[0]['otherLinesAffected'].toLowerCase().includes('rd')) {
                    let selectedLine = item[0]['selectedLine'].trim().toLowerCase();
                    let otherLinesAffected = item[0]['otherLinesAffected']?.trim().toLowerCase();
                    let missionBlock = item[0]['missionBlock'].trim().toLowerCase();

                    let [firstLine, secondLine] = [selectedLine, otherLinesAffected].sort();

                    return (
                        missionBlock === corridor['Section/ station'].trim().toLowerCase() &&
                        firstLine === corridor['Line'].trim().toLowerCase() &&
                        secondLine === corridor['Other Line Affected'].trim().toLowerCase()
                    );
                } else {

                    return (
                        item[0]['missionBlock'].trim().toLowerCase() === corridor['Section/ station'].trim().toLowerCase() &&
                        item[0]['selectedLine'].trim().toLowerCase() === corridor['Line'].trim().toLowerCase() &&
                        'NULL' === corridor['Other Line Affected']
                    );
                }
            });



            let corridorTotalTime = 0;
            if (matchingCorridors.length !== 0) {
                corridorTotalTime = calculateTotalDuration(matchingCorridors[0]['From'], matchingCorridors[0]['To']);
            } else {
                matchingCorridors = [{
                    '': '',
                    From: '00:00',
                    To: '03:00',
                    Duration: '03:00'
                }]
                corridorTotalTime = 3
                // item.forEach(row => {
                //     row.comments = row.comments || [];
                //     row.comments.push("No matching corridor found. Using default corridor time.");
                // });

            }
            try {
                if (item.length !== 0) {
                    const lineBlockData = line_data[item[0].selectedSection][item[0].selectedLine]
                    const filteredData = engOptiData.filter(data =>
                        data.missionBlock === item[0].missionBlock &&
                        data.date === item[0].date &&
                        data.selectedLine === item[0].selectedLine
                    ).map(data => ({
                        optimisedTimeFrom: data.optimisedTimeFrom,
                        optimisedTimeTo: data.optimisedTimeTo
                    }));

                    const occupaid = mergeIntervals(filteredData);

                    let sectionDatAfterFilter = [];
                    if (lineBlockData === 0) {
                        sectionDatAfterFilter = getArrayBeforeSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
                        // sectionDatAfterFilter = getArrayAfterSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
                    } else if (lineBlockData === 1) {
                        // sectionDatAfterFilter = getArrayBeforeSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
                        sectionDatAfterFilter = getArrayAfterSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
                    } else {
                        sectionDatAfterFilter = getArrayBeforeAndAfter(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
                    }
                    let shadowBlocks = []
                    sectionDatAfterFilter.map(sData => {
                        const filteredData = engOptiData.filter(data =>
                            data.missionBlock === sData &&
                            data.date === item[0].date &&
                            data.selectedLine === item[0].selectedLine
                        ).map(data => ({
                            optimisedTimeFrom: data.optimisedTimeFrom,
                            optimisedTimeTo: data.optimisedTimeTo
                        }));
                        const AlreadyTakenIntval = mergeIntervals(filteredData);
                        AlreadyTakenIntval.length !== 0 && shadowBlocks.push(AlreadyTakenIntval[0])
                    })


                    const occupaidParsed = occupaid.map(occupaidData => ({

                        optimisedTimeFrom: occupaidData.optimisedTimeFrom,
                        optimisedTimeTo: occupaidData.optimisedTimeTo
                    })).sort((a, b) => a.optimisedTimeFrom - b.optimisedTimeFrom);

                    const shadowBlocksParsed = shadowBlocks.map(shadowBlk => ({
                        optimisedTimeFrom: shadowBlk.optimisedTimeFrom,
                        optimisedTimeTo: shadowBlk.optimisedTimeTo
                    })).sort((a, b) => a.optimisedTimeFrom - b.optimisedTimeFrom);

                    const updatedSb = filterRequested(occupaidParsed, shadowBlocksParsed).sort((a, b) => parseTime(b.optimisedTimeFrom) - parseTime(a.optimisedTimeFrom));;
                    const updatedCb = filterRequested(occupaidParsed, [{ 'optimisedTimeFrom': matchingCorridors[0].From, 'optimisedTimeTo': matchingCorridors[0].To }]);

                    let corrDuration;
                    if (parseTime(matchingCorridors[0].From) > parseTime(matchingCorridors[0].To)) {
                        corrDuration = (parseTime(matchingCorridors[0].To) + 24 * 60 - parseTime(matchingCorridors[0].From)) / 60;
                    } else {
                        corrDuration = (parseTime(matchingCorridors[0].To) - parseTime(matchingCorridors[0].From)) / 60;
                    }

                    try {
                        if (updatedSb.length !== 0 && updatedCb.length !== 0) {

                            let updatedSbFromGlob = 0;
                            let updatedSbPrevDur = 0;
                            let updatedCbFromGlob = 0;
                            for (let index = item.length - 1; index >= 0; index--) {
                                const row = item[index];
                                const rowFrom = row.demandTimeFrom
                                const rowTo = row.demandTimeTo

                                if (row['optimisedTimeFrom']) {
                                    continue;
                                }

                                // const rowDuration = (parseTime(rowTo) - parseTime(rowFrom)) / 60;


                                let rowDuration = (parseTime(rowFrom) > parseTime(rowTo)) ? (((parseTime(rowTo) + (24 * 60)) - parseTime(rowFrom)) / 60) : ((parseTime(rowTo) - parseTime(rowFrom)) / 60);
                                if (rowDuration > 3) {
                                    rowDuration = 3;
                                }
                                for (let cbIndex = 0; cbIndex < updatedCb.length; cbIndex++) {
                                    const cb = updatedCb[cbIndex];
                                    const AdjustDataFromTo = adjustTimeRange(cb.optimisedTimeFrom, cb.optimisedTimeTo);
                                    let updatedCbFrom = updatedCbFromGlob !== 0 ? updatedCbFromGlob : AdjustDataFromTo.updatedFrom;
                                    const updatedCbTo = AdjustDataFromTo.updatedTo;
                                    const updatedCbDuration = (updatedCbTo - updatedCbFrom) / 60;

                                    for (let sdIndex = updatedSb.length - 1; sdIndex >= 0; sdIndex--) {
                                        const sb = updatedSb[sdIndex];
                                        const AdjustDataFromTo = adjustTimeRange(sb.optimisedTimeFrom, sb.optimisedTimeTo);
                                        const sbDuration = calculateTotalDuration(sb.optimisedTimeFrom, sb.optimisedTimeTo);

                                        const updatedSbFrom = updatedSbFromGlob !== 0 && updatedSbPrevDur > sbDuration ? updatedSbFromGlob : AdjustDataFromTo.updatedFrom;
                                        const updatedSbTo = AdjustDataFromTo.updatedTo;
                                        const updatedSbDuration = (updatedSbTo - updatedSbFrom) / 60;

                                        // console.log(rowFrom, rowTo, rowDuration, updatedSbDuration, updatedCbDuration, corrDuration, 'aaa')
                                        if (rowDuration <= updatedSbDuration) {
                                            row['optimisedTimeFrom'] = formatTime(updatedSbFrom);
                                            row['optimisedTimeTo'] = formatTime(updatedSbFrom + (rowDuration * 60));
                                            updatedSbFromGlob = updatedSbFrom + (rowDuration * 60);
                                            updatedSbPrevDur = sbDuration - rowDuration;
                                            // console.log(row, updatedSbPrevDur, sbDuration, rowDuration, updatedSbDuration, updatedSbFrom, updatedSbTo, '----------')
                                            if (updatedSbFrom >= updatedSbTo) {
                                                updatedSb.splice(sdIndex, 1);
                                            }
                                            nonEnggOptii.push(...item.splice(index, 1));
                                        }
                                        else if (rowDuration <= updatedCbDuration) {
                                            row['optimisedTimeFrom'] = formatTime(updatedCbFrom);
                                            row['optimisedTimeTo'] = formatTime(updatedCbFrom + (rowDuration * 60));
                                            updatedCbFromGlob = updatedCbFrom + (rowDuration * 60);
                                            if (updatedCbFrom >= updatedCbTo) {
                                                updatedCb.splice(cbIndex, 1);
                                            }
                                            nonEnggOptii.push(...item.splice(index, 1));
                                        } else if (rowDuration <= corrDuration) {
                                            row['push'] = row['push'] ? row['push'] + 1 : 1;
                                            row['date'] = nextDay(row['date']);
                                            // row.comments = row.comments || [];
                                            // row.comments.push(`Request duration exceeds available shadow and corridor time. Pushed to next day: ${row['date']}.`);
                                            if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {

                                                groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                                            } else {

                                                groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                                            }
                                        } else {
                                            row['optimisedTimeFrom'] = "Wrong Request";
                                            row['optimisedTimeTo'] = "Wrong Request";
                                            nonEnggOptii.push(...item.splice(index, 1));
                                        }
                                    }
                                }
                            }
                        } else if (updatedSb.length !== 0 && updatedCb.length === 0) {
                            let updatedSbFromGlob = 0
                            for (let index = item.length - 1; index >= 0; index--) {
                                const row = item[index];
                                const rowFrom = row.demandTimeFrom
                                const rowTo = row.demandTimeTo

                                if (row['optimisedTimeFrom']) {
                                    continue;
                                }

                                // const rowDuration = (parseTime(rowTo) - parseTime(rowFrom)) / 60;
                                let rowDuration = (parseTime(rowFrom) > parseTime(rowTo)) ? ((((parseTime(rowTo) + (24 * 60)) - parseTime(rowFrom)) / 60) + 1) : ((parseTime(rowTo) - parseTime(rowFrom)) / 60);
                                if (rowDuration > 3) {
                                    rowDuration = 3;
                                }
                                for (let sdIndex = updatedSb.length - 1; sdIndex >= 0; sdIndex--) {
                                    const sb = updatedSb[sdIndex];
                                    const AdjustDataFromTo = adjustTimeRange(sb.optimisedTimeFrom, sb.optimisedTimeTo);
                                    const updatedSbFrom = updatedSbFromGlob !== 0 ? updatedSbFromGlob : AdjustDataFromTo.updatedFrom;
                                    const updatedSbTo = AdjustDataFromTo.updatedTo;
                                    const updatedSbDuration = (updatedSbTo - updatedSbFrom) / 60;

                                    if (rowDuration <= updatedSbDuration) {
                                        row['optimisedTimeFrom'] = formatTime(updatedSbFrom);
                                        row['optimisedTimeTo'] = formatTime(updatedSbFrom + (rowDuration * 60));
                                        updatedSbFromGlob = updatedSbFrom + (rowDuration * 60);
                                        if (updatedSbFrom >= updatedSbTo) {
                                            updatedSb.splice(sdIndex, 1);
                                        }
                                        nonEnggOptii.push(...item.splice(index, 1));
                                    }
                                    else if (rowDuration <= corrDuration) {
                                        row['push'] = row['push'] ? row['push'] + 1 : 1;
                                        row['date'] = nextDay(row['date']);
                                        if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
                                            groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                                        } else {

                                            groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                                        }
                                    } else {
                                        row['optimisedTimeFrom'] = "Wrong Request";
                                        row['optimisedTimeTo'] = "Wrong Request";
                                        nonEnggOptii.push(...item.splice(index, 1));
                                    }
                                }
                            }
                        } else if (updatedSb.length === 0 && updatedCb.length !== 0) {
                            let updatedCbFromGlob = 0

                            for (let index = item.length - 1; index >= 0; index--) {

                                const row = item[index];
                                const rowFrom = row.demandTimeFrom
                                const rowTo = row.demandTimeTo

                                if (row['optimisedTimeFrom']) {
                                    continue;
                                }

                                let rowDuration = (parseTime(rowFrom) > parseTime(rowTo)) ? ((((parseTime(rowTo) + (24 * 60)) - parseTime(rowFrom)) / 60)) : ((parseTime(rowTo) - parseTime(rowFrom)) / 60);
                                if (rowDuration > 3) {
                                    rowDuration = 3;
                                }
                                if (updatedCb.length !== 0) {
                                    for (let cbIndex = updatedCb.length - 1; cbIndex >= 0; cbIndex--) {
                                        const cb = updatedCb[cbIndex];
                                        const AdjustDataFromTo = adjustTimeRange(cb.optimisedTimeFrom, cb.optimisedTimeTo);
                                        let updatedCbFrom = updatedCbFromGlob !== 0 ? updatedCbFromGlob : AdjustDataFromTo.updatedFrom;
                                        const updatedCbTo = AdjustDataFromTo.updatedTo;
                                        const updatedCbDuration = (updatedCbTo - updatedCbFrom) / 60;
                                        // if (row['requestId'] === '20241209-000273-0') {
                                        //     console.log(row, '-----------', rowDuration, updatedCbDuration, corrDuration, parseTime(rowTo), parseTime(rowFrom), (parseTime(rowTo) + (24 * 60)))
                                        // }
                                        if (rowDuration <= updatedCbDuration) {
                                            row['optimisedTimeFrom'] = formatTime(updatedCbFrom);
                                            row['optimisedTimeTo'] = formatTime(updatedCbFrom + (rowDuration * 60));
                                            updatedCbFromGlob = updatedCbFrom + (rowDuration * 60);

                                            if (updatedCbFrom >= updatedCbTo) {
                                                updatedCb.splice(cbIndex, 1);
                                            }
                                            nonEnggOptii.push(...item.splice(index, 1));

                                        } else if (rowDuration <= corrDuration) {
                                            try {
                                                row['push'] = row['push'] ? row['push'] + 1 : 1;
                                                row['date'] = nextDay(row['date']);
                                                if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
                                                    groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                                                } else {
                                                    groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                                                }
                                            } catch (errr) {
                                                console.log("inside", errr)
                                            }
                                        } else {
                                            row['optimisedTimeFrom'] = "Wrong Request";
                                            row['optimisedTimeTo'] = "Wrong Request";
                                            nonEnggOptii.push(...item.splice(index, 1));
                                        }
                                    }
                                } else {
                                    row['push'] = row['push'] ? row['push'] + 1 : 1;
                                    row['date'] = nextDay(row['date']);
                                    if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {

                                        groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                                    } else {

                                        groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                                    }
                                }
                            }
                        } else {
                            // console.log('67676', groupedNonEnggRequests)
                            for (let index = item.length - 1; index >= 0; index--) {
                                const row = item[index];
                                const rowFrom = row.demandTimeFrom
                                const rowTo = row.demandTimeTo

                                if (row['optimisedTimeFrom']) {
                                    continue;
                                }
                                row['push'] = row['push'] ? row['push'] + 1 : 1;
                                row['date'] = nextDay(row['date']);

                                // console.log('111111111', row, groupedNonEnggRequests[nonEngiIndex + 1], row['date'])
                                if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
                                    groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                                } else {
                                    groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);

                                }

                            }
                        }
                    } catch (err) {
                        console.log("error----", err)
                    }
                }
            } catch (err) {
                console.log("innn", err)
            }
        }
        return nonEnggOptii;
    } catch (err) {
        console.log(err)
    }
}


function engOptii(enggRequests, corridorData) {
    try {
        const groupedEnggRequests = groupBy(enggRequests);

        return findCorridorBlock(groupedEnggRequests, corridorData)
    } catch (err) {
        console.log(err)
    }
}

function nonEngOptii(nonEnggRequests, corridorData, engOptiData, section_data, line_data) {
    const groupedNonEnggRequests = sortReq(groupBy(nonEnggRequests));

    const nonEngOptiiData = findShadowNon(groupedNonEnggRequests, engOptiData, corridorData, section_data, line_data);
    return nonEngOptiiData
}

const optii = async (requestData, corridorData) => {
    try {

        const validLines = [
            "dn",
            "up",
            "down slow",
            "up fast",
            "down fast",
            "down line",
            "up slow",
            "up line",
            "a line",
            "down sub urban",
            "single",
            "a",
            "b"
        ];

        requestData.forEach(item => {
            const temp = item?.selectedLine && item.selectedLine.toLowerCase()
            if (!validLines.includes(temp)) {
                var data;
                data = road_line_data[item["selectedSection"]][item["missionBlock"]]
                if (!data) {
                    data = line_data[item["selectedSection"]]
                }
                if (item['selectedStream'] === 'Upstream') {
                    if ('UP line' in data) {
                        item['selectedLine'] = 'UP line'
                    }
                    else if ('UP slow' in data) {
                        item['selectedLine'] = 'UP slow'
                    }
                    else if ('UP' in data) {
                        item['selectedLine'] = 'UP'
                    }
                } else if (item['selectedStream'] === 'Downstream') {
                    if ('Down Slow' in data) {
                        item['selectedLine'] = 'Down Slow'
                    }
                    else if ('Down line' in data) {
                        item['selectedLine'] = 'Down line'
                    }
                    else if ('DN' in data) {
                        item['selectedLine'] = 'DN'
                    }
                } else {

                    if ('UP line' in data) {
                        item['selectedLine'] = 'UP line'
                    } else if ("Up fast" in data) {
                        item['selectedLine'] = 'UP fast'
                    } else {
                        item['selectedLine'] = 'UP'
                    }
                }
            }
        });

        const enggRequests = requestData.filter(item => item.selectedDepartment === 'ENGG');
        const nonEnggRequests = requestData.filter(item => item.selectedDepartment !== 'ENGG');

        const engOptiData = engOptii(enggRequests, corridorData);
        const nonEngOptiData = nonEngOptii(nonEnggRequests, corridorData, engOptiData, section_data, line_data);
        const optiiData = [...engOptiData, ...nonEngOptiData];
        return optiiData;
    } catch (error) {
        throw new Error(`Optimization failed: ${error.message}`);
    }
};



module.exports = { optii };