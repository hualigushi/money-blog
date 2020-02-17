/* exported G711AudioDecoder */
/* global inheritObject, AudioDecoder, Uint8Array, Int16Array, Float32Array*/
"use strict";

function G711AudioDecoder(type) {
    var BIAS = 0x84,
        SIGN_BIT = 0x80,
    /* Sign bit for a A-law byte. */
        QUANT_MASK = 0xf,
    /* Quantization field mask. */
    //NSEGS = 8,
    /* Number of A-law segments. */
        SEG_SHIFT = 4,
    /* Left shift for segment number. */
        SEG_MASK = 0x70;
    /* Segment field mask. */
    /* var codecInfo = {
     type: "G.711",
     samplingRate : 8000,
     bitrate : '64000'
     }; */

    function uLaw2Linear(uVal) {
        var temp = 0;
        /* Complement to obtain normal u-law value. */
        var uValc = ~uVal;
        /*
         * Extract and bias the quantization bits. Then
         * shift up by the segment number and subtract out the bias.
         */
        temp = ((uValc & QUANT_MASK) << 3) + BIAS;
        temp <<= (uValc & SEG_MASK) >> SEG_SHIFT;
        return (((uValc & SIGN_BIT)) ? (BIAS - temp) : (temp - BIAS));
    }

    function aLaw2Linear(a_val) {
        var temp = 0;
        var seg = 0;
        a_val ^= 0x55;

        temp = (a_val & QUANT_MASK) << 4;
        seg = (a_val & SEG_MASK) >> SEG_SHIFT;
        switch (seg) {
            case 0:
                temp += 8;
                break;
            case 1:
                temp += 0x108;
                break;
            default:
                temp += 0x108;
                temp <<= seg - 1;

        }
        return ((a_val & SIGN_BIT) ? temp : -temp);
    }

    function Constructor() {
    }

    Constructor.prototype = {
        decode: function (buffer) {
            var rawData = new Uint8Array(buffer);
            var pcmData = new Int16Array(rawData.length);
            var idx = 0;

            if(type == 'G.711A') {
                for (idx = 0; idx < rawData.length; idx++) {
                    pcmData[idx] = aLaw2Linear(rawData[idx]);
                }
            }else if(type == 'G.711Mu'){
                for (idx = 0; idx < rawData.length; idx++) {
                    pcmData[idx] = uLaw2Linear(rawData[idx]);
                }
            }

            var jsData = new Float32Array(pcmData.length);
            for (idx = 0; idx < pcmData.length; idx++) {
                /* var a1 = pcmData[i]/Math.pow(2,15);
                 var a2 = Math.round(a1*100000) / 100000;
                 jsData[i] = a2; */
                jsData[idx] = pcmData[idx] / Math.pow(2, 15);
            }
            return jsData;
        }
    };

    return new Constructor();
}
