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
const int LOADCELL_A_DOUT_PIN = 6;
const int LOADCELL_A_SCK_PIN = 5;

const int LOADCELL_B_DOUT_PIN = 10;
const int LOADCELL_B_SCK_PIN = 9;

const int LOADCELL_C_DOUT_PIN = 12;
const int LOADCELL_C_SCK_PIN = 11;

HX711 scale_a;
HX711 scale_b;
HX711 scale_c;

char demo_string[] = "HX711 Tri-Axial";

float    load_a  = 0;
float    load_b  = 0;
float    load_c  = 0;

float    known_weight_a  = 0;
float    known_weight_b  = 0;
float    known_weight_c  = 0;

uint8_t   led_state  = 0;  
uint32_t  led_timer  = 0;

void tare_scale_a();
void precal_scale_a();
void calibrate_scale_a();

void tare_scale_b();
void precal_scale_b();
void calibrate_scale_b();

void tare_scale_c();
void precal_scale_c();
void calibrate_scale_c();

eui_interface_t serial_comms = EUI_INTERFACE( &serial_write ); 

eui_message_t tracked_vars[] = 
{
  EUI_FUNC( "tareA",   tare_scale_a),
  EUI_FUNC( "precalA", precal_scale_a),
  EUI_FUNC( "setcalA", calibrate_scale_a),
  EUI_FLOAT_RO("lA", load_a),
  EUI_FLOAT(   "kwA",   known_weight_a),

  EUI_FUNC( "tareB",   tare_scale_b),
  EUI_FUNC( "precalB", precal_scale_b),
  EUI_FUNC( "setcalB", calibrate_scale_b),
  EUI_FLOAT_RO("lB", load_b),
  EUI_FLOAT(   "kwB",   known_weight_b),

  EUI_FUNC( "tareC",   tare_scale_c),
  EUI_FUNC( "precalC", precal_scale_c),
  EUI_FUNC( "setcalC", calibrate_scale_c),
  EUI_FLOAT_RO("lC", load_c),
  EUI_FLOAT(   "kwC",   known_weight_c),


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
  scale_a.begin(LOADCELL_A_DOUT_PIN, LOADCELL_A_SCK_PIN);
  scale_b.begin(LOADCELL_B_DOUT_PIN, LOADCELL_B_SCK_PIN);
  scale_c.begin(LOADCELL_C_DOUT_PIN, LOADCELL_C_SCK_PIN);

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

  load_a = scale_a.get_units(1);
  load_b = scale_b.get_units(1);
  load_c = scale_c.get_units(1);

  eui_send_tracked("lA");
  eui_send_tracked("lB");
  eui_send_tracked("lC");

  if( millis() - led_timer >= 250 )
  {
    led_state = !led_state;
    led_timer = millis();
  }    
  digitalWrite( LED_BUILTIN, led_state );
}

void tare_scale_a(void)
{
  scale_a.tare();
}

void precal_scale_a(void)
{
    scale_a.set_scale();
    scale_a.tare();
}

void calibrate_scale_a(void)
{
  float offset_factor;
  float raw_reading;
  
  raw_reading = scale_a.get_units(10);
  offset_factor = raw_reading / known_weight_a;
  scale_a.set_scale(offset_factor);
}


// SCALE B
void tare_scale_b(void)
{
  scale_b.tare();
}

void precal_scale_b(void)
{
    scale_b.set_scale();
    scale_b.tare();
}

void calibrate_scale_b(void)
{
  float offset_factor;
  float raw_reading;
  
  raw_reading = scale_b.get_units(10);
  offset_factor = raw_reading / known_weight_b;
  scale_b.set_scale(offset_factor);
}


// SCALE C
void tare_scale_c(void)
{
  scale_c.tare();
}

void precal_scale_c(void)
{
    scale_c.set_scale();
    scale_c.tare();
}

void calibrate_scale_c(void)
{
  float offset_factor;
  float raw_reading;
  
  raw_reading = scale_c.get_units(10);
  offset_factor = raw_reading / known_weight_c;
  scale_c.set_scale(offset_factor);
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
