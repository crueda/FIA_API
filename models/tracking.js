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

var dbConfig = {
  host: properties.get('bbdd.mysql.ip') ,
  user: properties.get('bbdd.mysql.user') ,
  password: properties.get('bbdd.mysql.passwd') ,
  database: properties.get('bbdd.mysql.name'),
    connectionLimit: 50,
    queueLimit: 0,
    waitForConnection: true
};

var mysql = require('mysql');

// Crear la conexion a la base de datos
var connection = mysql.createPool(dbConfig);

// Crear un objeto para ir almacenando todo lo necesario
var trackingModel = {};

trackingModel.getTracking1 = function(inputData,callback)
{
    if (connection)
    {
        //var sql = "SELECT GPS_SPEED as speed FROM KyrosFia.TRACKING_1 where VEHICLE_LICENSE='001'";
        var sql = "SELECT GPS_SPEED as speed, DISTANCE as distance, (POS_LATITUDE_DEGREE + POS_LATITUDE_MIN/60) as latitude, (POS_LONGITUDE_DEGREE + POS_LONGITUDE_MIN/60) as longitude, RSSI as rssi, SATS as sats, ALERT_FLAG as alert, DATE_FORMAT(FROM_UNIXTIME('POS_DATE'), '%Y-%m-%d %T') as posDate, HEADING as heading, HDOP as hdop, BATTERY as battery, ALTITUDE as altitude FROM TRACKING_1 WHERE VEHICLE_LICENSE = " + connection.escape(inputData.license);
        log.debug ("Query: "+sql);
        connection.query(sql, function(error, row)
        {
            if(error)
            {
                callback(error, null);
            }
            else
            {
                callback(null, row);
            }
        });
    }
    else
    {
      callback(null, null);
    }
}

//exportamos el objeto para tenerlo disponible en la zona de rutas
module.exports = trackingModel;
