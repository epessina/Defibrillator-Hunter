"use strict";

/**
 * _id: String
 * timestamp: String
 * lang: String
 * age: String
 * gender: String
 * education: String
 * workStatus: String
 *
 */

class User {

    constructor(userID, lang, age, gender, education, workStatus) {

        this._id        = userID;
        this.timeStamp  = new Date().toISOString();
        this.lang       = lang;
        this.age        = age;
        this.gender     = gender;
        this.education  = education;
        this.workStatus = workStatus;
    }

    setRev(rev) {
        this._rev = rev;
    }

}

