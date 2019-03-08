"use strict";

const LOCATION_TYPE = Object.freeze({
    INDOOR : "indoor",
    OUTDOOR: "outdoor"
});

const LOCATION_SUBTYPE = Object.freeze({
    COMMERCIAL_ACTIVITY : "commercial activity",
    COMPANY             : "company",
    RESIDENTIAL_BUILDING: "residential building",
    PUBLIC_PLACE        : "public place",
    SPORT_FACILITY      : "sport facility",
    TRANSPORT_STATION   : "transport station",
    OTHER               : "other"
});

const DAY_TYPE = Object.freeze({
    ALWAYS  : "always",
    WEEKDAYS: "weekdays",
    WEEKEND : "weekend",
    NEVER   : "never"
});

const DAY_TIME = Object.freeze({
    ALWAYS    : "always",
    DAY_TIME  : "day time",
    NIGHT_TIME: "night time",
    NEVER     : "never"
});



