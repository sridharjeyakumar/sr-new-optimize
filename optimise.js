// optii.js

const { section_data, line_data } = require("./data");

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
        const groupKey = `${item.date}-${item.missionBlock}-${item.selectedLine}`;
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

    enggRequests = sortReq(enggRequests);
    for (let i = 0; i < enggRequests.length; i++) {
        const matchingCorridors = corridorData.filter(corridor =>
            enggRequests[i][0]['missionBlock'].trim() === corridor['Section/ station'].trim() &&
            enggRequests[i][0]['selectedLine'].trim() === corridor['Line'].trim()
        );

        let corridorTotalTime = 0;
        if (matchingCorridors.length !== 0) {
            corridorTotalTime = calculateTotalDuration(matchingCorridors[0]['From'], matchingCorridors[0]['To']);
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

                total_requests_duration -= leastDuration['duration'];
                if (enggRequests[i + 1] && enggRequests[i + 1][0]['date'] === leastDuration['date']) {
                    enggRequests[i + 1].push(leastDuration);
                } else {
                    enggRequests.splice(i + 1, 0, [leastDuration]);
                }

            }

        }


    };

    enggRequests.map((item) => {
        const matchingCorridors = corridorData.filter(corridor =>
            item[0]['missionBlock'].trim().toLowerCase() === corridor['Section/ station'].trim().toLowerCase() &&
            item[0]['selectedLine'].trim().toLowerCase() === corridor['Line'].trim().toLowerCase()
        );

        if (matchingCorridors.length === 0) return;
        let corridorFrom = parseTime(matchingCorridors[0]['From']);
        let corridorTo = parseTime(matchingCorridors[0]['To']);

        // if (item.length === 1 && (parseTime(item[0]['demandTimeTo']) - parseTime(item[0]['demandTimeFrom']) > (corridorTo - corridorFrom))) {
        //     item[0]['optimisedTimeFrom'] = item[0]['demandTimeFrom'];
        //     item[0]['optimisedTimeTo'] = item[0]['demandTimeTo'];
        // } else {
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
        // }
    });

    return enggRequests.flat();
};


function mergeIntervals(intervals) {
    if (!intervals || !intervals.length) return []; // Return empty array if intervals is empty or undefined

    intervals = intervals
        .filter(i => i.optimisedTimeFrom !== undefined && i.optimisedTimeTo !== undefined) // Filter out invalid intervals
        .map(i => ({
            optimisedTimeFrom: parseTime(i.optimisedTimeFrom),
            optimisedTimeTo: parseTime(i.optimisedTimeTo)
        }))
        .sort((a, b) => b.optimisedTimeFrom - a.optimisedTimeFrom);

    if (!intervals.length) return []; // Return empty array if all intervals were invalid

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
                updatedShadowIntervals.push({ optimisedTimeFrom: shadowStartTime, optimisedTimeTo: occupiedStartTime });
                updatedShadowIntervals.push({ optimisedTimeFrom: occupiedEndTime, optimisedTimeTo: shadowEndTime });
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
        .sort((a, b) => a.optimisedTimeFrom - b.optimisedTimeFrom);
}





function findShadowNon(groupedNonEnggRequests, engOptiData, corridorData, section_data, line_data) {
    let nonEnggOptii = [];

    for (let nonEngiIndex = 0; nonEngiIndex < groupedNonEnggRequests.length; nonEngiIndex++) {

        const item = groupedNonEnggRequests[nonEngiIndex];
        let matchingCorridors = corridorData.filter(corridor =>
            item[0]['missionBlock'].trim() === corridor['Section/ station'].trim() &&
            item[0]['selectedLine'].trim() === corridor['Line'].trim()
        );

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
        }

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
                sectionDatAfterFilter = getArrayAfterSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
            } else if (lineBlockData === 1) {
                sectionDatAfterFilter = getArrayBeforeSearch(section_data[item[0].selectedSection]["section"], item[0].missionBlock)
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

            const updatedSb = filterRequested(occupaidParsed, shadowBlocksParsed);
            const updatedCb = filterRequested(occupaidParsed, [{ 'optimisedTimeFrom': matchingCorridors[0].From, 'optimisedTimeTo': matchingCorridors[0].To }]);

            let corrDuration;
            if (parseTime(matchingCorridors[0].From) > parseTime(matchingCorridors[0].To)) {
                corrDuration = (parseTime(matchingCorridors[0].To) + 24 * 60 - parseTime(matchingCorridors[0].From)) / 60;
            } else {
                corrDuration = (parseTime(matchingCorridors[0].To) - parseTime(matchingCorridors[0].From)) / 60;
            }

            if (updatedSb.length !== 0 && updatedCb.length !== 0) {

                let updatedSbFromGlob = 0;
                let updatedCbFromGlob = 0;
                for (let index = item.length - 1; index >= 0; index--) {
                    const row = item[index];
                    const rowFrom = row.demandTimeFrom
                    const rowTo = row.demandTimeTo

                    const rowDuration = (parseTime(rowTo) - parseTime(rowFrom)) / 60;

                    for (let cbIndex = updatedCb.length - 1; cbIndex >= 0; cbIndex--) {
                        const cb = updatedCb[cbIndex];
                        const AdjustDataFromTo = adjustTimeRange(cb.optimisedTimeFrom, cb.optimisedTimeTo);
                        let updatedCbFrom = updatedCbFromGlob !== 0 ? updatedCbFromGlob : AdjustDataFromTo.updatedFrom;
                        const updatedCbTo = AdjustDataFromTo.updatedTo;
                        const updatedCbDuration = (updatedCbTo - updatedCbFrom) / 60;
                        for (let sdIndex = updatedSb.length - 1; sdIndex >= 0; sdIndex--) {
                            const sb = updatedSb[sdIndex];
                            const AdjustDataFromTo = adjustTimeRange(sb.optimisedTimeFrom, sb.optimisedTimeTo);
                            const updatedSbFrom = updatedSbFromGlob !== 0 ? updatedSbFromGlob : AdjustDataFromTo.updatedFrom;
                            const updatedSbTo = AdjustDataFromTo.updatedTo;
                            const updatedSbDuration = (updatedSbTo - updatedSbFrom) / 60;

                            if (rowDuration <= updatedSbDuration) {
                                row['optimisedTimeFrom'] = formatTime(updatedSbFrom);
                                row['optimisedTimeTo'] = formatTime(updatedSbFrom + (rowDuration * 60));
                                updatedSbFromGlob = updatedSbFrom + (rowDuration * 60);;
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

                                if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
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

                    const rowDuration = (parseTime(rowTo) - parseTime(rowFrom)) / 60;
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

                            if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
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

                    const rowDuration = (parseTime(rowTo) - parseTime(rowFrom)) / 60;

                    if (updatedCb.length !== 0) {
                        for (let cbIndex = updatedCb.length - 1; cbIndex >= 0; cbIndex--) {

                            const cb = updatedCb[cbIndex];
                            const AdjustDataFromTo = adjustTimeRange(cb.optimisedTimeFrom, cb.optimisedTimeTo);
                            let updatedCbFrom = updatedCbFromGlob !== 0 ? updatedCbFromGlob : AdjustDataFromTo.updatedFrom;
                            const updatedCbTo = AdjustDataFromTo.updatedTo;
                            const updatedCbDuration = (updatedCbTo - updatedCbFrom) / 60;
                            if (rowDuration <= updatedCbDuration) {

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

                                if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
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
                    } else {
                        row['push'] = row['push'] ? row['push'] + 1 : 1;
                        row['date'] = nextDay(row['date']);

                        if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
                            groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                        } else {
                            groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                        }
                    }
                }
            } else {

                for (let index = item.length - 1; index >= 0; index--) {
                    const row = item[index];
                    const rowFrom = row.demandTimeFrom
                    const rowTo = row.demandTimeTo
                    row['push'] = row['push'] ? row['push'] + 1 : 1;
                    row['date'] = nextDay(row['date']);

                    if (groupedNonEnggRequests[nonEngiIndex + 1] && groupedNonEnggRequests[nonEngiIndex + 1][0]['date'] === row['date']) {
                        groupedNonEnggRequests[nonEngiIndex + 1].push(row);
                    } else {
                        groupedNonEnggRequests.splice(nonEngiIndex + 1, 0, [row]);
                    }

                }
            }
        }
    }
    return nonEnggOptii;
}


function engOptii(enggRequests, corridorData) {
    const groupedEnggRequests = groupBy(enggRequests);
    return findCorridorBlock(groupedEnggRequests, corridorData)
}

function nonEngOptii(nonEnggRequests, corridorData, engOptiData, section_data, line_data) {
    const groupedNonEnggRequests = sortReq(groupBy(nonEnggRequests));
    const nonEngOptiiData = findShadowNon(groupedNonEnggRequests, engOptiData, corridorData, section_data, line_data);
    return nonEngOptiiData
}

const optii = async (requestData, corridorData) => {
    try {
        const enggRequests = requestData.filter(item => item.selectedDepartment === 'ENGG');
        const nonEnggRequests = requestData.filter(item => item.selectedDepartment !== 'ENGG');

        const engOptiData = engOptii(enggRequests, corridorData);

        const nonEngOptiData = nonEngOptii(nonEnggRequests, corridorData, engOptiData, section_data, line_data);

        // console.log(engOptiData, nonEngOptiData)
        const optiiData = [...engOptiData, ...nonEngOptiData];
        return optiiData;
    } catch (error) {
        throw new Error(`Optimization failed: ${error.message}`);
    }
};

module.exports = { optii };


