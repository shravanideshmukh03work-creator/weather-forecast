/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["wf/weather/test/integration/AllJourneys"
], function () {
	QUnit.start();
});
