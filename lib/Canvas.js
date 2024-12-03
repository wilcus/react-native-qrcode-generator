"use strict";

var React = require("react");
var PropTypes = require("prop-types");
var createReactClass = require("create-react-class");

var { View, Platform } = require("react-native");
var { WebView } = require("react-native-webview");

function getRenderHTML(context) {
  return `
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
    <style>
        *{margin:0;padding:0;overflow:hidden;}canvas{transform:translateZ(0);}
    </style>
    <canvas></canvas>
    <script>
        var canvas = document.querySelector('canvas');
        function render(canvas) {
          var ctx = canvas.getContext("2d");
          var size = this.size;
          var fgColor = this.fgColor;
          var bgColor = this.bgColor;
          canvas.width = size;
          canvas.height = size;
          canvas.style.left = (window.innerWidth - size) / 2 + "px";
          if (window.innerHeight > size) {
            canvas.style.top = (window.innerHeight - size) / 2 + "px";
          }
          ctx.fillRect(0, 0, size, size);
          var cells = this.cells;
          var cellWidth = this.size / cells.length;
          var cellHeight = this.size / cells.length;
          var nRoundedWidth = Math.round(cellWidth);
          var nRoundedHeight = Math.round(cellHeight);
          cells.forEach(function(row, rowIndex) {
            row.forEach(function(column, columnIndex) {
              var nLeft = columnIndex * cellWidth;
              var nTop = rowIndex * cellHeight;
              ctx.fillStyle = ctx.strokeStyle = column ? bgColor : fgColor;
              ctx.lineWidth = 1;
              ctx.fillRect(nLeft, nTop, cellWidth, cellHeight);
              ctx.strokeRect(
                Math.floor(nLeft) + 0.5,
                Math.floor(nTop) + 0.5,
                nRoundedWidth,
                nRoundedHeight
              );
              ctx.strokeRect(
                Math.ceil(nLeft) - 0.5,
                Math.ceil(nTop) - 0.5,
                nRoundedWidth,
                nRoundedHeight
              );
            });
          });
        }

        function generateImage(context, canvas) {
          if (!window.ReactNativeWebView.postMessage) {
            setTimeout(function () {
              generateImage.call(this, context, canvas);
            }, 100);
          } else {
            const image = document.createElement("canvas");
            const imageContext = image.getContext("2d");
            image.width = context.size;
            image.height = context.size;
            imageContext.fillStyle = context.bgColor;
            imageContext.fillRect(0, 0, context.size, context.size);
            imageContext.drawImage(canvas, 0, 0);
            window.ReactNativeWebView.postMessage(image.toDataURL());
          }
        }

        render.call(${context}, canvas);
        generateImage.call('', ${context} , canvas);
    </script>
    `;
}

var Canvas = createReactClass({
  propTypes: {
    style: PropTypes.object,
    context: PropTypes.object,
    render: PropTypes.func.isRequired,
    onLoad: PropTypes.func,
    onLoadEnd: PropTypes.func
  },

  getImage: function(event) {
    if (this.props.generateImage) {
      this.props.generateImage(event.nativeEvent.data);
    }
  },

  render() {
    var contextString = JSON.stringify(this.props.context);
    return (
      <View style={this.props.style}>
        <WebView
          automaticallyAdjustContentInsets={false}
          scalesPageToFit={false}
          contentInset={{ top: 0, right: 0, bottom: 0, left: 0 }}
          source={{
            html: getRenderHTML(contextString),
            baseUrl: ""
          }}

          opaque={false}
          underlayColor={"transparent"}
          overScrollMode="never"
          style={this.props.style}
          javaScriptEnabled={true}
          scrollEnabled={false}
          onLoad={this.props.onLoad}
          onLoadEnd={this.props.onLoadEnd}
          originWhitelist={["*"]}
          onMessage={this.getImage}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
});

module.exports = Canvas;
