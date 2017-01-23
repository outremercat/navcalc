import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: 'app.component.html', 
    styleUrls: [ 'app.component.css' ]  
})
export class AppComponent  { 
    
    display = '0'; 
    lastDisplay = '';
    inputDegrees = 0;
    inputMinutes = 0;
    stackDegrees = 0;
    stackMinutes = 0;
    lastInput = "";
    lastOperation = "";

    degreeSign = String.fromCharCode(176);


    doClear() {
        this.display = "0";
        this.stackDegrees = 0;
        this.stackMinutes = 0;
        this.lastInput = "";
        this.lastOperation = "";
    }

    inputLengthOk() : boolean {
        return !(this.display.length > 15); 
    }

    doNumber(num: number) : void {
        // check length
        if (!this.inputLengthOk()) {
            return;
        }
        // deal with 0 and when the previous input was an operation
        if (this.display == "0" || this.lastInput != "number") {
            this.display = String(num);
        } else {
            // add the digit
            this.display += num;
        }
        this.lastInput = "number";
    }

    doPeriod() : void {
        // check length
        if (!this.inputLengthOk()) {
            return;
        }

        // if the last input was an operation then make the display 0 dgr 0. and the input
        if(["plus", "minus", "equal", ""].indexOf(this.lastInput) >= 0) {
            this.display = "0" + this.degreeSign + " " + "0.";
            this.lastInput = "number";
        }
        // if there's already a '.' don't add another
        if (!this.display.includes(".")) {
            this.display += ".";
        }
    }

    parseDisplay() : void {
        // check if degrees sign there
        if (this.display.includes(this.degreeSign)) {
            //  split at degree sign
            let values = this.display.split(this.degreeSign)
            this.inputDegrees = +values[0];
            this.inputMinutes = +values[1];
        } else {
            // assume it's all minutes
            this.inputMinutes = +this.display;
            this.inputDegrees = 0;
        }

    }

    doDegree() : void {
        // check input
        // if the degree sign is already on the display, don't do anything
        if (this.display.includes(this.degreeSign)) {
            return;
        } 

        let degrees: number = +this.display;

        // if degrees > 360 take the modulo
        if (degrees > 360) {
            degrees = this.floatSafeRemainder(degrees,360);
        }

        this.display = String(degrees);
        this.display += (this.degreeSign + " ");
    }


    // float safe modulo computation
    floatSafeRemainder(val: number, step: number) {
        let valDecCount = (val.toString().split('.')[1] || '').length;
        let stepDecCount = (step.toString().split('.')[1] || '').length;
        let decCount = valDecCount > stepDecCount? valDecCount : stepDecCount;
        let valInt = parseInt(val.toFixed(decCount).replace('.',''));
        let stepInt = parseInt(step.toFixed(decCount).replace('.',''));
        return (valInt % stepInt) / Math.pow(10, decCount);
    }

    // deal with minutes > 60 and < 0 and degrees > 360 and < 0
    checkStack() : void {
        // check minutes
        if (this.stackMinutes >= 60) {
            //let remainder = this.stackMinutes % 60;
            let remainder = this.floatSafeRemainder(this.stackMinutes, 60);

            let addDegrees = Math.floor(this.stackMinutes / 60);
            if (addDegrees > 360) {
                addDegrees = this.floatSafeRemainder(addDegrees,360);
            }
            this.stackDegrees += addDegrees;
            this.stackMinutes = remainder;
        } else if (this.stackMinutes < 0) {
            let remainder = this.floatSafeRemainder(this.stackMinutes, 60);
            let subDegrees = Math.floor(this.stackMinutes / 60);
            if (subDegrees > 360) {
                subDegrees = this.floatSafeRemainder(subDegrees,360);
            }
            this.stackDegrees += subDegrees;    // value negative, so this will substract
            this.stackMinutes = remainder+60;
        }

        // check degrees
        if (Math.abs(this.stackDegrees) > 360) {
            this.stackDegrees = this.floatSafeRemainder(this.stackDegrees,360);
        }
        if (this.stackDegrees < 0) {
            this.stackDegrees += 360;
        }

    }

    updateDisplay() : void {
        // update display
        this.display = String(this.stackDegrees) + this.degreeSign + " ";
        this.display += (String(this.stackMinutes) + "'");  
    }

    doPlus() : void {
        if (this.lastInput == "number") {
            // get input
            this.parseDisplay();

            // update stack
            this.stackDegrees += this.inputDegrees;
            this.stackMinutes += this.inputMinutes; 
            this.inputDegrees = 0;
            this.inputMinutes = 0;    

            this.checkStack();
            this.updateDisplay();
        }
        this.lastInput = "plus";
        this.lastOperation = "plus";
    }

    doMinus() : void {
        if (this.lastInput == "number") { 
            // get input
            this.parseDisplay();

            if (this.lastOperation == "minus") {
                // update stack
                this.stackDegrees -= this.inputDegrees;
                this.stackMinutes -= this.inputMinutes; 
                this.inputDegrees = 0;
                this.inputMinutes = 0;    
            } else {
                this.stackDegrees = this.inputDegrees;
                this.stackMinutes = this.inputMinutes;
            }
            this.checkStack();
            this.updateDisplay();
        }

        this.lastInput = "minus";
        this.lastOperation = "minus";
    }

    doEquals() : void {
        this.parseDisplay();

        if(this.lastInput == "plus" || this.lastInput == "minus") {
            return;
        }
        if (this.lastOperation == "plus") {
            // update stack
            this.stackDegrees += this.inputDegrees;
            this.stackMinutes += this.inputMinutes; 
            this.inputDegrees = 0;
            this.inputMinutes = 0;
        } else if (this.lastOperation == "minus") {
            // update stack
            this.stackDegrees -= this.inputDegrees;
            this.stackMinutes -= this.inputMinutes; 
            this.inputDegrees = 0;
            this.inputMinutes = 0;
        } else if( this.lastOperation == "") {
            this.stackDegrees = this.inputDegrees;
            this.stackMinutes = this.inputMinutes; 
            this.inputDegrees = 0;
            this.inputMinutes = 0;
        }

        this.checkStack()
        this.updateDisplay();

        this.lastInput = "equal";
        this.lastOperation = "equal"
    }

}