/**
 * Triaxial Load Cell Interface Firmware
 *
 * Connects to 3-HX711 breakouts (generic green Chinese sourced boards) and presents data to
 * an Electric UI based frontend for realtime graphing and calibration.
 *
 * Host microcontroller was an Adafruit Feather M0.
 * For nv storage, an Adafruit SPI FRAM module is used.
 * Electronics mounted in weathertight box, with connectors to the Forsentek F3F-1kN load cell
 *
 * Uses https://github.com/bogde/HX711 by Bogdan Necula as library for interfacing with breakouts
 * Uses *** as library for interfacing with the FRAM breakout.
 *
 * MIT License
 * (c) 2019. 2020 Scott Rapson
 *
**/

#include "HX711.h"
#include "Adafruit_FRAM_SPI.h"
#include "electricui.h"

// ----------- HX711 Load Cell Amplifiers ------------------

typedef enum {
  _LOADCELL_X = 0,
  _LOADCELL_Y,
  _LOADCELL_Z,
  _NUM_LOADCELLS
} HX711Def_t;

// Hardware GPIO Mapping
typedef struct {
  const uint8_t pin_dout;
  const uint8_t pin_sck;
} HX711HardwwareConfiguration_t;

// Used for runtime calibration comms with UI, and saved into NV storage for persistent calibrations
typedef struct {
  int32_t cal_factor;
  uint32_t crc;
} HX711Calibration_t;

HX711HardwwareConfiguration_t scale_config[_NUM_LOADCELLS] = 
{ 
  { .pin_dout = 6, .pin_sck = 5, },
  { .pin_dout = 10, .pin_sck = 9, },
  { .pin_dout = 12, .pin_sck = 11, }
};

HX711 scale[ _NUM_LOADCELLS ];

float load_measurement[ _NUM_LOADCELLS ] = { 0.0f };
HX711Calibration_t load_cal[ _NUM_LOADCELLS ] = { 0 };

float calibration_weight_kg = 1.0f;


// ----------- FRAM Storage ------------------

const uint8_t FRAM_SCK  = 24;
const uint8_t FRAM_MISO = 22;
const uint8_t FRAM_MOSI = 23;
const uint8_t FRAM_CS   = A4;

Adafruit_FRAM_SPI fram = Adafruit_FRAM_SPI(FRAM_SCK, FRAM_MISO, FRAM_MOSI, FRAM_CS);

const uint8_t fram_addr_size_bytes = 2; //Default to address size of two bytes

typedef struct {
  uint32_t power_on_count;
  uint8_t storage_ok;
  uint8_t calibration_loaded;
} StorageState_t;

StorageState_t storage_info = { 0 };

#define NV_ADDR_POWER_ON_COUNT 0x0000
#define NV_ADDR_CALIBRATION_STRUCTURE 0x0004

// ----------- Electric UI ------------------


char system_name[] = "HX711 Tri-Axial";


uint8_t sensor_to_modify = 0;

uint8_t   led_state  = 0;  
uint32_t  led_timer  = 0;

eui_interface_t ui_transport = EUI_INTERFACE_CB( &serial_write, &eui_callback ); 

eui_message_t tracked_vars[] = 
{
  // System information for optional display
  EUI_CUSTOM_RO(      "pins",   scale_config ),
  EUI_CUSTOM_RO(      "nvi",    storage_info ),
  EUI_CHAR_RO_ARRAY(  "name",   system_name  ),

  // Load cell management
  EUI_FLOAT_RO_ARRAY( "load",   load_measurement ),
  EUI_CUSTOM_ARRAY(   "cal",    load_cal         ),

  EUI_FLOAT( "cal_weight",  calibration_weight_kg ),
  EUI_UINT8( "calibrate_a", sensor_to_modify      ),
  EUI_UINT8( "calibrate_b", sensor_to_modify      ),
  EUI_UINT8( "tare",        sensor_to_modify      ),

  EUI_FUNC( "tare_all", scale_tare_all    ),
  EUI_FUNC( "save",     storage_commit    ),
};


// ----------- Functions ------------------

void storage_init( void )
{
  uint8_t status = fram.begin( fram_addr_size_bytes );
  storage_info.storage_ok = status;

  // Increment the power-on count value
  uint32_t poc = 0;
  fram.read( NV_ADDR_POWER_ON_COUNT, (uint8_t*)&poc, sizeof(uint32_t));
  poc += 1;

  fram.writeEnable( true );
  fram.write( NV_ADDR_POWER_ON_COUNT, (uint8_t*)&poc, sizeof(uint32_t) );
  fram.writeEnable( false );

  storage_info.power_on_count = poc;
}

void crc16(uint8_t data, uint16_t *crc)
{
    *crc  = (uint8_t)(*crc >> 8) | (*crc << 8);
    *crc ^= data;
    *crc ^= (uint8_t)(*crc & 0xff) >> 4;
    *crc ^= (*crc << 8) << 4;
    *crc ^= ((*crc & 0xff) << 4) << 1;
}

// Run a CRC16 against our calibration values
uint16_t crc_calibration_values( uint32_t cal_factor )
{
  uint16_t working_crc = 0xFFFFF; // seed is specific to the CRC16 implementation

  uint8_t buf[sizeof(uint32_t)] = { 0 };

  memcpy( &buf, &cal_factor, sizeof(uint32_t));
  for(uint8_t i = 0; i < sizeof(uint32_t); i++)
  {
      eui_crc(buf[i], &working_crc);
  }

  return working_crc;
}

void storage_retrieve( void )
{
  HX711Calibration_t nv_cal[ _NUM_LOADCELLS ] = { 0 };

  fram.read( NV_ADDR_CALIBRATION_STRUCTURE, (uint8_t*)&nv_cal, sizeof(nv_cal));

  // See which sensors have been calibrated
  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    if( nv_cal[sensor].cal_factor )
    {
      // There are values, so check the CRC for data integrity
      uint16_t stored_values_crc = crc_calibration_values( nv_cal[sensor].cal_factor );

      // If CRC's match, copy them into the userspace calibration structure
      if( nv_cal[sensor].crc == stored_values_crc)
      { 
        // Copy the valid data to the UI visible calibration structure, lets the UI see if a calibration has been loaded
        memcpy( &load_cal[sensor], &nv_cal[sensor], sizeof(HX711Calibration_t) );
      }
    }

  }
}

void storage_commit( void )
{
  // Update the calibration CRC from the latest values
  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    load_cal[sensor].crc = crc_calibration_values( load_cal[sensor].cal_factor );
  }

  // Write the calibration structure to memory
  fram.writeEnable( true );
  fram.write( NV_ADDR_CALIBRATION_STRUCTURE, (uint8_t*)&load_cal, sizeof(load_cal) );
  fram.writeEnable( false );
}

void scale_init( void )
{
  // Initialize library with data output pin, clock input pin and gain factor.
  // Channel selection is made by passing the appropriate gain:
  // - With a gain factor of 64 or 128, channel A is selected
  // - With a gain factor of 32, channel B is selected
  // By omitting the gain factor parameter, the library
  // default "128" (Channel A) is used here.
  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    scale[sensor].begin( scale_config[sensor].pin_dout, scale_config[sensor].pin_sck );
  }

  // Read our stored calibration values and if valid
  storage_retrieve();

  uint8_t channels_calibrated = 0;

  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    // The storage manager checks for data integrity before load, so if anything is there, use it for calibration
    if( load_cal[sensor].cal_factor )
    {
      scale[sensor].set_scale( load_cal[sensor].cal_factor );
      channels_calibrated++;
    }
  }

  storage_info.calibration_loaded = channels_calibrated;

}

void scale_pre_calibrate( uint8_t sensor )
{
    scale[sensor].set_scale();
    scale[sensor].tare();
}

void scale_post_calibrate( uint8_t sensor )
{
  float offset_factor;
  float raw_reading;
  
  raw_reading = scale[sensor].get_units(10);  // average of 10 readings
  offset_factor = raw_reading / calibration_weight_kg;
  scale[sensor].set_scale(offset_factor);

  load_cal[sensor].cal_factor = offset_factor;
}

void scale_tare( uint8_t sensor )
{
  scale[sensor].tare();
}

void scale_tare_all( void )
{
  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    scale[sensor].tare();
  }
}

void setup()
{
  Serial.begin(115200);

  eui_setup_interface( &ui_transport );
  EUI_TRACK( tracked_vars );
  eui_setup_identifier( "hx711", 5 );

  storage_init();
  scale_init();
  
  // Ready for use
  scale_tare_all();
  led_timer = millis();
}

void loop()
{
  serial_rx_handler();

  for( uint8_t sensor = 0; sensor < _NUM_LOADCELLS; sensor++ )
  {
    load_measurement[sensor] = scale[sensor].get_units(1);  // one ADC sample
  }

  eui_send_tracked("load");

  // Blinking status light
  if( millis() - led_timer >= 250 )
  {
    led_state = !led_state;
    digitalWrite( LED_BUILTIN, led_state );
    led_timer = millis();
  }
}

void eui_callback( uint8_t message )
{
  switch(message)
  {
    case EUI_CB_TRACKED:
    {
      // UI recieved a tracked message ID and has completed processing

      // Grab parts of the inbound packet which are are useful
      eui_header_t header   = ui_transport.packet.header;
      uint8_t      *name_rx = ui_transport.packet.id_in;
      void         *payload = ui_transport.packet.data_in;

      // See if the inbound packet name matches our intended variable
      if( strcmp( (char*)name_rx, "calibrate_a" ) == 0 )
      {
        if( header.type == TYPE_UINT8 )
        {
          scale_pre_calibrate( sensor_to_modify );
        }
      }

      if( strcmp( (char*)name_rx, "calibrate_b" ) == 0 )
      {
        if( header.type == TYPE_UINT8 )
        {
          scale_post_calibrate( sensor_to_modify );
        }
      }

      if( strcmp( (char*)name_rx, "tare" ) == 0 )
      {
        if( header.type == TYPE_UINT8 )
        {
          scale_tare( sensor_to_modify );
        }
      }
    }
    break;

    case EUI_CB_UNTRACKED:
    {
      // UI passed in an untracked message ID
    }
    break;

    case EUI_CB_PARSE_FAIL:
      // Inbound message parsing failed, this callback help while debugging

    break;
  }
}

void serial_rx_handler()
{
  while( Serial.available() > 0 )  
  {  
    eui_parse( Serial.read(), &ui_transport );
  }
}
  
void serial_write( uint8_t *data, uint16_t len )
{
  Serial.write( data, len );
}