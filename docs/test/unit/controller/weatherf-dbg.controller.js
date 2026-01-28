/*global QUnit*/

sap.ui.define([
	"wf/weather/controller/weatherf.controller"
], function (Controller) {
	"use strict";

	QUnit.module("weatherf Controller");

	QUnit.test("I should test the weatherf controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
