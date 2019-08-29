<h4 align="center">
<img src="https://github.com/epessina/Mapad/blob/master/App/screens/logo.png" width="144" alt="Logo">
</h4>

# Mapad

### Table of Contents

-  [What is Mapad?](#what-is-mapad)
-  [Technologies](#technologies)
-  [Installation](#installation)
-  [Demo](#demo)
-  [Contributions](#contributions)
-  [License](#license)


## What is Mapad?

Mapad is a *cross-platform mobile application* that allows users to **map defibrillators** on the field in an easy and
fun way.

All the collected data are stored in a database through a **publicly open API** that provides endpoints for retrieving,
inserting and modifying the defibrillators. 

### Features

- Secure authentication method through [Oauth 2.0](https://oauth.net/2/) protocol.
- User's position always visible on a map.
- Possibility to insert new defibrillator in the system through a flow of questions (presence of the defibrillator, 
location category, signage, picture of the machine, etc.).
- Possibility to update or delete mapped defibrillators.
- Users can compete through a system assigns points for each mapped defibrillator and produces a real-time global
leaderboard.


## Technologies

### Client

HTML5, SCSS and JavaScript code wrapped with [Apache Cordova](https://cordova.apache.org/) to create a native,
cross-platform mobile application.

#### Dependencies

- [jQuery](https://jquery.com/) 
- [Leaflet](https://leafletjs.com/)
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster)
- [i18next](https://www.i18next.com/)
- [Babel](https://babeljs.io/)

### Server

RESTFull API written using [Node.js](https://nodejs.org/it/) and [Express.js](https://expressjs.com/it/).

### Database

[MongoDB](https://www.mongodb.com/).


## Installation

### Android

The minimum version required is **Android 7.0 (API level 24)**.

1. Download [Mapad-x.x.x.apk](https://github.com/epessina/Mapad/releases).
2. Place the file in your phone.
3. Install the apk.
4. Done!

### iOS

Coming soon...


## Demo

#### Login screen

<kbd><img src="https://github.com/epessina/Mapad/blob/master/App/screens/01-login.png" width="250" alt="Login screen"></kbd>

The login screen allows to:
- login into the system;
- navigate to the registration page
- reset the password.

---

#### Map screen

<kbd><img src="https://github.com/epessina/Mapad/blob/master/App/screens/03-map.png" width="250" alt="Map screen"></kbd>

1. **Map**. Centered on the user's position, it can be moved and zoomed freely.
2. **User marker**. Shows the current position of the user. It can be moved if the location is not accurate.
3. **Defibrillator marker**. Shows a mapped defibrillator that is saved on the main database. A click
on one of those markers opens a screen that shows the information about the correspondent defibrillator and allows to
delete or modify it.
5. **Profile button**. Opens the profile page.
7. **GPS button**. Centers the map and the user marker on the current location of the user.
8. **New defibrillator button**. Opens the screen that allows to insert a new defibrillator.

---

#### Insert screen

<p float="left">
<kbd><img src="https://github.com/epessina/Mapad/blob/master/App/screens/04-insert-1.png" width="250" alt="Insert screen part 1"></kbd>
<kbd><img src="https://github.com/epessina/Mapad/blob/master/App/screens/05-insert-2.png" width="250" alt="Insert screen part 2"></kbd>
</p>

The insert screen. From here the user can insert all the details about a new defibrillator and save it in the database.

---

#### Profile screen

<kbd><img src="https://github.com/epessina/Mapad/blob/master/App/screens/06-profile.png" width="250" alt="Profile screen"></kbd>

This screen shows some information about the user and his points status. Furthermore, the settings of the application
can be accessed from here.



## Contributions

A special thanks to:

<p float="left">
<img src="https://github.com/epessina/Mapad/blob/master/App/screens/logo-polimi.jpg" height="200" alt="Logo Polimi">
<img src="https://github.com/epessina/Mapad/blob/master/App/screens/logo-areu.jpg" height="200" alt="Logo AREU">
</p>



## License
[GPL-3.0](https://choosealicense.com/licenses/gpl-3.0) © [Edoardo Pessina](edoardo2.pessina@mail.polimi.it)
