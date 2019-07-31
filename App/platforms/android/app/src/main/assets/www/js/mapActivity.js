"use strict";

class MapActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link MapActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        this.screen = $("#page--map");
        this.screen.height($(window).height());

        // Create the map object
        this.map = L.map("page--map", {
            zoomSnap              : 0,       // the zoom level will not be snapped after a pinch-zoom
            zoomAnimation         : true,    // enable zoom animation
            zoomAnimationThreshold: 4,       // don't animate the zoom if the difference exceeds 4
            fadeAnimation         : true,    // enable tile fade animation
            markerZoomAnimation   : true,    // markers animate their zoom with the zoom animation
            touchZoom             : "center" // pinch-zoom will zoom to the center of the view
        });

        // Add a basemap from OpenStreetMap to the map
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { errorTileUrl: "img/errorTile.png" }).addTo(this.map);

        this.map.setView([45.464161, 9.190336], 11);

    }

    /**
     * Returns the current ResetPasswordActivity instance if any, otherwise creates it.
     *
     * @returns {MapActivity} The activity instance.
     */
    static getInstance() {

        if (!MapActivity._instance)
            MapActivity._instance = new MapActivity();

        return MapActivity._instance;

    }


    /** Opens the activity. */
    open() {

        this.screen.show();

    }

}