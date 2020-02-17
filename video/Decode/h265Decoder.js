"use strict";

function H265Decoder() {
    var initDecoder = null;
    var decoderContext = null;
    var decodeByFFMPEG = null;
    var getWidth = null;
    var getHeight = null;
    var closeContext = null;
    var context = null;
    var outpic = new Uint8Array();
    var ID = 265;
    var isFirstIFrame = false;
    function Constructor() {
        debug.log('Construct H265 Codec');
        // initialize ffmpeg decoder
        initDecoder = Module.cwrap('init_jsFFmpeg', 'void', []);
        decoderContext = Module.cwrap('context_jsFFmpeg', 'number', ['number']);
        decodeByFFMPEG = Module.cwrap('decode_video_jsFFmpeg', 'number', ['number', 'array', 'number', 'number']);
        getWidth = Module.cwrap('get_width', 'number', ['number']);
        getHeight = Module.cwrap('get_height', 'number', ['number']);
        closeContext = Module.cwrap('close_jsFFmpeg', 'number', ['number']);

        initDecoder();

        Constructor.prototype.init();
        Constructor.prototype.setIsFirstFrame(false);
    }

    Constructor.prototype = {
        init: function () {
            debug.log("H265 Decoder init");
            closeContext(context);
            context = decoderContext(ID);
        },
        setOutputSize: function (size) {
            var outpicsize = size * 1.5;
            var outpicptr = Module._malloc(outpicsize);
            outpic = new Uint8Array(Module.HEAPU8.buffer, outpicptr, outpicsize);

        },
        decode: function (data, frametype) {
            var beforeDecoding = null;
            var decodingTime = null;
            var frameData = null;
            var frameType = frametype;

            beforeDecoding = Date.now();
            decodeByFFMPEG(context, data, data.length, outpic.byteOffset);
            decodingTime = Date.now() - beforeDecoding;

            var width = getWidth(context);
            var height = getHeight(context);

            if (!Constructor.prototype.isFirstFrame()) {
                Constructor.prototype.setIsFirstFrame(true);
                return {
                    'firstFrame': true,
                };
            }

            // draw picture in canvas.
            if (width > 0 && height > 0) {
                var copyOutput = new Uint8Array(outpic);

                frameData = {
                    'data': copyOutput,
                    'width': width,
                    'height': height,
                    'codecType': 'h265',
                    'decodingTime': decodingTime,
                    'frameType': frameType,
                };

                return frameData;
            }
        },
        setIsFirstFrame: function (flag) {
            isFirstIFrame = flag;
        },
        isFirstFrame: function () {
            return isFirstIFrame;
        }
    };

    return new Constructor();
}

