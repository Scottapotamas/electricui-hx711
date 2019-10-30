/**
 *
 * HX711 library for Arduino - example file
 * https://github.com/bogde/HX711
 *
 * MIT License
 * (c) 2018 Bogdan Necula
 *
**/
#include "HX711.h"
#include "electricui.h"


// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 2;
const int LOADCELL_SCK_PIN = 3;


HX711 scale;

char demo_string[] = "HX711 Single Axis";

float    load_reading  = 0;
float    calibration_factor  = 0;
float    known_weight  = 0;

uint8_t   led_state  = 0;  
uint32_t  led_timer  = 0;

void tare_scale();
void precal_scale();
void calibrate_scale();

eui_interface_t serial_comms = EUI_INTERFACE( &serial_write ); 

eui_message_t tracked_vars[] = 
{
  EUI_FUNC( "tare",   tare_scale),
  EUI_FUNC( "precal", precal_scale),
  EUI_FUNC( "setcal", calibrate_scale),

  EUI_FLOAT_RO("load", load_reading),
  EUI_FLOAT(   "cf",   calibration_factor),
  EUI_FLOAT(   "kw",   known_weight),

  EUI_CHAR_RO_ARRAY("name", demo_string),
};



void init_scale(void)
{
    // Initialize library with data output pin, clock input pin and gain factor.
  // Channel selection is made by passing the appropriate gain:
  // - With a gain factor of 64 or 128, channel A is selected
  // - With a gain factor of 32, channel B is selected
  // By omitting the gain factor parameter, the library
  // default "128" (Channel A) is used here.
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

//  float temp_reading;
//  temp_reading = scale.read(); // a raw reading from the ADC
//
//  temp_reading = scale.read_average(20);   // average of 20 readings from the ADC
//  temp_reading = scale.get_value(5);  // average of 5 readings from the ADC minus the tare weight (not set yet)
//  temp_reading = scale.get_units(5);  // average of 5 readings from the ADC minus tare weight (not set) divided by the SCALE parameter (not set yet)
//
//  scale.set_scale(2280.f);    // this value is obtained by calibrating the scale with known weights; see the README for details
//  scale.tare();               // reset the scale to 0

}

void setup() {
  Serial.begin(57600);

  eui_setup_interface( &serial_comms );
  EUI_TRACK( tracked_vars );
  eui_setup_identifier( "hx711", 5 );
  init_scale();
  
  led_timer = millis();
}

void loop()
{
  serial_rx_handler();

  load_reading = scale.get_units(3);
  eui_send_tracked("load");
  
//  scale.power_down();			        // put the ADC in sleep mode
//  delay(500);
//  scale.power_up();

  if( millis() - led_timer >= 250 )
  {
    led_state = !led_state;
    led_timer = millis();
  }    
  digitalWrite( LED_BUILTIN, led_state );
}

void tare_scale(void)
{
  scale.tare();
}

void precal_scale(void)
{
    scale.set_scale();
    scale.tare();
}

void calibrate_scale(void)
{
  float offset_factor;
  float raw_reading;
  
  raw_reading = scale.get_units(10);
  offset_factor = raw_reading / known_weight;
  scale.set_scale(offset_factor);
}

void serial_rx_handler()
{
  while( Serial.available() > 0 )  
  {  
    eui_parse( Serial.read(), &serial_comms );
  }
}
  
void serial_write( uint8_t *data, uint16_t len )
{
  Serial.write( data, len );
}
