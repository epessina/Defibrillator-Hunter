"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var app;
$(function () {
  if (window.cordova) document.addEventListener("deviceready", function () {
    return app = new App();
  }, false);else app = new App();
});

var App = function () {
  _createClass(App, null, [{
    key: "isCordova",
    get: function get() {
      return window.cordova;
    }
  }]);

  function App() {
    var _this = this;

    _classCallCheck(this, App);

    this._toReattachPositionWatcher = false;
    this._backPressedCount = 0;
    this.activityStack = [];
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("resume", this.onResume, false);

    if (App.isCordova) {
      document.addEventListener("backbutton", function () {
        return _this.onBackPressed();
      }, false);
    }

    i18next.use(i18nextXHRBackend).init({
      lng: "en",
      fallbackLng: "en",
      ns: "general",
      defaultNS: "general",
      backend: {
        loadPath: "./locales/{{lng}}/{{ns}}.json"
      }
    }).then(function () {
      i18next.on("languageChanged", function () {
        return console.log("lng changed to ".concat(i18next.language));
      });
      jqueryI18next.init(i18next, $);
      $("body").localize();

      _this.open();
    });
  }

  _createClass(App, [{
    key: "onBackPressed",
    value: function onBackPressed() {
      if (utils.isLoaderOpen || utils.isAlertOpen) return;

      if (utils.isImgScreenOpen) {
        utils.closeImgScreen();
        return;
      }

      app.activityStack[app.activityStack.length - 1].onBackPressed();
    }
  }, {
    key: "open",
    value: function open() {
      if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();else MapActivity.getInstance().open();
      $("#splash").hide();
    }
  }, {
    key: "onPause",
    value: function onPause() {
      console.log("onPause");

      if (MapActivity.hasInstance()) {
        if (MapActivity.getInstance().isPositionWatcherAttached) {
          app._toReattachPositionWatcher = true;
          MapActivity.getInstance().detachPositionWatcher();
        }
      }
    }
  }, {
    key: "onResume",
    value: function onResume() {
      console.log("onResume");

      if (app._toReattachPositionWatcher) {
        MapActivity.getInstance().checkGPSOn(function () {
          return MapActivity.getInstance().attachPositionWatcher();
        });
        app._toReattachPositionWatcher = false;
      }
    }
  }]);

  return App;
}();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var EditProfileActivity = function () {
  function EditProfileActivity() {
    var _this = this;

    _classCallCheck(this, EditProfileActivity);

    this._screen = $("#page--edit-profile");
    $("#edit-profile-close").click(function () {
      return utils.switchActivity(ProfileActivity.getInstance(), true, _this);
    });
    $("#edit-profile-done").click(function () {
      return _this.edit();
    });
    $("#edit-profile-age").change(function () {
      return utils.changeSelectorLabel("edit-profile-age", true);
    });
    $("#edit-profile-gender").change(function () {
      return utils.changeSelectorLabel("edit-profile-gender", true);
    });
    $("#edit-profile-occupation").change(function () {
      return utils.changeSelectorLabel("edit-profile-occupation", true);
    });
  }

  _createClass(EditProfileActivity, [{
    key: "open",
    value: function open() {
      var data = ProfileActivity.getInstance().userData;
      $("#edit-profile-name").val(data.name);
      $("#edit-profile-age").val(data.age);
      utils.changeSelectorLabel("edit-profile-age", true);
      $("#edit-profile-gender").val(data.gender);
      utils.changeSelectorLabel("edit-profile-gender", true);
      $("#edit-profile-occupation").val(data.occupation);
      utils.changeSelectorLabel("edit-profile-occupation", true);
      if (data.isRescuer) $("#edit-profile-rescuer").prop("checked", true);

      this._screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      this._screen.scrollTop(0).hide();

      $("#edit-profile-name").val("");
      $("#edit-profile-age").val("");
      utils.changeSelectorLabel("edit-profile-age", true);
      $("#edit-profile-gender").val("");
      utils.changeSelectorLabel("edit-profile-gender", true);
      $("#edit-profile-occupation").val("");
      utils.changeSelectorLabel("edit-profile-occupation", true);
      $("#edit-profile-rescuer").prop("checked", false);
    }
  }, {
    key: "edit",
    value: function edit() {
      var _this2 = this;

      utils.openLoader();
      var name = $("#edit-profile-name").val(),
          age = $("#edit-profile-age").val(),
          gender = $("#edit-profile-gender").val(),
          occupation = $("#edit-profile-occupation").val(),
          isRescuer = $("#edit-profile-rescuer").prop("checked");

      if (name === "") {
        utils.logOrToast(i18next.t("messages.mandatoryName"), "long");
        utils.closeLoader();
        return;
      }

      user.putProfile(LoginActivity.getInstance().userId, JSON.stringify({
        name: name,
        age: age,
        gender: gender,
        occupation: occupation,
        isRescuer: isRescuer
      })).then(function (data) {
        ProfileActivity.getInstance().userData.name = data.name;
        ProfileActivity.getInstance().userData.age = data.age;
        ProfileActivity.getInstance().userData.gender = data.gender;
        ProfileActivity.getInstance().userData.occupation = data.occupation;
        ProfileActivity.getInstance().userData.isRescuer = data.isRescuer;
        $("#profile-name").html(data.name);
        utils.closeLoader();

        _this2.close();
      })["catch"](function () {
        utils.closeLoader();
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!EditProfileActivity._instance) EditProfileActivity._instance = new EditProfileActivity();
      return EditProfileActivity._instance;
    }
  }]);

  return EditProfileActivity;
}();

_defineProperty(EditProfileActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var InfoActivity = function () {
  _createClass(InfoActivity, null, [{
    key: "dateOpts",
    get: function get() {
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
    }
  }]);

  function InfoActivity() {
    var _this = this;

    _classCallCheck(this, InfoActivity);

    this._screen = $("#page--info");
    this._placeholders = $("#page--info .placeholder");
    $("#info-close").click(function () {
      return _this.close();
    });
    $("#info-photo-thm").click(function () {
      utils.openImgScreen($(this).attr("src"));
    });
  }

  _createClass(InfoActivity, [{
    key: "open",
    value: function open(id) {
      utils.pushStackActivity(this);

      this._placeholders.addClass("ph-animate");

      this._screen.show();

      this.getDefibrillator(id);
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();

      this._screen.scrollTop(0).hide();

      $("#page--info .ph-hidden-content").hide();

      this._placeholders.removeClass("ph-animate").show();

      $("#info-delete").hide();
      $("#info-edit").hide();
      $("#info-createdAt .info-content").html("");
      $("#info-updatedAt .info-content").html("");
      $("#info-coordinates .info-content").html("");
      $("#info-accuracy .info-content").html("");
      $("#info-presence .info-content").html("");
      $("#info-locationCategory .info-content").html("");
      $("#info-visualReference .info-content").html("");
      $("#info-floor .info-content").html("");
      $("#info-temporalAccessibility .info-content").html("");
      $("#info-recovery .info-content").html("");
      $("#info-signage .info-content").html("");
      $("#info-brand .info-content").html("");
      $("#info-notes .info-content").html("");
      $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      this.close();
    }
  }, {
    key: "getDefibrillator",
    value: function getDefibrillator(id) {
      var _this2 = this;

      defibrillator.get(id).then(function (data) {
        $("#info-delete").show().unbind("click").click(function () {
          utils.createAlert("", i18next.t("dialogs.deleteConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
            utils.openLoader();
            defibrillator["delete"](id).then(function () {
              utils.closeLoader();

              _this2.close();
            })["catch"](function () {
              utils.closeLoader();
            });
          });
        });
        $("#info-edit").show().unbind("click").click(function () {
          InsertActivity.getInstance().openPut(data);

          _this2._screen.scrollTop(0);
        });

        _this2.show(data);
      })["catch"](function () {
        _this2.close();
      });
    }
  }, {
    key: "show",
    value: function show(data) {
      $("#info-point-value").html("".concat(i18next.t("info.points"), ": <span>").concat(data.value, "</span>"));

      var _loop = function _loop(key) {
        if (data.hasOwnProperty(key) && key !== "transportType" && key !== "value") $("#info-" + key + " .info-content").html(function () {
            var val = data[key];
            if (val === "") return "-";

            switch (key) {
              case "createdAt":
              case "updatedAt":
                return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);

              case "coordinates":
                return val[0] + ", " + val[1];

              case "accuracy":
                if (val === 0 || val === null) return i18next.t("info.unknown");
                return val + " " + i18next.t("info.accuracyUnit");

              case "locationCategory":
                var content = i18next.t("insert.locationCategory.enum." + val);
                if (data.transportType !== "") content += " (".concat(data.transportType, ")");
                return content;

              case "visualReference":
              case "floor":
              case "brand":
              case "notes":
                return val;

              default:
                return i18next.t("insert." + key + ".enum." + val);
            }
          });
      };

      for (var key in data) {
        _loop(key);
      }

      $("#info-photo-thm").attr("src", "".concat(settings.serverUrl, "/").concat(data.imageUrl));

      this._placeholders.hide().removeClass("ph-animate");

      $("#page--info .ph-hidden-content").show();
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!InfoActivity._instance) InfoActivity._instance = new InfoActivity();
      return InfoActivity._instance;
    }
  }]);

  return InfoActivity;
}();

_defineProperty(InfoActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var InsertActivity = function () {
  function InsertActivity() {
    _classCallCheck(this, InsertActivity);

    this._screen = $("#page--insert");
    this._$photoThm = $("#photo-thm");
    this._currOpenedDialog = null;
    this._currOpenedFullDialog = null;
    this._defId = null;
    this._oldPhoto = null;
    this._vals = {
      coordinates: "",
      coordinatesAccuracy: "",
      presence: "",
      locationCategory: "",
      transportType: "",
      visualReference: "",
      floor: "",
      temporalAccessibility: "",
      recovery: "",
      signage: "",
      brand: "",
      notes: "",
      photo: "",
      photoCoordinates: ""
    };
    this.initUI();
  }

  _createClass(InsertActivity, [{
    key: "open",
    value: function open() {
      var _this = this;

      utils.pushStackActivity(this);

      this._screen.show();

      if (!this._defId) {
        this._vals.coordinates = MapActivity.getInstance().currLatLng;
        this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;
        if (!defibrillatorDB.some(function (d) {
          return utils.haversineDistance(d.lat, d.lon, _this._vals.coordinates[0], _this._vals.coordinates[1]) <= 50;
        })) utils.createAlert("", i18next.t("dialogs.insert.defNotInOfficialDb"), i18next.t("dialogs.btnOk"));
      }
    }
  }, {
    key: "openPut",
    value: function openPut(def) {
      this._defId = def._id;
      this._vals.presence = def.presence;
      this._vals.locationCategory = def.locationCategory;
      this._vals.transportType = def.transportType;
      this._vals.visualReference = def.visualReference;
      this._vals.floor = def.floor;
      this._vals.temporalAccessibility = def.temporalAccessibility;
      this._vals.recovery = def.recovery;
      this._vals.signage = def.signage;
      this._vals.brand = def.brand;
      this._vals.notes = def.notes;
      this._vals.photo = "".concat(settings.serverUrl, "/").concat(def.imageUrl);
      this._oldPhoto = this._vals.photo;
      $("#presence-text").html(i18next.t("insert.presence.enum." + this._vals.presence));
      $("#location-text").html(i18next.t("insert.locationCategory.enum." + this._vals.locationCategory));
      $("#floor-text").html(this._vals.floor);
      $("#temporal-text").html(i18next.t("insert.temporalAccessibility.enum." + this._vals.temporalAccessibility));
      if (this._vals.recovery !== "") $("#recovery-text").html(i18next.t("insert.recovery.enum." + this._vals.recovery));
      if (this._vals.signage !== "") $("#signage-text").html(i18next.t("insert.signage.enum." + this._vals.signage));
      if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));

      this._$photoThm.find("img").attr("src", this._vals.photo).show();

      this._$photoThm.find("i").hide();

      this.open();
    }
  }, {
    key: "close",
    value: function close() {
      var _this2 = this;

      utils.popStackActivity();
      this._defId = null;
      this._oldPhoto = null;

      this._screen.scrollTop(0).hide();

      this._currOpenedDialog = null;
      this._currOpenedFullDialog = null;
      Object.keys(this._vals).forEach(function (v) {
        return _this2._vals[v] = "";
      });
      $("#presence-text").html(i18next.t("insert.presence.defaultText"));
      $("#location-text").html(i18next.t("insert.locationCategory.defaultText"));
      $("#floor-text").html(i18next.t("insert.floor.defaultText"));
      $("#temporal-text").html(i18next.t("insert.temporalAccessibility.defaultText"));
      $("#recovery-text").html(i18next.t("insert.recovery.defaultText"));
      $("#signage-text").html(i18next.t("insert.signage.defaultText"));
      $("#notes-text").html(i18next.t("insert.notes.defaultText"));

      this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

      this._$photoThm.find("i").show();
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      var _this3 = this;

      if (this._currOpenedDialog) {
        this.closeDialog(this._currOpenedDialog);
        return;
      }

      if (this._currOpenedFullDialog) {
        this.closeFullscreenDialog(this._currOpenedFullDialog);
        return;
      }

      utils.createAlert("", i18next.t("dialogs.insert.confirmClose"), i18next.t("dialogs.insert.btnKeepEditing"), null, i18next.t("dialogs.insert.btnDiscard"), function () {
        _this3.close();
      });
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this4 = this;

      $("#new-defibrillator-close").click(function () {
        utils.createAlert("", i18next.t("dialogs.insert.confirmClose"), i18next.t("dialogs.insert.btnKeepEditing"), null, i18next.t("dialogs.insert.btnDiscard"), function () {
          _this4.close();
        });
      });
      $("#new-defibrillator-done").click(function () {
        if (_this4._vals.presence === "") {
          utils.logOrToast(i18next.t("messages.mandatoryPresence"), "long");
          return;
        }

        if (_this4._vals.locationCategory === "") {
          utils.logOrToast(i18next.t("messages.mandatoryLocationCategory"), "long");
          return;
        }

        if (_this4._vals.floor === "") {
          utils.logOrToast(i18next.t("messages.mandatoryFloor"), "long");
          return;
        }

        if (_this4._vals.temporalAccessibility === "") {
          utils.logOrToast(i18next.t("messages.mandatoryTempAccessibility"), "long");
          return;
        }

        if (_this4._vals.photo === "") {
          utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
          return;
        }

        if (_this4._vals.locationCategory !== "transportStation") _this4._vals.transportType = "";
        if (!_this4._defId) _this4.post();else _this4.put();
      });
      $("#presence-request").click(function () {
        var toSelect;
        if (_this4._vals.presence === "") toSelect = "yes";else toSelect = _this4._vals.presence;
        $("input[name='presence'][value='" + toSelect + "']").prop("checked", "true");

        _this4.openDialog($("#dialog-presence"));
      });
      $("#presence-cancel").click(function () {
        return _this4.closeDialog($("#dialog-presence"));
      });
      $("#presence-ok").click(function () {
        _this4._vals.presence = $("input[name='presence']:checked").val();
        $("#presence-text").html(i18next.t("insert.presence.enum." + _this4._vals.presence));

        _this4.closeDialog($("#dialog-presence"));
      });
      var $locationSelect = $("#location-select"),
          $transportTypeSelect = $("#transport-type-select");
      $("#location-category-request").click(function () {
        if (_this4._vals.locationCategory === "transportStation") $("#transport-type-wrapper").show();else $("#transport-type-wrapper").hide();
        var categoryToSelect, transportTypeToSelect;
        if (_this4._vals.locationCategory === "") categoryToSelect = "none";else categoryToSelect = _this4._vals.locationCategory;
        $locationSelect.get(0).selectedIndex = $locationSelect.find("option[value=" + categoryToSelect + "]").index();
        utils.changeSelectorLabel("location-select");
        if (_this4._vals.transportType === "") transportTypeToSelect = "none";else transportTypeToSelect = _this4._vals.transportType;
        $transportTypeSelect.get(0).selectedIndex = $transportTypeSelect.find("option[value=" + transportTypeToSelect + "]").index();
        utils.changeSelectorLabel("transport-type-select");
        $("#location-reference").val(_this4._vals.visualReference);

        _this4.openFullscreenDialog($("#dialog-location"));
      });
      $locationSelect.change(function () {
        utils.changeSelectorLabel("location-select");
        if ($locationSelect.val() === "transportStation") $("#transport-type-wrapper").show();else $("#transport-type-wrapper").hide();
      });
      $transportTypeSelect.change(function () {
        return utils.changeSelectorLabel("transport-type-select");
      });
      $("#location-close").click(function () {
        return _this4.closeFullscreenDialog($("#dialog-location"));
      });
      $("#location-done").click(function () {
        _this4._vals.locationCategory = $locationSelect.val();

        if (_this4._vals.locationCategory === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryLocationCategory"), "long");
          return;
        }

        _this4._vals.transportType = $transportTypeSelect.val();

        if (_this4._vals.locationCategory === "transportStation" && _this4._vals.transportType === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryTransportType"), "long");
          return;
        }

        _this4._vals.visualReference = $("#location-reference").val();
        $("#location-text").html(i18next.t("insert.locationCategory.enum." + _this4._vals.locationCategory));

        _this4.closeFullscreenDialog($("#dialog-location"));
      });
      var newFloor = "";
      $("#floor-request").click(function () {
        var toShow;
        if (_this4._vals.floor === "") toShow = "0";else toShow = _this4._vals.floor;
        $("#floor-counter-value").html(toShow.toString());
        newFloor = _this4._vals.floor;

        _this4.openDialog($("#dialog-floor"));
      });
      $("#floor-counter-add").click(function () {
        if (newFloor === 10) return;
        newFloor++;
        $("#floor-counter-value").html(newFloor.toString());
      });
      $("#floor-counter-sub").click(function () {
        if (newFloor === -4) return;
        newFloor--;
        $("#floor-counter-value").html(newFloor.toString());
      });
      $("#floor-cancel").click(function () {
        return _this4.closeDialog($("#dialog-floor"));
      });
      $("#floor-ok").click(function () {
        if (newFloor === "") newFloor = 0;
        _this4._vals.floor = newFloor;
        $("#floor-text").html(_this4._vals.floor.toString());

        _this4.closeDialog($("#dialog-floor"));
      });
      $("#temporal-accessibility-request").click(function () {
        var toSelect;
        if (_this4._vals.temporalAccessibility === "") toSelect = "h24";else toSelect = _this4._vals.temporalAccessibility;
        $("input[name='temporalAccessibility'][value='" + toSelect + "']").prop("checked", "true");

        _this4.openDialog($("#dialog-temporal-accessibility"));
      });
      $("#temporal-cancel").click(function () {
        return _this4.closeDialog($("#dialog-temporal-accessibility"));
      });
      $("#temporal-ok").click(function () {
        _this4._vals.temporalAccessibility = $("input[name='temporalAccessibility']:checked").val();
        $("#temporal-text").html(i18next.t("insert.temporalAccessibility.enum." + _this4._vals.temporalAccessibility));

        _this4.closeDialog($("#dialog-temporal-accessibility"));
      });
      $("#recovery-request").click(function () {
        var toSelect;
        if (_this4._vals.recovery === "") toSelect = "immediate";else toSelect = _this4._vals.recovery;
        $("input[name='recovery'][value='" + toSelect + "']").prop("checked", "true");

        _this4.openDialog($("#dialog-recovery"));
      });
      $("#recovery-cancel").click(function () {
        return _this4.closeDialog($("#dialog-recovery"));
      });
      $("#recovery-ok").click(function () {
        _this4._vals.recovery = $("input[name='recovery']:checked").val();
        $("#recovery-text").html(i18next.t("insert.recovery.enum." + _this4._vals.recovery));

        _this4.closeDialog($("#dialog-recovery"));
      });
      $("#signage-request").click(function () {
        var toSelect;
        if (_this4._vals.signage === "") toSelect = "great";else toSelect = _this4._vals.signage;
        $("input[name='signage'][value='" + toSelect + "']").prop("checked", "true");

        _this4.openDialog($("#dialog-signage"));
      });
      $("#signage-cancel").click(function () {
        return _this4.closeDialog($("#dialog-signage"));
      });
      $("#signage-ok").click(function () {
        _this4._vals.signage = $("input[name='signage']:checked").val();
        $("#signage-text").html(i18next.t("insert.signage.enum." + _this4._vals.signage));

        _this4.closeDialog($("#dialog-signage"));
      });
      $("#notes-request").click(function () {
        $("#brand").val(_this4._vals.brand);
        $("#notes").val(_this4._vals.notes);

        _this4.openFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-close").click(function () {
        return _this4.closeFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-done").click(function () {
        _this4._vals.brand = $("#brand").val();
        _this4._vals.notes = $("#notes").val();
        $("#notes-text").html(i18next.t("insert.notes.editText"));

        _this4.closeFullscreenDialog($("#dialog-notes"));
      });

      this._$photoThm.click(function () {
        if (_this4._vals.photo === "") _this4.getPicture();else utils.openImgScreen(_this4._$photoThm.find("img").attr("src"), true, function () {
            return _this4.getPicture();
          }, function () {
            _this4._vals.photo = "";

            _this4._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

            _this4._$photoThm.find("i").show();
          });
      });

      $("#tmp-photo-input").change(function () {
        _this4._vals.photo = $("#tmp-photo-input")[0].files[0];
        var reader = new FileReader();

        reader.onloadend = function (e) {
          _this4._$photoThm.find("img").attr("src", e.target.result).show();

          _this4._$photoThm.find("i").hide();
        };

        reader.readAsDataURL(_this4._vals.photo);
      });
    }
  }, {
    key: "getPicture",
    value: function getPicture() {
      var _this5 = this;

      if (!App.isCordova) {
        $("#tmp-photo-input").click();
        return;
      }

      var opt = {
        quality: 30,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
      };
      navigator.camera.getPicture(function (fileURI) {
        var res = JSON.parse(fileURI);
        _this5._vals.photo = res.filename;
        var metadata = JSON.parse(res.json_metadata);

        if (metadata && metadata !== {}) {
          if (device.platform === "iOS") _this5._vals.photoCoordinates = [metadata.GPS.Latitude, metadata.GPS.Longitude];else _this5._vals.photoCoordinates = [metadata.gpsLatitude, metadata.gpsLatitude];
        }

        _this5._$photoThm.find("img").attr("src", _this5._vals.photo).show();

        _this5._$photoThm.find("i").hide();
      }, function (err) {
        console.log("Error taking picture ".concat(err));
        utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));
      }, opt);
    }
  }, {
    key: "post",
    value: function post() {
      var _this6 = this;

      utils.openLoader();
      var formData = new FormData();
      formData.append("coordinates", JSON.stringify(this._vals.coordinates));
      formData.append("coordinatesAccuracy", this._vals.coordinatesAccuracy);
      formData.append("presence", this._vals.presence);
      formData.append("locationCategory", this._vals.locationCategory);
      formData.append("transportType", this._vals.transportType);
      formData.append("visualReference", this._vals.visualReference);
      formData.append("floor", this._vals.floor);
      formData.append("temporalAccessibility", this._vals.temporalAccessibility);
      formData.append("recovery", this._vals.recovery);
      formData.append("signage", this._vals.signage);
      formData.append("brand", this._vals.brand);
      formData.append("notes", this._vals.notes);

      if (!App.isCordova) {
        formData.append("image", this._vals.photo);
        defibrillator.post(formData).then(function (data) {
          utils.closeLoader();
          defibrillator.show(data.id, data.coords);
          InsertActivity.getInstance().close();
        });
        return;
      }

      formData.append("imageCoordinates", this._vals.photoCoordinates);
      utils.appendFile(formData, this._vals.photo).then(function (formData) {
        return defibrillator.post(formData);
      }).then(function (data) {
        utils.closeLoader();
        defibrillator.show(data.id, data.coords);

        _this6.close();
      });
    }
  }, {
    key: "put",
    value: function put() {
      utils.openLoader();
      var formData = new FormData();
      formData.append("presence", this._vals.presence);
      formData.append("locationCategory", this._vals.locationCategory);
      formData.append("transportType", this._vals.transportType);
      formData.append("visualReference", this._vals.visualReference);
      formData.append("floor", this._vals.floor);
      formData.append("temporalAccessibility", this._vals.temporalAccessibility);
      formData.append("recovery", this._vals.recovery);
      formData.append("signage", this._vals.signage);
      formData.append("brand", this._vals.brand);
      formData.append("notes", this._vals.notes);

      if (!App.isCordova) {
        if (this._vals.photo !== this._oldPhoto) formData.append("image", this._vals.photo);
        defibrillator.put(this._defId, formData).then(function (data) {
          utils.closeLoader();
          InfoActivity.getInstance().getDefibrillator(data.id);
          InsertActivity.getInstance().close();
        })["catch"](function () {
          utils.closeLoader();
        });
        return;
      }

      var file = null;

      if (this._vals.photo !== this._oldPhoto) {
        formData.append("imageCoordinates", this._vals.photoCoordinates);
        file = this._vals.photo;
      }

      utils.appendFile(formData, file).then(function (formData) {
        return defibrillator.put(InsertActivity.getInstance()._defId, formData);
      }).then(function (data) {
        InfoActivity.getInstance().getDefibrillator(data.id);
        utils.closeLoader();
        InsertActivity.getInstance().close();
      });
    }
  }, {
    key: "openFullscreenDialog",
    value: function openFullscreenDialog(dialog) {
      dialog.show();
      this._currOpenedFullDialog = dialog;
    }
  }, {
    key: "closeFullscreenDialog",
    value: function closeFullscreenDialog(dialog) {
      dialog.scrollTop(0).hide();
      this._currOpenedFullDialog = null;
    }
  }, {
    key: "openDialog",
    value: function openDialog(toOpen) {
      $("#opaque-overlay").show();
      $("#page--insert").css("overflow-y", "hidden");
      toOpen.show();
      this._currOpenedDialog = toOpen;
    }
  }, {
    key: "closeDialog",
    value: function closeDialog(toClose) {
      toClose.hide();
      $("#opaque-overlay").hide();
      $("#page--insert").css("overflow-y", "scroll");
      this._currOpenedDialog = null;
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!InsertActivity._instance) InsertActivity._instance = new InsertActivity();
      return InsertActivity._instance;
    }
  }]);

  return InsertActivity;
}();

_defineProperty(InsertActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var LoginActivity = function () {
  function LoginActivity() {
    var _this = this;

    _classCallCheck(this, LoginActivity);

    this.screen = $("#page--log-in");
    this.token = null;
    this.userId = null;
    var $authFooter = $(".auth-footer");
    window.addEventListener("keyboardWillShow", function () {
      return $authFooter.hide();
    });
    window.addEventListener("keyboardWillHide", function () {
      return $authFooter.show();
    });
    $("#link--reset-password").click(function () {
      return utils.switchActivity(ResetPasswordActivity.getInstance());
    });
    $("#btn--login").click(function () {
      return _this.login();
    });
    $("#link--register").click(function () {
      return utils.switchActivity(RegisterActivity.getInstance(), true, _this);
    });
  }

  _createClass(LoginActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.screen.scrollTop(0).hide();
      $("#field--login-email").val("");
      $("#field--login-password").val("");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (app._backPressedCount === 0) {
        utils.logOrToast(i18next.t("messages.backButton"), "short");
        app._backPressedCount++;
        setInterval(function () {
          return app._backPressedCount = 0;
        }, 2000);
      } else navigator.app.exitApp();
    }
  }, {
    key: "getAuthStatus",
    value: function getAuthStatus() {
      var token = localStorage.getItem("mapad-token"),
          expireDate = localStorage.getItem("mapad-expireDate");
      if (!token || !expireDate) return false;

      if (new Date(expireDate) <= new Date()) {
        this.logout();
        return false;
      }

      this.token = token;
      this.userId = localStorage.getItem("mapad-userId");
      return true;
    }
  }, {
    key: "login",
    value: function login() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--login-email").val(),
          password = $("#field--login-password").val();

      if (email === "" || password === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.validCredentials"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/login"), {
        method: "POST",
        headers: {
          "App-Key": settings.APIKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (resData) {
        _this2.token = resData.token;
        _this2.userId = resData.userId;
        localStorage.setItem("mapad-token", resData.token);
        localStorage.setItem("mapad-userId", resData.userId);
        var remainingMilliseconds = 24 * 60 * 60 * 1000,
            expireDate = new Date(new Date().getTime() + remainingMilliseconds);
        localStorage.setItem("mapad-expireDate", expireDate.toISOString());
        if (MapActivity.hasInstance()) MapActivity.deleteInstance();
        utils.switchActivity(MapActivity.getInstance(), true, _this2);
        utils.closeLoader();
      })["catch"](function (err) {
        console.error(err);
        $("#field--login-password").val("");
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.logOrToast(i18next.t("messages.login401"), "long");
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 460:
            _this2.createResendEmailDialog();

            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "createResendEmailDialog",
    value: function createResendEmailDialog() {
      var $alertOverlay = $("#alert-dialog-overlay");
      $alertOverlay.find(".dialog-title").html(i18next.t("auth.login.notVerifiedTitle"));
      $alertOverlay.find(".dialog-text").html("\n            <p>".concat(i18next.t("auth.login.notVerifiedMessage"), "</p>\n            <p class=\"dialog-link\" onclick=\"LoginActivity.getInstance().resendConfirmationEmail()\">\n                ").concat(i18next.t("auth.login.resendEmailLink"), "\n            </p>\n        "));
      $("#alert-first-button").html(i18next.t("dialogs.btnOk")).unbind("click").click(function () {
        return utils.closeAlert();
      });
      $alertOverlay.find(".dialog-wrapper").show();
      $alertOverlay.show();
    }
  }, {
    key: "resendConfirmationEmail",
    value: function resendConfirmationEmail() {
      utils.closeAlert();
      utils.openLoader();
      var email = $("#field--login-email").val();

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/confirmation/resend"), {
        method: "POST",
        headers: {
          "App-Key": settings.APIKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resendEmailSuccessTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resendConfEmail404"), i18next.t("dialogs.btnOk"));
            break;

          case 409:
            utils.createAlert(i18next.t("dialogs.titleResendConfEmail409"), i18next.t("dialogs.resendConfEmail409"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resendConfEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      this.token = null;
      this.userId = null;
      localStorage.removeItem("mapad-token");
      localStorage.removeItem("mapad-expireDate");
      localStorage.removeItem("mapad-userId");
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!LoginActivity._instance) LoginActivity._instance = new LoginActivity();
      return LoginActivity._instance;
    }
  }]);

  return LoginActivity;
}();

_defineProperty(LoginActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MapActivity = function () {
  _createClass(MapActivity, null, [{
    key: "defaultLatLng",
    get: function get() {
      return [45.464161, 9.190336];
    }
  }, {
    key: "defaultZoom",
    get: function get() {
      return 11;
    }
  }, {
    key: "watcherZoom",
    get: function get() {
      return 17;
    }
  }]);

  function MapActivity() {
    var _this = this;

    _classCallCheck(this, MapActivity);

    $("#map-wrapper").html("\n        \n            <div style=\"display: none\" id=\"page--map\">\n\n                <div style=\"display: none\" id=\"finding-position-msg\"><p data-i18n=\"map.positionFinding\"></p></div>\n            \n                <div id=\"map-control-profile\" class=\"map-control map-control-left map-control-top-1 fab\">\n                    <i class=\"material-icons fab-icon\">perm_identity</i>\n                </div>\n            \n                <div id=\"map-control-gps\" class=\"map-control map-control-right map-control-top-1 fab\">\n                    <i class=\"material-icons fab-icon\">gps_fixed</i>\n                </div>\n            \n                <div id=\"map-new-defibrillator\" class=\"map-control map-control-center map-control-bottom fab-extended\">\n                    <p class=\"fab-extended-text\" data-i18n=\"map.fabText\"></p>\n                </div>\n            \n            </div>\n        \n        ");
    $("#finding-position-msg p").localize();
    $("#map-new-defibrillator").localize();
    this._screen = $("#page--map");

    this._screen.height($(window).height());

    this._map = L.map("page--map", {
      zoomSnap: 0,
      zoomAnimation: true,
      zoomAnimationThreshold: 4,
      fadeAnimation: true,
      markerZoomAnimation: true,
      touchZoom: "center"
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      errorTileUrl: "img/errorTile.png"
    }).addTo(this._map);
    this._centerMap = true;
    this._autoZoom = true;
    this._clusterClick = false;
    this._isFirstPositionFound = true;
    this.isPositionWatcherAttached = false;
    this.initUI();
    this.markersLayer = L.markerClusterGroup();
    this.markersLayer.on("clusterclick", function () {
      return _this._clusterClick = true;
    });
    this.markersLayer.on("animationend", function () {
      return _this._clusterClick = false;
    });

    this._map.addLayer(this.markersLayer);

    this.initPositionMarker();
    if (!App.isCordova) return;
    this._d = cordova.plugins.diagnostic;
    this.registerGPSWatcher();
  }

  _createClass(MapActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);

      this._screen.show();

      this._map.setView(MapActivity.defaultLatLng, MapActivity.defaultZoom);

      this.positionMarker.setLatLng(MapActivity.defaultLatLng);
      if (App.isCordova) this.checkLocationPermissions();
      defibrillator.showAll();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();

      this._screen.hide();

      this.markersLayer.clearLayers();
      defibrillator.markers = [];
      this.detachPositionWatcher();
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (app._backPressedCount === 0) {
        utils.logOrToast(i18next.t("messages.backButton"), "short");
        app._backPressedCount++;
        setInterval(function () {
          return app._backPressedCount = 0;
        }, 2000);
      } else navigator.app.exitApp();
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this2 = this;

      $(".leaflet-control-container").hide();
      $("#map-control-profile").click(function () {
        return ProfileActivity.getInstance().open();
      });
      this._$gps = $("#map-control-gps");

      this._$gps.click(function () {
        return _this2.handleGPSButton();
      });

      $("#map-new-defibrillator").click(function () {
        return InsertActivity.getInstance().open();
      });

      this._map.on("dragstart", function () {
        return _this2.freeMap();
      });

      this._map.on("zoomstart", function () {
        if (!_this2._autoZoom || _this2._clusterClick) _this2.freeMap();
      });

      this._map.on("moveend", function () {
        if (_this2._clusterClick) return;

        if (!_this2._centerMap && _this2._autoZoom) {
          _this2._centerMap = true;
          _this2._autoZoom = false;
        }
      });
    }
  }, {
    key: "initPositionMarker",
    value: function initPositionMarker() {
      var _this3 = this;

      var positionMarkerIcon = L.icon({
        iconUrl: "img/user-marker.png",
        iconRetinaUrl: "img/user-marker-2x.png",
        iconSize: [37, 37],
        iconAnchor: [19, 19]
      });
      this.positionMarker = L.marker(MapActivity.defaultLatLng, {
        icon: positionMarkerIcon,
        draggable: true,
        zIndexOffset: 1000
      });
      this.currLatLng = MapActivity.defaultLatLng;
      this.currLatLngAccuracy = 0;
      this._accuracyCircle = undefined;
      this.positionMarker.on("dragstart", function () {
        _this3._isFirstPositionFound = true;

        _this3.detachPositionWatcher();

        if (_this3._accuracyCircle !== undefined) {
          _this3._map.removeLayer(_this3._accuracyCircle);

          _this3._accuracyCircle = undefined;
        }
      });
      this.positionMarker.on("dragend", function (e) {
        _this3.currLatLng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        _this3.currLatLngAccuracy = 0;
        console.log("Position marker dragged to ".concat(_this3.currLatLng));
      });
      this.positionMarker.addTo(this._map);
    }
  }, {
    key: "freeMap",
    value: function freeMap() {
      this._centerMap = false;

      this._$gps.removeClass("gps-on");
    }
  }, {
    key: "registerGPSWatcher",
    value: function registerGPSWatcher() {
      var _this4 = this;

      this._d.registerLocationStateChangeHandler(function (state) {
        if (device.platform === "Android" && state !== _this4._d.locationMode.LOCATION_OFF || device.platform === "iOS" && (state === _this4._d.permissionStatus.GRANTED || state === _this4._d.permissionStatus.GRANTED_WHEN_IN_USE)) {
          console.log("GPS turned on");

          _this4._$gps.children("i").html("gps_fixed");

          _this4._isFirstPositionFound = true;
          _this4._centerMap = true;
          _this4._autoZoom = true;

          _this4.attachPositionWatcher();
        } else {
            console.log("GPS turned off");

            _this4._$gps.removeClass("gps-on").children("i").html("gps_off");

            _this4.detachPositionWatcher();

            utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
          }
      });
    }
  }, {
    key: "checkLocationPermissions",
    value: function checkLocationPermissions() {
      var _this5 = this;

      this._d.getLocationAuthorizationStatus(function (status) {
        console.log(status);

        if (status === _this5._d.permissionStatus.NOT_REQUESTED || device.platform === "Android" && status === _this5._d.permissionStatus.DENIED_ALWAYS) {
          console.log("Permission not requested");

          _this5.requestLocationPermission();
        } else if (status === _this5._d.permissionStatus.DENIED) {
            console.log("Permission denied");

            _this5._$gps.removeClass("gps-on").children("i").html("gps_off");
          } else if (status === _this5._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this5._d.permissionStatus.GRANTED_WHEN_IN_USE) {
              console.log("Permission granted");

              _this5.checkGPSOn(function () {
                return _this5.attachPositionWatcher();
              });
            }
      }, function (err) {
        console.error("Error checking the permissions: ".concat(err));

        _this5._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "requestLocationPermission",
    value: function requestLocationPermission() {
      var _this6 = this;

      this._d.requestLocationAuthorization(function (status) {
        if (status === _this6._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this6._d.permissionStatus.GRANTED_WHEN_IN_USE) {
          console.log("Permission granted");

          _this6.checkGPSOn(function () {
            return _this6.attachPositionWatcher();
          });
        } else {
            console.log("Permission denied");

            _this6._$gps.removeClass("gps-on").children("i").html("gps_off");
          }
      }, function (err) {
        console.error("Error requesting the location authorization", err);

        _this6._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert("", i18next.t("dialogs.map.permissionsRequestError"), i18next.t("dialogs.btnOk"));
      }, this._d.locationAuthorizationMode.ALWAYS);
    }
  }, {
    key: "checkGPSOn",
    value: function checkGPSOn(callback) {
      var _this7 = this;

      this._d.isLocationEnabled(function (enabled) {
        if (enabled) {
          console.log("GPS on");

          _this7._$gps.children("i").html("gps_fixed");

          callback();
        } else {
            console.log("GPS off");

            _this7._$gps.removeClass("gps-on").children("i").html("gps_off");

            utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
          }
      }, function (err) {
        console.error("Cannot determine if the location is enabled", err);

        _this7._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert("", i18next.t("dialogs.map.gpsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "handleGPSButton",
    value: function handleGPSButton() {
      var _this8 = this;

      if (!App.isCordova) return;

      if (this._$gps.hasClass("gps-on")) {
        console.log("Watcher already on");
        return;
      }

      this._d.getLocationAuthorizationStatus(function (status) {
        if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED) {
          console.log("Permission denied but can be requested");

          _this8.requestLocationPermission();
        } else if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED_ALWAYS || device.platform === "iOS" && status === _this8._d.permissionStatus.DENIED) {
            console.log("Cannot request the permission again.");

            _this8._$gps.removeClass("gps-on").children("i").html("gps_off");

            utils.createAlert("", i18next.t("dialogs.map.cannotRequestPermissions"), i18next.t("dialogs.btnOk"));
          } else {
              console.log("Permission granted");

              _this8.checkGPSOn(function () {
                _this8._autoZoom = true;

                if (_this8._isFirstPositionFound) {
                  _this8._centerMap = true;

                  _this8.attachPositionWatcher();

                  return;
                }

                if (_this8._map.getZoom() < 15) _this8._map.flyTo(_this8.currLatLng, MapActivity.watcherZoom);else _this8._map.flyTo(_this8.currLatLng);

                _this8.attachPositionWatcher();
              });
            }
      }, function (err) {
        console.error("Error checking the permissions ".concat(err));

        _this8._$gps.removeClass("gps-on").children("i").html("gps_off");

        utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "attachPositionWatcher",
    value: function attachPositionWatcher() {
      this._$gps.addClass("gps-on");

      if (this.isPositionWatcherAttached) return;
      $("#finding-position-msg").show();
      this._positionWatcherId = navigator.geolocation.watchPosition(this.onPositionSuccess.bind(this), function (err) {
        return console.error("Error finding the position ".concat(err));
      }, {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
      this.isPositionWatcherAttached = true;
      console.log("Position watcher attached");
    }
  }, {
    key: "detachPositionWatcher",
    value: function detachPositionWatcher() {
      if (!this.isPositionWatcherAttached) return;

      this._$gps.removeClass("gps-on");

      navigator.geolocation.clearWatch(this._positionWatcherId);
      this.isPositionWatcherAttached = false;
      console.log("Position watcher detached");
    }
  }, {
    key: "onPositionSuccess",
    value: function onPositionSuccess(pos) {
      this.currLatLng = [pos.coords.latitude, pos.coords.longitude];
      this.currLatLngAccuracy = pos.coords.accuracy;
      console.log("Position found");
      $("#finding-position-msg").hide();

      if (this._isFirstPositionFound) {
        this._map.setView(this.currLatLng, MapActivity.watcherZoom);

        this._isFirstPositionFound = false;
        this._autoZoom = false;
      } else if (this._centerMap) {
          this._map.panTo(this.currLatLng);
        }

      this.positionMarker.setLatLng(this.currLatLng);
      if (this._accuracyCircle !== undefined) this._map.removeLayer(this._accuracyCircle);
      this._accuracyCircle = L.circle(this.currLatLng, {
        radius: this.currLatLngAccuracy / 2,
        color: "green",
        opacity: .5
      }).addTo(this._map);
    }
  }], [{
    key: "hasInstance",
    value: function hasInstance() {
      return !!MapActivity._instance;
    }
  }, {
    key: "deleteInstance",
    value: function deleteInstance() {
      MapActivity._instance = null;
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      if (!MapActivity._instance) MapActivity._instance = new MapActivity();
      return MapActivity._instance;
    }
  }]);

  return MapActivity;
}();

_defineProperty(MapActivity, "_instance", void 0);
"use strict";

var defibrillator = {
  _icon: L.icon({
    iconUrl: "img/def-marker.png",
    iconRetinaUrl: "img/def-marker-2x.png",
    shadowUrl: "img/def-marker-shadow.png",
    shadowRetinaUrl: "img/def-marker-shadow-2x.png",
    iconSize: [31, 37],
    shadowSize: [31, 19],
    iconAnchor: [31, 37],
    shadowAnchor: [18, 18]
  }),
  markers: [],
  show: function show(id, coordinates) {
    var marker = L.marker(coordinates, {
      icon: defibrillator._icon,
      draggable: false
    });
    marker._id = id;
    marker.on("click", function () {
      return InfoActivity.getInstance().open(id);
    });
    defibrillator.markers.push(marker);
    MapActivity.getInstance().markersLayer.addLayer(marker);
  },
  showAll: function showAll() {
    MapActivity.getInstance().markersLayer.clearLayers();
    defibrillator.markers = [];
    if (utils.isTokenExpired()) return;
    var id = LoginActivity.getInstance().userId;
    fetch("".concat(settings.serverUrl, "/defibrillator/user/").concat(id), {
      headers: {
        "App-Key": settings.APIKey,
        Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
      }
    }).then(function (res) {
      if (res.status !== 200) {
        var err = new Error();
        err.code = res.status;
        throw err;
      }

      return res.json();
    }).then(function (data) {
      data.defibrillators.forEach(function (d) {
        return defibrillator.show(d._id, d.coordinates);
      });
    })["catch"](function (err) {
      console.error(err);
      utils.closeLoader();

      switch (err.code) {
        case 401:
          utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getDefibrillators401"), i18next.t("dialogs.btnOk"));
          break;

        case 403:
          utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
          break;

        default:
          utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getDefibrillators500"), i18next.t("dialogs.btnOk"));
          break;
      }
    });
  },
  get: function get(id) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/defibrillator/").concat(id), {
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        }
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.defibrillator);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getDefibrillator401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getDefibrillator404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getDefibrillator500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  post: function post(formData) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/defibrillator/post?if=def"), {
        method: "POST",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve({
          id: data.defibrillator._id,
          coords: data.defibrillator.coordinates
        });
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postDefibrillator401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.postDefibrillator422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.postDefibrillator500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  put: function put(id, formData) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/defibrillator/").concat(id, "?if=def"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve({
          id: data.defibrillatorId
        });
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putDefibrillator401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putDefibrillator404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.putDefibrillator422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putDefibrillator500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  "delete": function _delete(id) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/defibrillator/").concat(id), {
        method: "DELETE",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        }
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        var newMarkers = [];
        defibrillator.markers.forEach(function (m) {
          if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);else newMarkers.push(m);
        });
        defibrillator.markers = newMarkers;
        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteDefibrillator401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteDefibrillator404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.deleteDefibrillator500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  }
};
"use strict";

var user = {
  get: function get(id) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/profile/").concat(id), {
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        }
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getUser401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getUser404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getUser500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putProfilePicture: function putProfilePicture(id, formData) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/update-picture?if=prof"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.imageUrl);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putProfileImage401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putProfileImage404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putProfileImage500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putEmail: function putEmail(id, newEmail) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-email"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newEmail
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changeEmail401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 409:
            utils.logOrToast(i18next.t("messages.register409"), "long");
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changeEmail404"), i18next.t("dialogs.btnOk"));
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changeEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putPassword: function putPassword(id, oldPw, newPw, confirmPw) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-password"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword: oldPw,
          newPassword: newPw,
          confirmPassword: confirmPw
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changePw401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changePw404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.changePw422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changePw500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  },
  putProfile: function putProfile(id, json) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }

      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/update-profile"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: json
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.editProfile401"), i18next.t("dialogs.btnOk"));
            break;

          case 403:
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.editProfile404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.editProfile422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.editProfile500"), i18next.t("dialogs.btnOk"));
            break;
        }

        reject();
      });
    });
  }
};
"use strict";

var utils = {
  _$alertOverlay: $("#alert-dialog-overlay"),
  isLoaderOpen: false,
  isAlertOpen: false,
  isImgScreenOpen: false,
  switchActivity: function switchActivity(toOpen) {
    var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var toClose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (close) toClose.close();
    toOpen.open();
  },
  pushStackActivity: function pushStackActivity(activity) {
    return app.activityStack.push(activity);
  },
  popStackActivity: function popStackActivity() {
    return app.activityStack.pop();
  },
  isTokenExpired: function isTokenExpired() {
    var expireDate = localStorage.getItem("mapad-expireDate");
    if (expireDate && new Date(expireDate) > new Date() || app.isGuest) return false;

    for (var i = app.activityStack.length - 1; i >= 0; i--) {
      app.activityStack[i].close();
    }

    LoginActivity.getInstance().logout();
    LoginActivity.getInstance().open();
    utils.closeLoader();
    utils.closeAlert();
    utils.createAlert("", i18next.t("dialogs.tokenExpired"), i18next.t("dialogs.btnOk"));
    return true;
  },
  appendFile: function appendFile(formData, fileUri) {
    return new Promise(function (resolve, reject) {
      if (!fileUri) {
        resolve(formData);
        return;
      }

      window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
        fileEntry.file(function (file) {
          var reader = new FileReader();

          reader.onloadend = function (e) {
            var blob = new Blob([new Uint8Array(e.target.result)], {
              type: "image/jpeg"
            });
            formData.append("image", blob);
            resolve(formData);
          };

          reader.onerror = function (fileReadResult) {
            console.error("Reader error ".concat(fileReadResult));
            utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
            reject();
          };

          reader.readAsArrayBuffer(file);
        }, function (err) {
          console.error("Error getting the fileEntry file ".concat(err));
          utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
          reject();
        });
      }, function (err) {
        console.error("Error getting the file ".concat(err));
        utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
        reject();
      });
    });
  },
  createAlert: function createAlert(title, msg, btn1) {
    var clbBtn1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var btn2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var clbBtn2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    if (title === "") utils._$alertOverlay.find(".dialog-title").hide();else utils._$alertOverlay.find(".dialog-title").html(title);

    utils._$alertOverlay.find(".dialog-text").html(msg);

    $("#alert-first-button").html(btn1).unbind("click").click(function () {
      utils.closeAlert();
      if (clbBtn1) clbBtn1();
    });

    if (btn2) {
      $("#alert-second-button").show().html(btn2).unbind("click").click(function () {
        utils.closeAlert();
        if (clbBtn2) clbBtn2();
      });
    }

    utils._$alertOverlay.find(".dialog-wrapper").show();

    utils._$alertOverlay.show();

    utils.isAlertOpen = true;
  },
  closeAlert: function closeAlert() {
    utils._$alertOverlay.hide().children(".dialog-text").html("");

    utils._$alertOverlay.find(".dialog-title").show().html("");

    $("#alert-second-button").hide();

    utils._$alertOverlay.find(".dialog-wrapper").hide();

    utils.isAlertOpen = false;
  },
  openLoader: function openLoader() {
    utils._$alertOverlay.find(".spinner-wrapper").show();

    utils._$alertOverlay.show();

    utils.isLoaderOpen = true;
  },
  closeLoader: function closeLoader() {
    utils._$alertOverlay.hide();

    utils._$alertOverlay.find(".spinner-wrapper").hide();

    utils.isLoaderOpen = false;
  },
  logOrToast: function logOrToast(msg, duration) {
    if (!App.isCordova) {
      console.log(msg);
      return;
    }

    window.plugins.toast.show(msg, duration, "bottom");
  },
  changeSelectorLabel: function changeSelectorLabel(selectorId) {
    var changeColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var $selector = $("#".concat(selectorId)),
        $label = $("[for='".concat(selectorId, "'")).find(".label-description");

    if ($selector.val() === "none") {
      $label.html(i18next.t("selectors.".concat(selectorId, "DefLabel")));
      if (changeColor) $label.css("color", "#757575");
    } else {
        $label.html($selector.find("option:selected").text());
        if (changeColor) $label.css("color", "#000000");
      }
  },
  resetSelector: function resetSelector(selectorId) {
    $("#" + selectorId).get(0).selectedIndex = 0;
    utils.changeSelectorLabel(selectorId);
  },
  openImgScreen: function openImgScreen(scr) {
    var editable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var clbEdit = arguments.length > 2 ? arguments[2] : undefined;
    var clbCancel = arguments.length > 3 ? arguments[3] : undefined;
    $("#img-screen-container img").attr("src", scr);
    $("#img-screen-close").click(function () {
      return utils.closeImgScreen();
    });

    if (editable) {
      $("#img-screen-edit").unbind("click").click(function () {
        utils.closeImgScreen();
        clbEdit();
      }).parent().show();
      $("#img-screen-delete").show().unbind("click").click(function () {
        utils.createAlert("", i18next.t("dialogs.photoScreen.deletePictureConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          clbCancel();
          utils.closeImgScreen();
        });
      }).parent().show();
    }

    $("#img-screen").show();
    utils.isImgScreenOpen = true;
  },
  closeImgScreen: function closeImgScreen() {
    $("#img-screen").hide();
    $("#img-screen-container img").attr("src", "");
    $("#img-screen-edit").parent().hide();
    $("#img-screen-delete").parent().hide();
    utils.isImgScreenOpen = false;
  },
  deg2rad: function deg2rad(deg) {
    return deg * Math.PI / 180;
  },
  haversineDistance: function haversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = utils.deg2rad(lat2 - lat1),
        dLon = utils.deg2rad(lon2 - lon1);
    var sinDLat = Math.sin(dLat / 2),
        sinDLon = Math.sin(dLon / 2);
    var a = Math.pow(sinDLat, 2) + Math.pow(sinDLon, 2) * Math.cos(utils.deg2rad(lat1)) * Math.cos(utils.deg2rad(lat2));
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ProfileActivity = function () {
  function ProfileActivity() {
    _classCallCheck(this, ProfileActivity);

    this._screen = $("#page--profile");
    this._placeholders = $("#page--profile .placeholder");
    this._hiddenContent = $("#page--profile .ph-hidden-content");
    this.userData = null;
    this._isPhotoMenuOpen = false;
    this._openedSetting = null;
    this.initUi();
    this.initPhotoMenu();
    this.initAccountUi();
  }

  _createClass(ProfileActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);

      this._screen.show();

      this.populateProfile();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();

      this._screen.scrollTop(0).hide();

      this.userData = null;
      $("#profile-update").css("visibility", "hidden");
      $("#profile-name").html("");
      $("#profile-email").html("");
      $("#mapped-def-number").html("");
      $("#points-number").html("");
      $("#position-number").html("");
      $("#profile-photo").attr("src", "img/default-profile-img-120.png");
      this._isPhotoMenuOpen = false;
      this._openedSetting = null;
      $("#page--profile .ph-hidden-content").hide();

      this._placeholders.removeClass("ph-animate").show();
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (this._isPhotoMenuOpen) {
        this.closePhotoMenu();
        return;
      }

      if (this._openedSetting) {
        this.closeSetting(this._openedSetting);
        return;
      }

      this.close();
    }
  }, {
    key: "initUi",
    value: function initUi() {
      var _this = this;

      $("#profile-back").click(function () {
        return _this.close();
      });
      $("#profile-update").click(function () {
        return _this.populateProfile();
      });
      $("#settings-account-wrapper").click(function () {
        $("#page--account-settings").show();
        _this._openedSetting = "account";
      });
      $("#settings-leaderboard-wrapper").click(function () {
        utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");
      });
      $("#settings-language-wrapper").click(function () {
        utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");
      });
      $("#settings-help-wrapper").click(function () {
        utils.logOrToast(i18next.t("profile.settings.notImplemented"), "long");
      });
    }
  }, {
    key: "populateProfile",
    value: function populateProfile() {
      var _this2 = this;

      this._hiddenContent.hide();

      this._placeholders.addClass("ph-animate");

      user.get(LoginActivity.getInstance().userId).then(function (data) {
        _this2.userData = data;
        $("#profile-update").css("visibility", "visible");
        if (_this2.userData.imageUrl !== "") $("#profile-photo").attr("src", "".concat(settings.serverUrl, "/").concat(_this2.userData.imageUrl));
        $("#profile-name").html(_this2.userData.name);
        $("#profile-email").html(_this2.userData.email);
        $("#mapped-def-number").html(_this2.userData.defNumber);
        $("#points-number").html(_this2.userData.points);
        $("#position-number").html(_this2.userData.position);

        _this2._placeholders.hide().removeClass("ph-animate");

        $("#page--profile .ph-hidden-content").show();
      })["catch"](function () {
        _this2.close();
      });
    }
  }, {
    key: "initPhotoMenu",
    value: function initPhotoMenu() {
      var _this3 = this;

      $("#profile-photo").click(function () {
        if ($("#profile-photo").attr("src") !== "img/default-profile-img-120.png") $("#profile-photo-delete").show();
        $("#profile-photo-dialog-overlay").show();
        _this3._isPhotoMenuOpen = true;
      });
      $("#profile-photo-camera").click(function () {
        _this3.closePhotoMenu();

        _this3.changePhoto(true);
      });
      $("#profile-photo-gallery").click(function () {
        _this3.closePhotoMenu();

        _this3.changePhoto(false);
      });
      $("#profile-photo-delete").click(function () {
        utils.openLoader();

        _this3.closePhotoMenu();

        utils.createAlert("", i18next.t("profile.photoDialog.deleteConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          user.putProfilePicture(LoginActivity.getInstance().userId, new FormData()).then(function () {
            utils.closeLoader();
            $("#profile-photo").attr("src", "img/default-profile-img-120.png");
          })["catch"](function () {
            utils.closeLoader();
          });
        });
      });
      $("#profile-photo-cancel").click(function () {
        return _this3.closePhotoMenu();
      });
      $("#tmp-profile-photo-input").change(function () {
        var photo = $("#tmp-profile-photo-input")[0].files[0];
        var reader = new FileReader();

        reader.onloadend = function (e) {
          utils.openLoader();
          var formData = new FormData();
          formData.append("image", photo);
          user.putProfilePicture(LoginActivity.getInstance().userId, formData).then(function (url) {
            utils.closeLoader();
            $("#profile-photo").attr("src", "".concat(settings.serverUrl, "/").concat(url));
          });
        };

        reader.readAsDataURL(photo);
      });
    }
  }, {
    key: "closePhotoMenu",
    value: function closePhotoMenu() {
      this._isPhotoMenuOpen = false;
      $("#profile-photo-dialog-overlay").hide();
      $("#profile-photo-delete").hide();
    }
  }, {
    key: "changePhoto",
    value: function changePhoto(fromCamera) {
      if (!App.isCordova) {
        $("#tmp-profile-photo-input").click();
        return;
      }

      var opts = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
      };
      if (!fromCamera) opts.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      navigator.camera.getPicture(function (fileURI) {
        var res = JSON.parse(fileURI);
        var photo = res.filename;
        if (device.platform === "Android" && !fromCamera) photo = "file://".concat(photo);
        return plugins.crop.promise(photo).then(function (path) {
          utils.openLoader();
          utils.appendFile(new FormData(), path).then(function (formData) {
            return user.putProfilePicture(LoginActivity.getInstance().userId, formData);
          }).then(function (url) {
            utils.closeLoader();
            $("#profile-photo").attr("src", "".concat(settings.serverUrl, "/").concat(url));
          });
        })["catch"](function (err) {
          console.error("Error cropping picture ".concat(err));
          utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));
        });
      }, function (err) {
        console.error("Error taking picture ".concat(err));
        utils.createAlert("", i18next.t("dialogs.pictureError"), i18next.t("dialogs.btnOk"));
      }, opts);
    }
  }, {
    key: "initAccountUi",
    value: function initAccountUi() {
      var _this4 = this;

      $("#account-close").click(function () {
        return _this4.closeSetting("account");
      });
      $("#account-edit-profile").click(function () {
        $("#edit-profile-name").val(_this4.userData.name);
        $("#edit-profile-age").val(_this4.userData.age);
        utils.changeSelectorLabel("edit-profile-age", true);
        $("#edit-profile-gender").val(_this4.userData.gender);
        utils.changeSelectorLabel("edit-profile-gender", true);
        $("#edit-profile-occupation").val(_this4.userData.occupation);
        utils.changeSelectorLabel("edit-profile-occupation", true);
        if (_this4.userData.isRescuer) $("#edit-profile-rescuer").prop("checked", true);
        $("#page--edit-profile").show();
        _this4._openedSetting = "editProfile";
      });
      $("#account-change-mail").click(function () {
        $("#change-email").show();
        _this4._openedSetting = "changeEmail";
      });
      $("#account-change-pw").click(function () {
        $("#change-pw").show();
        _this4._openedSetting = "changePassword";
      });
      $("#account-logout").click(function () {
        utils.createAlert("", i18next.t("profile.settings.account.logoutConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          $("#page--account-settings").scrollTop(0).hide();

          _this4.logout();
        });
      });
      this.initChangeEmail();
      this.initChangePw();
      this.initEditProfile();
    }
  }, {
    key: "initChangeEmail",
    value: function initChangeEmail() {
      var _this5 = this;

      $("#change-email-close").click(function () {
        return _this5.closeSetting("changeEmail");
      });
      $("#change-email-done").click(function () {
        utils.openLoader();
        var email = $("#new-email").val();

        if (email === "") {
          utils.closeLoader();
          utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
          return;
        }

        user.putEmail(LoginActivity.getInstance().userId, email).then(function () {
          utils.closeLoader();

          _this5.closeSetting("changeEmail");

          $("#page--account-settings").scrollTop(0).hide();

          _this5.logout();

          utils.createAlert(i18next.t("profile.settings.account.changeEmail.successTitle"), i18next.t("profile.settings.account.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));
        });
      });
    }
  }, {
    key: "initChangePw",
    value: function initChangePw() {
      var _this6 = this;

      $("#change-pw-close").click(function () {
        return _this6.closeSetting("changePassword");
      });
      $("#change-pw-done").click(function () {
        utils.openLoader();
        var oldPassword = $("#change-pw-old-password").val(),
            newPassword = $("#change-pw-new-password").val(),
            confirmPassword = $("#change-pw-confirm-password").val();

        if (oldPassword === "") {
          utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
          utils.closeLoader();
          return;
        }

        if (newPassword === "" || newPassword.length < 8 || !/\d/.test(newPassword)) {
          utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
          utils.closeLoader();
          return;
        }

        if (oldPassword === newPassword) {
          utils.logOrToast(i18next.t("messages.samePassword"), "long");
          utils.closeLoader();
          return;
        }

        if (newPassword !== confirmPassword) {
          utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
          utils.closeLoader();
          return;
        }

        user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword).then(function () {
          utils.closeLoader();

          _this6.closeSetting("changePassword");

          utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");
        });
      });
    }
  }, {
    key: "initEditProfile",
    value: function initEditProfile() {
      var _this7 = this;

      $("#edit-profile-close").click(function () {
        return _this7.closeSetting("editProfile");
      });
      $("#edit-profile-done").click(function () {
        utils.openLoader();
        var name = $("#edit-profile-name").val(),
            age = $("#edit-profile-age").val(),
            gender = $("#edit-profile-gender").val(),
            occupation = $("#edit-profile-occupation").val(),
            isRescuer = $("#edit-profile-rescuer").prop("checked");

        if (name === "") {
          utils.logOrToast(i18next.t("messages.mandatoryName"), "long");
          utils.closeLoader();
          return;
        }

        user.putProfile(LoginActivity.getInstance().userId, JSON.stringify({
          name: name,
          age: age,
          gender: gender,
          occupation: occupation,
          isRescuer: isRescuer
        })).then(function (data) {
          ProfileActivity.getInstance().userData = data;
          $("#profile-name").html(data.name);
          utils.closeLoader();

          _this7.closeSetting("editProfile");

          utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");
        });
      });
      $("#edit-profile-age").change(function () {
        return utils.changeSelectorLabel("edit-profile-age", true);
      });
      $("#edit-profile-gender").change(function () {
        return utils.changeSelectorLabel("edit-profile-gender", true);
      });
      $("#edit-profile-occupation").change(function () {
        return utils.changeSelectorLabel("edit-profile-occupation", true);
      });
    }
  }, {
    key: "closeSetting",
    value: function closeSetting(name) {
      switch (name) {
        case "account":
          $("#page--account-settings").scrollTop(0).hide();
          this._openedSetting = null;
          break;

        case "editProfile":
          $("#page--edit-profile").scrollTop(0).hide();
          $("#edit-profile-name").val("");
          $("#edit-profile-age").val("");
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val("");
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val("");
          utils.changeSelectorLabel("edit-profile-occupation", true);
          $("#edit-profile-rescuer").prop("checked", false);
          this._openedSetting = "account";
          break;

        case "changeEmail":
          $("#change-email").scrollTop(0).hide();
          $("#new-email").val("");
          this._openedSetting = "account";
          break;

        case "changePassword":
          $("#change-pw").scrollTop(0).hide();
          $("#change-pw-old-password").val("");
          $("#change-pw-new-password").val("");
          $("#change-pw-confirm-password").val("");
          this._openedSetting = "account";
          break;
      }
    }
  }, {
    key: "logout",
    value: function logout() {
      this.close();
      MapActivity.getInstance().close();
      LoginActivity.getInstance().logout();
      LoginActivity.getInstance().open();
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ProfileActivity._instance) ProfileActivity._instance = new ProfileActivity();
      return ProfileActivity._instance;
    }
  }]);

  return ProfileActivity;
}();

_defineProperty(ProfileActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RegisterActivity = function () {
  function RegisterActivity() {
    var _this = this;

    _classCallCheck(this, RegisterActivity);

    this.disclaimer = $("#page--register-disclaimer");
    this.screen = $("#page--register");
    this._isDisclaimerOpen = false;
    $("#btn--register-disclaimer-accept").click(function () {
      _this.screen.show();

      _this.disclaimer.scrollTop(0).hide();

      _this._isDisclaimerOpen = false;
    });
    $("#link--register-disclaimer-back").click(function () {
      return utils.switchActivity(LoginActivity.getInstance(), true, _this);
    });
    $("#btn--register-done").click(function () {
      return _this.register();
    });
    $("#link--login").click(function () {
      return utils.switchActivity(LoginActivity.getInstance(), true, _this);
    });
    $("#register-age").change(function () {
      return utils.changeSelectorLabel("register-age", true);
    });
    $("#register-gender").change(function () {
      return utils.changeSelectorLabel("register-gender", true);
    });
    $("#register-occupation").change(function () {
      return utils.changeSelectorLabel("register-occupation", true);
    });
  }

  _createClass(RegisterActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.disclaimer.show();
      this._isDisclaimerOpen = true;
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.disclaimer.scrollTop(0).hide();
      this.screen.scrollTop(0).hide();
      $("#field--register-email").val("");
      $("#field--register-password").val("");
      $("#field--register-confirm-password").val("");
      $("#field--register-name").val("");
      utils.resetSelector("register-age");
      utils.resetSelector("register-gender");
      utils.resetSelector("register-occupation");
      $("#cbx--register-rescuer").prop("checked", false);
      this._isDisclaimerOpen = false;
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (!this._isDisclaimerOpen) {
        this.disclaimer.show();
        this.screen.scrollTop(0).hide();
        this._isDisclaimerOpen = true;
        return;
      }

      utils.switchActivity(LoginActivity.getInstance(), true, this);
    }
  }, {
    key: "register",
    value: function register() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--register-email").val(),
          password = $("#field--register-password").val(),
          confirmPassword = $("#field--register-confirm-password").val(),
          name = $("#field--register-name").val(),
          age = $("#register-age").val(),
          gender = $("#register-gender").val(),
          occupation = $("#register-occupation").val(),
          isRescuer = $("#cbx--register-rescuer").prop("checked");

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      if (password === "" || password.length < 8 || !/\d/.test(password.toString())) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.weakPassword"), "long");
        return;
      }

      if (password !== confirmPassword) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
        return;
      }

      if (name === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryName"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/signup"), {
        method: "PUT",
        headers: {
          "App-Key": settings.APIKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          name: name,
          age: age,
          gender: gender,
          occupation: occupation,
          isRescuer: isRescuer
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        utils.closeLoader();
        utils.switchActivity(LoginActivity.getInstance(), true, _this2);
        utils.createAlert(i18next.t("auth.register.successTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 403:
            utils.switchActivity(LoginActivity.getInstance(), true, _this2);
            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 409:
            utils.logOrToast(i18next.t("messages.register409"), "long");
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.register422"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.register500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!RegisterActivity._instance) RegisterActivity._instance = new RegisterActivity();
      return RegisterActivity._instance;
    }
  }]);

  return RegisterActivity;
}();

_defineProperty(RegisterActivity, "_instance", void 0);
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ResetPasswordActivity = function () {
  function ResetPasswordActivity() {
    var _this = this;

    _classCallCheck(this, ResetPasswordActivity);

    this.screen = $("#page--reset-pw");
    $("#btn--reset-pw-close").click(function () {
      return _this.close();
    });
    $("#btn--reset-pw-done").click(function () {
      return _this.resetPassword();
    });
  }

  _createClass(ResetPasswordActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.screen.scrollTop(0).hide();
      $("#field--reset-pw-email").val("");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      this.close();
    }
  }, {
    key: "resetPassword",
    value: function resetPassword() {
      var _this2 = this;

      utils.openLoader();
      var email = $("#field--reset-pw-email").val();

      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }

      fetch("".concat(settings.serverUrl, "/auth/reset-password"), {
        method: "POST",
        headers: {
          "App-Key": settings.APIKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }

        _this2.close();

        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resetPassword.successTitle"), i18next.t("auth.login.resetPassword.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();

        switch (err.code) {
          case 403:
            _this2.close();

            utils.createAlert(i18next.t("dialogs.title403"), i18next.t("dialogs.message403"), i18next.t("dialogs.btnOk"));
            break;

          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resetPw404"), i18next.t("dialogs.btnOk"));
            break;

          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;

          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resetPw500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ResetPasswordActivity._instance) ResetPasswordActivity._instance = new ResetPasswordActivity();
      return ResetPasswordActivity._instance;
    }
  }]);

  return ResetPasswordActivity;
}();

_defineProperty(ResetPasswordActivity, "_instance", void 0);
