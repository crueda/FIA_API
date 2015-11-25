var status = require("../utils/statusCodes.js");
var messages = require("../utils/statusMessages.js");
var express = require('express');
var router = express.Router();
var TrackingModel = require('../models/tracking');

// Fichero de propiedades
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./api.properties');

// Definición del log
var fs = require('fs');
var log = require('tracer').console({
    transport : function(data) {
        //console.log(data.output);
        fs.open(properties.get('main.log.file'), 'a', 0666, function(e, id) {
            fs.write(id, data.output+"\n", null, 'utf8', function() {
                fs.close(id, function() {
                });
            });
        });
    }
});




router.post("/tracking", function(req,res)
{
    log.info("POST: /tracking");

    // Crear un objeto con los datos a insertar del Poi
    var license_value = req.body.license || req.query.license || req.params.license;

    log.debug("  -> license: " + license_value);

    if (license_value == null) {
      res.status(202).json({"response": {"status":status.STATUS_VALIDATION_ERROR,"description":messages.MISSING_PARAMETER}})
    }
    else
    {
      var inputData = {
          id : null,
          license : license_value
      };

      //res.status(200).json({"response": {"speed":80,"latitude":41.8}});

      TrackingModel.getTracking1(inputData,function(error, outputData)
      {
        if (outputData == null)
        {
          res.status(202).json({"response": {"status":status.STATUS_FAILURE,"description":messages.DB_ERROR}})
        }
        else
        {
          //console.log("-->"+outputData[0].speed);
          res.status(200).json({"response": {"speed":outputData[0].speed,"latitude":outputData[0].latitude,"longitude":outputData[0].longitude,
          "altitude":outputData[0].altitude,
          "distance":outputData[0].distance,
          "alert":outputData[0].alert,
          "sats":outputData[0].sats,
          "hdop":outputData[0].hdop,
          "battery":outputData[0].battery,
          "heading":outputData[0].heading,
          "speed":outputData[0].speed,
          "rssi":outputData[0].rssi,
          "posDate":outputData[0].posDate}});
        }
      });
    }
});

module.exports = router;
