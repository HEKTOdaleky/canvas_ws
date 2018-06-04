import React, {Component} from "react";
import {SketchPicker} from "react-color";
import "./App.css";

class App extends Component {
    state = {
        mouseDown: false,
        pixelArray: [],
        rgb: {r: 0, g: 0, b: 0, a: 255},
        events: []
    }
    ;

    componentDidMount() {
        this.websocket = new WebSocket('ws://localhost:8000/canvas');

        this.websocket.onmessage = (message) => {
            const decodedMessage = JSON.parse(message.data);

            switch (decodedMessage.type) {
                case 'NEW_LINE':
                    this.setState({
                        events: decodedMessage.array
                    });
                    this.drawImage(this.state.events);

                    break;

                default:
                    return null


            }
        }
    }


    canvasMouseHandler = event => {
        if (this.state.mouseDown) {
            event.persist();
            this.setState(
                prevState => {
                    return {
                        pixelArray: [...prevState.pixelArray,
                            {x: event.clientX, y: event.clientY}]
                    }
                }
            )
        }
    };


    mouseDownHandler = () => {
        this.setState({mouseDown: true});
    };


    drawImage = (eventArray) => {
        console.log(eventArray)
        const context = this.canvas.getContext('2d');

        eventArray.forEach(one => {


            const color = `rgba(${one.rgb.r},${one.rgb.g},${one.rgb.b},255)`
            one.pixelArray.forEach(pixel => {
                context.fillStyle = color;
                    context.beginPath();
                context.arc(pixel.x, pixel.y, 10, 0, 2 * Math.PI);
                context.stroke();
                context.fill();
            })

        });
    };


    mouseUpHandler = () => {


        this.websocket.send(JSON.stringify({
            type: 'SET_LINE',
            pixelArray: this.state.pixelArray,
            rgb: this.state.rgb
        }));
        this.setState({
            mouseDown: false,
            pixelArray: [],
        })

    };


    handleChangeComplete = (color) => {
        this.setState({rgb: color.rgb})
    };


    render() {
        return (
            <div>

                <canvas ref={elem => this.canvas = elem} style={{border: "1px solid red"}} width={1024} height={768}
                        onMouseDown={this.mouseDownHandler}
                        onMouseUp={this.mouseUpHandler}
                        onMouseMove={this.canvasMouseHandler}>

                </canvas>
                <SketchPicker color={ this.state.rgb } onChangeComplete={ this.handleChangeComplete }/>
            </div>
        );
    }
}

export default App;
