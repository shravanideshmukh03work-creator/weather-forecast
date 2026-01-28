sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("wf.weather.controller.weatherf", {
        onInit: function () {
            this._loadCityWeather("Raigarh");
        },

        onGetWeather: function () {
            var sCity = this.byId("cityInput").getValue();
            if (sCity) {
                this._loadCityWeather(sCity);
            } else {
                MessageToast.show("Please enter a city name");
            }
        },

        _loadCityWeather: function (sCity) {
            var that = this;
            var sApiKey = "a187a56de525ef3655614182134f92d5"; 
            
            // URLs for Current Weather and 5-Day Forecast
            var sCurrentUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + sCity + "&units=metric&appid=" + sApiKey;
            var sForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + sCity + "&units=metric&appid=" + sApiKey;

            sap.ui.core.BusyIndicator.show(0);

            // Fetching both Current and Forecast data
            Promise.all([fetch(sCurrentUrl), fetch(sForecastUrl)])
                .then(function (responses) {
                    return Promise.all(responses.map(res => res.json()));
                })
                .then(function (results) {
                    sap.ui.core.BusyIndicator.hide();
                    var currentData = results[0];
                    var forecastData = results[1];

                    if (currentData.cod !== 200) {
                        MessageToast.show("Error: " + currentData.message);
                        return;
                    }

                    // Processing the 5-day forecast (filtering for one reading per day)
                    var aExactForecast = forecastData.list.filter(function (item) {
                        return item.dt_txt.includes("12:00:00"); // Getting mid-day exact temperature
                    }).map(function (item) {
                        var oDate = new Date(item.dt * 1000);
                        return {
                            day: oDate.toLocaleDateString('en-US', { weekday: 'short' }),
                            emoji: that._getWeatherEmoji(item.weather[0].main),
                            high: Math.round(item.main.temp)
                        };
                    });

                    var oData = {
                        current: {
                            city: currentData.name,
                            temp: Math.round(currentData.main.temp),
                            condition: currentData.weather[0].main,
                            emoji: that._getWeatherEmoji(currentData.weather[0].main),
                            visibility: (currentData.visibility / 1000).toFixed(0),
                            humidity: currentData.main.humidity,
                            uvIndex: "N/A"
                        },
                        // Real exact forecast data from API
                        forecast: aExactForecast
                    };

                    var oModel = that.getView().getModel("weatherModel");
                    if (!oModel) {
                        that.getView().setModel(new JSONModel(oData), "weatherModel");
                    } else {
                        oModel.setData(oData);
                    }
                })
                .catch(function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Error fetching exact weather data");
                });
        },

        _getWeatherEmoji: function (sCondition) {
            var oEmojis = {
                "Clear": "☀️",
                "Clouds": "☁️",
                "Rain": "🌧️",
                "Drizzle": "🌦️",
                "Thunderstorm": "⛈️",
                "Snow": "❄️",
                "Mist": "🌫️",
                "Smoke": "🌫️",
                "Haze": "🌫️"
            };
            return oEmojis[sCondition] || "☀️";
        }
    });
});