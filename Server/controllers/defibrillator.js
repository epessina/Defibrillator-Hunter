"use strict";


const test = {
  defibrillators: [
      {
          _id: "1068fbe1-2f2f-defc-08ea-496e75c5175b",
          creationDate: "2019-04-07T17:52:26.129Z",
          lastModified: "2019-04-07T17:52:26.129Z",
          position: [45.40037851725538, 9.298553466796877],
          accuracy: 0,
          locationCategory: "residentialBuilding",
          transportType: "",
          visualReference: "",
          floor: 6,
          temporalAccessibility: "partTime",
          recovery: "",
          signage: "",
          brand: "",
          notes: "",
          presence: "",
          hasPhoto: false,
      }
  ]
};


exports.getDefibrillators = (req, res, next) => {

    res.status(200).json(test);

};


exports.postDefibrillator = (req, res, next) => {

    const _id      = req.body._id,
          accuracy = req.body.accuracy;

    res.status(201).json({
        message      : "Defibrillator created",
        defibrillator: {_id: _id, accuracy: accuracy}
    });

};