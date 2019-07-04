"use strict";

exports.generateConfirmEmailContent = link => {

    return `

    <p style="margin-bottom: 40px; font-weight: 700; font-size: 40px; color: #171A2B">
        Thank you for signing in!
        </p>
    
    <p style="font-size: 18px; color: #5E5E5E">
        To confirm your DefibrillatorHunter account, please click the link below:
    </p>

    <button onclick="${link}" style="margin: 15px 0 30px 50px;
         text-transform: uppercase;
         font-weight: 500;
         font-size: 18px;
          padding: 15px 100px;
          background-color:  #009688;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          outline: none !important;">confirm now</button>

    <p style="font-size: 18px; color: #5E5E5E">
     If you've received this email by mistake, please delete it.
    </p>
    
    `
};

exports.generateResetPwContent = link => {

    return `

    <body style="padding: 10px 20px">
    
    <p style="margin-bottom: 40px; font-weight: 700; font-size: 40px; color: #171A2B">Reset Your Password</p>
    
    <p style="font-size: 18px; color: #5E5E5E; line-height: 1.4">
        You requested to rest your password for your DefibrillatorHunter account.
        <br>
        Use the button below to reset it. The link is only valid for the next hour.
    </p>
    
    <button style="margin: 15px 0 30px 50px;
             text-transform: uppercase;
             font-weight: 500;
             font-size: 18px;
              padding: 15px 100px;
              background-color:  #009688;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              outline: none !important;">reset your password
    </button>
    
    <p style="font-size: 18px; color: #5E5E5E; line-height: 1.4">
        If you didn't ask to change your password, don't worry!
        <br>
        You password is still valid and you can safely delete this email.
    </p>
    
    </body>
        
    `;

};