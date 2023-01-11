// CLASS DEFINITIONS FOR AN AUTOMATIC TELLER MACHINE SIMULATION
// PROJECT STARTED BY CHRIS BRANNAN 31 JULY 2021


class Display {
  constructor() {
    let margin = 12;
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth - margin;
    this.canvas.height = window.innerHeight - margin;
    this.canvas.style.backgroundColor = "gray";
    this.canvas.style.margin = margin / 2;
    this.canvas.style.cursor = "none";
    this.canvas.setAttribute("onclick", "main.sim.click() ;");

    this.context = this.canvas.getContext("2d");

    // ADD CANVAS TO DOCUMENT BODY
    document.body.appendChild(this.canvas);
  }

  update = () => {
    let margin = 12;
    this.canvas.width = window.innerWidth - margin;
    this.canvas.height = window.innerHeight - (margin * 2);
    this.canvas.style.backgroundColor = "gray";
    this.canvas.style.margin = margin / 2 + "px";
  }

  clear = () => {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  }
} // END OF DISPLAY CLASS

class AudioMan {

  constructor() {

    this.mute = false;
    this.sfxOn = true;
    this.musicOn = true;
    this.volume = 1.0;

  }

  toggleMute() {
    if (this.mute === true) {
      this.mute = false;
    } else {
      this.mute = false;
    }
  }

  toggleMusic() {
    if (this.musicOn === true) {

      this.musicOn = false;

    } else {

      this.musicOn = true;

    }
  }

  toggleSFX() {

    if (this.sfxOn === true) {
      this.sfxOn = false;
    } else {
      this.sfxOn = true;
    }
  }
}

class Simulation {

  constructor(startTime) {

    // SET SIMULATION CLOCK
    let clock = new Date();

    if (startTime !== undefined) {
      clock.setHours(startTime);
    }

    this.clock = clock;
    this.clockSpeed = 0;
    this.running = false;
    this.tick;
    this.tock;
    this.refresh;

    this.objects = [];
    this.buttons = [];

    // SET UP SIMULATION IN A CANVAS AREA
    let area = new Display();
    this.area = area;

    // SET UP AUDIO MANAGER
    this.audio = new AudioMan();

    // SET UP LOCAL MOUSE CURSOR
    this.crsr = {
      X: 10,
      Y: 10
    };

    // DEBUGGER
    this.debug = {};

    this.showTime();
    this.run(1);

  } // END SIMULATION CONSTRUCTOR

  updateCursor(event) {
    this.crsr = {
      X: event.clientX - 6,
      Y: event.clientY - 6
    };

  }

  click() {

    for (const button of this.buttons) {
      if ((button.state === "hover") && (button.click !== undefined)) {
        button.click();
      }
    }
  }

  showCursor() {

    let crsr = this.area.context;
    crsr.beginPath();
    crsr.arc(this.crsr.X, this.crsr.Y, 4, 0, 2 * Math.PI);
    crsr.fillStyle = "cyan";
    crsr.fill();

  }

  showTime() {

    // BACKGROUND BOX
    let box = this.area.context;
    box.fillStyle = "black";
    let tw = 172;
    box.fillRect(this.area.canvas.width - 2 - (tw), 2, tw, 22);

    // DISPLAY TIME IN CANVAS
    let time = this.area.context;
    time.font = "15px Ariel";
    time.textAlign = "center";
    time.fillStyle = "white";
    time.fillText(this.clock.toLocaleString(), 
                    this.area.canvas.width - (tw / 2), 18);

  }

  speedUp() {
    this.clockSpeed += 1;
    this.run(this.clockSpeed);
  }

  pause() {
    this.clockSpeed = 0;
    clearInterval(this.tick);
    clearInterval(this.refresh);
    // clearInterval(this.refresh) ;

    return this.running = false;
  }

  update() {

    this.showTime();
    return;
  }

  updateSimArea = () => {

    this.area.clear();
    this.area.update();
    this.update();

    for (const object of this.objects) {
      if (object.model()) {
        object.model();
      }

      // BUTTONS
      if (object.buttons) {
        this.buttons = object.buttons;
      }
    }

    this.showCursor();
  }

  run(clockSpeed) {

    this.clockSpeed = clockSpeed;

    if (this.tick) {
      clearInterval(this.tick);
    }

    if ((clockSpeed >= 1)) {

      this.tock = 1000 / clockSpeed;
      const clock = this.clock;
      this.tick = setInterval(function () {

        if (clockSpeed > 9) {
          clock.setSeconds(clock.getSeconds() + 11);
        } else {
          clock.setSeconds(clock.getSeconds() + 1);
        }
        this.clock = clock;

      }, (clockSpeed >= 50) ? (20) : (this.tock));

    }

//    if (clockSpeed >= 10) {
//        
//        this.tock = 1000 / clockSpeed ;
//        let clock = this.clock ; 
//        this.tick = setInterval(function() {
//            // clock.setMinutes(clock.getMinutes() + 1) ;
//            clock.setSeconds(clock.getSeconds() + 11) ; 
//            this.clock = clock ;}, this.tock) ;
//    }

    // REFRESH DISPLAY
    if (this.refresh === undefined) {

      // this.refresh = refresh(this) ;
      this.refresh = setInterval(this.updateSimArea, 16);

    }

    for (const atm of this.objects) {

      if (atm.clockSpeed) {
        atm.clockSpeed = clockSpeed;
      }

      if (atm.genTransaction()) {

        atm.genTransaction();

      }
      return this.running = true;

    }

    if (clockSpeed < 1) {

      this.pause();
      return this.running = false;

    }

  }

} // END OF SIMULATIONN CLASS


class ATM {

  constructor(HowManyTwentys, HowManyTens, maxWithdrawal, atmFee, sim) {

    this.atmID = "0000" + Math.floor(Math.random() * 9999) + 1001;
    this.numberOfTwentys = 0;
    this.numberOfTens = 0;
    this.maxWithdrawal = (maxWithdrawal) ? (maxWithdrawal) : (400);

    this.atmFee = (atmFee) ? (atmFee) : (4);

    this.feesCollected = 0;
    this.set_ATM_Balance();

    this.ready === false;
    this.atmIsOpen = true;
    this.transResult = "No transaction has been made.";
    this.report = this.statusReport();

    // SET COUNTERS
    this.counter = {

      approaches: 0,
      inFunds: 0,
      balance: 0,
      withdrawal: 0,
      canceled: 0,
      fail: 0,
      error: 0,
      restock: 0
    };

    // SESSION DATA
    this.session = {};

    // RECEIPTS
    this.receipts = [];

    // STOCK VALUES
    this.stockedTwentys = (HowManyTwentys) ? (HowManyTwentys) : (2500);

    this.stockedTens = (HowManyTens) ? (HowManyTens) : (250);


    // INTERNAL TIMERS
    this.timer = {};

    // SIM INFORMATION
    this.sim = (sim === undefined) ? (function () {
      console.log("Warning!  No sim defined");
      return undefined;
    }) : (sim);


    // SIM INFORMATION
    if (sim) {

      this.clockSpeed = 1;

      this.simArea = sim.area.context;

      this.crsr = sim.crsr; // CURSOR INFORMATION

      this.screen = {
        active: "boot",
        // MESSAGES
        messages: {
          header: "|| BOOTING ||",
          currMessage: "Yellow!",
          PIN: "",
          memory: "World!"
        },
        // COLORS
        color: {
          bg: "rgb(32 32 32",
          fg: "rgb(196 196 96)",
          off: "rgb(32, 32, 32)"
        },
        // PAGE
        page: 0
      };

      // BUTTON INFORMATION
      this.buttons = [];

      // PUSH TO SIM
      this.sim.objects.push(this);

      // AUDIO
      this.audio = this.sim.audio;

      if (this.audio.mute === false) {

        this.sfx = {
          ack: 'sources/media/audio/sfx/ackBeep.mp3',
          keyPress: 'sources/media/audio/sfx/keypadButton1.mp3',
          tick: 'sources/media/audio/sfx/chirp.mp3',
          dispense: 'sources/media/audio/sfx/dispense.mp3',
          chaChing: 'sources/media/audio/sfx/chaChing.mp3',
          shredder: 'sources/media/audio/sfx/shredder.mp3',
          error: 'sources/media/audio/sfx/err.mp3',
          restock: 'sources/media/audio/sfx/restock.mp3',
          receipt: 'sources/media/audio/sfx/receipt.mp3'
        };
      } else {

        this.sfx = {};

      }
    }

    const sfx = new Audio(this.sfx.restock);
    sfx.volume = 1;
    sfx.play();

    // CONTRUCTION MESSAGE
    let constMessage = "ATM " + this.atmID +
            " has been created.\n\n------------------\n" +
            "\n** CLICK FOR SOUND **\n\n------------------\n\n" +
            "This ATM is being stocked with:\n" + this.stockedTens +
            " ten dollar bills = $" + this.stockedTens * 10 + "\n" +
            this.stockedTwentys + " twenty dollar bills = $" +
            this.stockedTwentys * 20 + "\n------------------\nTotal stocked " +
            "balance: $" + ((this.stockedTens * 10) + 
            (this.stockedTwentys * 20)) + ".\n\nThis ATM charges a $" + 
            this.atmFee + " service fee.";

    console.log("------------------");
    console.log(constMessage);
    console.log("------------------");

    this.displayMessage(constMessage);
    this.stockATM(true);

    setTimeout(this.initializeATM, 15000);

  } // END CONSTRUCTOR

  set_ATM_Balance() {

    this.totalBalance = (this.numberOfTens * 10) + (this.numberOfTwentys * 20);
    return this.totalBalance;

  }

  initializeATM = () => {
    // RESET ATM
    this.session = {};
    this.clearButtons();
    this.transResult = "No transaction has been made.";

    if (this.timer.shredder) {
      clearTimeout(this.timer.shredder);
    }

    this.screen.color.bg = "rgb(32 64 0)";
    this.screen.color.fg = "rgb(196 196 96)";
    this.screen.color.off = "rgb(32 32 32)";

    this.ready = true;



    // CHECK SYSTEM STATUS
    if (this.set_ATM_Balance() < this.maxWithdrawal) {

      this.ready = false;
      this.stockScreen();

    } else {

      // RESET TO DEFAULT CLOCK SPEED IF SLOWED
      // ALSO GENERATES NEXT TRANSACTION
      let dClk = (this.sim.clockSpeed > 1) ? (this.sim.clockSpeed) : (10);

      this.sim.run(dClk);
      this.welcomeScreen();

    }
  }

  stockATM = (boot) => {

    const sfx = new Audio(this.sfx.restock);
    sfx.volume = 1;
    sfx.play();

    this.clearButtons();

    if (this.timer.stock) {
      clearTimeout(this.timer.stock);
    }

    const stock = () => {

      if (this.numberOfTwentys < this.stockedTwentys) {

        this.numberOfTwentys = this.numberOfTwentys + 2;

      }

      if (this.numberOfTens < this.stockedTens) {

        this.numberOfTens++;

      }

      if ((this.numberOfTens < this.stockedTens) ||
              (this.numberOfTwentys < this.stockedTwentys)) {

        this.timer.stock = setTimeout(stock, 2);

      }

      return;

    };

    if ((this.numberOfTens < this.stockedTens) ||
            (this.numberOfTwentys < this.stockedTwentys)) {

      stock();

    }

    //  RESET SERVICE FEE COLLECTION
    this.feesCollected = 0;

    // EXTRA HANDLING IF NOT A PART OF "BOOT" SEQUENCE
    if ((!boot) || (boot === false)) {

      this.screen.messages.header = "Restocking CA$H";

      let stockMessage = "This ATM is being stocked with:\n" +
              this.stockedTens + " ten dollar bills = $" +
              this.stockedTens * 10 + "\n" + this.stockedTwentys +
              " twenty dollar bills = $" + this.stockedTwentys * 20 +
              "\n------------------\nTotal stocked " + "balance: $" +
              ((this.stockedTens * 10) + (this.stockedTwentys * 20));

      this.displayMessage(stockMessage);
      console.log(stockMessage);

      this.transResult = stockMessage;
      this.makeReceipt("Restock");

      this.counter.restock++;

      setTimeout(this.initializeATM, 10000);

    }

  } // END STOCK FUNCTION

  stockScreen() {
    this.clearButtons();
    const sfx = new Audio(this.sfx.error);
    sfx.volume = .8;
    sfx.play();

    this.screen.color.bg = "rgb(96 32 0)";
    this.screen.messages.header = "MAINTENANCE REQUIRED";
    this.displayMessage("This ATM Machine is too low on ca$h to operate.");

    console.log("This ATM Machine is too low on ca$h to operate.");

    const currObj = this;

    const restockButton = {
      screen: this.screen,
      placement: "center",
      label: "Restock",
      size: "full",
      click: function () {

        currObj.keyPress();
        currObj.stockATM();

      }
    };

    this.buttons.push(restockButton);

    this.timer.stock = setTimeout(this.stockATM, 30000);

  }

  genTransaction() {

    if (this.ready === true) {
      // GENERATE RANDOM TRANSACTION
      if (this.timer.nextTransaction) {
        clearTimeout(this.timer.nextTransaction);
      }

      let roll = Math.floor(Math.random() * 240000) + 5000;

      console.log("Next transaction in " + (roll / 1000) /
              this.sim.clockSpeed + " seconds.");

      this.timer.nextTransaction = setTimeout(this.use, roll /
              this.sim.clockSpeed);
    }
  }

  nextPage() {
    this.screen.page++;
  }

  backPage() {
    if (this.screen.page > 0) {
      this.screen.page--;
    }
  }

  keyPress() {
    const keyp = new Audio(this.sfx.keyPress);
    keyp.volume = .5;
    keyp.play();
  }

  displayMessage(x) {

    if (this.timer.typeWriter) {
      clearTimeout(this.timer.typeWriter);
    }

    const typewriter = (messageIn, speed, inc, mO) => {

      var i = (inc) ? (inc) : (0);
      var messageOut = (mO) ? (mO) : ("");


      if (i < messageIn.length) {

        messageOut += messageIn.charAt(i);

        let scrn = this.screen;

        scrn.messages.currMessage = messageOut;

        const sfx = new Audio(this.sfx.tick);
        sfx.volume = .3;
        sfx.play();

        i++;
        this.timer.typeWriter = setTimeout(function () {
          typewriter(messageIn, speed, i,
                  messageOut);
        }, speed);

        return messageOut;

      }
    };

    if (x) {

      this.screen.messages.memory = x;

      if (this.sim.clockSpeed > 9) {
        this.screen.messages.currMessage = x;
      } else {
        typewriter(x, 20);
      }
    }
  }

  PIN_Entry() {

    this.screen.messages.PIN = "";

    const PINEntry = (messageIn, inc, mO) => {

      var i = (inc) ? (inc) : (0);
      var messageOut = (mO) ? (mO) : ("");

      let speed = Math.floor(Math.random() * 801) + 400;
      ;

      const currObj = this;


      if (i < messageIn.length) {

        messageOut += messageIn.charAt(i);

        let scrn = this.screen;

        scrn.messages.PIN = messageOut;

        let sfx = new Audio(this.sfx.keyPress);
        sfx.volume = .3;
        sfx.play();

        if (i === 3) {
          sfx = new Audio(this.sfx.ack);
          sfx.volume = .3;
          setTimeout(function () {
            sfx.play();
            let msg = "** VERIFYING **\n\nPLEASE STAND BY";
            currObj.displayMessage(msg);
            currObj.screen.messages.PIN = "";
            setTimeout(currObj.useScreen, speed * 4);

          }, speed);
        }

        i++;
        setTimeout(function () {
          PINEntry(messageIn, i,
                  messageOut);
        }, speed);

        return "complete";

      }
    };

    setTimeout(function () {
      PINEntry("****");
    }, 2000);
  }

  makeReceipt = (type) => {
    const rsfx = new Audio(this.sfx.receipt);
    rsfx.volume = .4;
    rsfx.play();

    let tn;
    let t;

    let bal = undefined;
    let startBal = undefined;


    switch (type) {
      case "Balance":

        tn = "00" + this.counter.approaches + "B0200" +
                this.counter.balance;

        t = "Balance Inquiry";

        startBal = this.session.startBalance;
        bal = this.session.balance;


        break // END BALANCE

      case "Withdrawal" :

        tn = "00" + this.counter.approaches + "W0100" +
                this.counter.withdrawal;

        t = "Withdrawal";

        startBal = this.session.startBalance;
        bal = this.session.balance;

        break // END WITHDRAWAL

      case "Error" :

        tn = "00" + this.counter.approaches + "E10" +
                this.counter.error;

        t = "Error";

        break; // END ERROR

      case "IF" :

        tn = "00" + this.counter.approaches + "IF100" +
                this.counter.inFunds;

        t = "Insufficent Funds";

        break;

      case "Restock" :

        tn = this.counter.approaches + " - R - 00" +
                this.counter.approaches;

        t = "Restock";

        break;

      default :

        tn = this.counter.approaches + " - O - 00" +
                this.counter.approaches;

        t = type;

        break;
    } // END SWITCH

    // MAKE RECEIPT

    let id = this.atmID;
    let clock = this.sim.clock.toLocaleString();
    let result = (this.transResult) ? (this.transResult) : ("N/A");
    let detail = (this.session.details) ? (this.session.details) : ("N/A");
    startBal = (startBal) ? (startBal) : ("N/A");
    bal = (bal) ? (bal) : ("N/A");

    const receipt = {

      ATMID: id,
      transactionNum: tn,
      date: clock,
      type: t,
      startBalance: startBal,
      balance: bal,
      result: result,
      details: detail
    };

    let summary = "ATM ID: " + receipt.ATMID + "\n" +
            receipt.date + "\nTransaction Number: " +
            receipt.transactionNum + "\n\nType: " + receipt.type;

    receipt.summary = summary;

    if (receipt.type === "Withdrawal") {

      receipt.summary += "\n\nStarting balance: $" +
              receipt.startBalance + ".00.\n\nResult: " + receipt.result +
              "\n\nRemaining Balancce: $" + receipt.balance + ".00.";

    }

    if (receipt.type === "Balance") {

    }

    console.log(" ");
    console.log("------------------");
    console.log("Here is your receipt: ");
    console.log("------------------");
    console.log(receipt);
    console.log("------------------");
    console.log("------------------");

    this.receipts.push(receipt);

    return receipt;

  }

  makeButton(placement, label, screen, func, amount, size) {

    var keyp = new Audio(this.sfx.keyPress);

    const currObj = this;

    const button = {

      screen: screen,
      placement: (placement) ? (placement) : ("center"),
      size: (size) ? (size) : ("full"),
      label: label,
      amount: (amount) ? (amount) : (undefined),
      click: (amount) ? (
              function () {

                currObj.keyPress();
                func(amount);
              }) :
              (function () {

                currObj.keyPress();
                func();
              }),

      state: "default"

    };

    this.buttons.push(button);

  }

  shredder = () => {
    this.clearButtons();
    const sfx = new Audio(this.sfx.shredder);
    sfx.volume = .6;
    sfx.play();

    this.screen.messages.header = "YOUR CARD GOT SHREDDED!";
    let message = "Due to inactivity, this machine ate your card." +
            "\n\n\nYou're welcome!" +
            "\n\n\n\nFor customer Service call: 1-800-DON'T-CALL-US";

    this.displayMessage(message);

    setTimeout(this.initializeATM, 10000);
  }

  clearButtons() {
    this.buttons = [];
  }

  graph() {

    const screen = this.screen;
    const ga = this.simArea;

    const graphArea = {
      W: 88,
      H: 200,
      X: screen.rb,
      Y: screen.Y
    };

    this.graphArea = graphArea;

    ga.strokeStyle = screen.color.fg;
    ga.lineWidth = 2;
    ga.fillStyle = screen.color.fg;
    ga.textAlign = "left";
    ga.font = "11px Monospace";

    ga.strokeRect(graphArea.X - graphArea.W, graphArea.Y, graphArea.W,
            graphArea.H);

    // DISPLAY ATM DOLLAR BILL STOCK
    let barHeight = graphArea.H - 40;

    // $10 BILLS

    let perc = (this.numberOfTens / this.stockedTens);
    let fill = perc * barHeight;

    if (perc < .1) {
      ga.fillStyle = "rgb(196 64 0)";
    }

    ga.fillRect(graphArea.X - (graphArea.W / 1.25), graphArea.Y,
            graphArea.W / 4, fill);

    ga.fillStyle = screen.color.fg;

    ga.fillText("$10's", graphArea.X - (graphArea.W / 1.25), (graphArea.Y +
            barHeight + 8));

    // $20 bills

    perc = (this.numberOfTwentys / this.stockedTwentys);
    fill = perc * barHeight;

    ga.fillStyle = screen.color.fg;

    if (perc < .1) {
      ga.fillStyle = "rgb(196 64 0)";
    }

    ga.fillRect(graphArea.X - (graphArea.W / 2.5), graphArea.Y,
            graphArea.W / 4, fill);

    ga.fillStyle = screen.color.fg;

    ga.fillText("$20's", graphArea.X - (graphArea.W / 2.5), (graphArea.Y +
            barHeight + 8));

    ga.textAlign = "center";
    ga.fillText("STOCK", graphArea.X - (graphArea.W / 2), graphArea.Y +
            graphArea.H - 10);

    // FEES COLLECTED
    perc = this.feesCollected / this.maxWithdrawal;

    if (perc > 1) {
      perc = 1;
    }

    fill = perc * barHeight;

    ga.fillRect(this.screen.X + 6, graphArea.Y + 18, fill,
            12);

    let csfMess = "Service Fees collected: $" + this.feesCollected;
    ga.textAlign = "left";
    ga.fillText(csfMess, this.screen.X + 6, graphArea.Y + 12);

    // LINE CHART / PLOT CHART
    let w = (screen.W / 4);
    let h = 100;
    let x = screen.X + 6;
    let y = screen.Y + 32;
    let rb = x + w;
    let bb = y + h;

    const lineArea = {

      W: w,
      H: h,
      X: x,
      Y: y,
      rb: rb,
      bb: bb

    };

    const lg = this.simArea;
    
    let topCount = 10; // MAX EXPECTED USES
    let timeLimit = 6; // HOURS

    const curTime = new Date(this.sim.clock);
    const limTime = new Date(this.sim.clock);

    limTime.setHours(limTime.getHours() - timeLimit);

    // CONVERT TIME TO PERCENTAGES
    // AND DRAW PLOTTING AREA

    lg.beginPath();
    lg.moveTo(lineArea.X, lineArea.bb);
    lg.lineTo(lineArea.rb, lineArea.bb);
    lg.lineTo(lineArea.rb, lineArea.Y);
    lg.strokeStyle = screen.color.fg;
    lg.lineWidth = 2 ;
    lg.stroke();
    
    // DRAW HOUR LINES
    
    for (let i = timeLimit - 1; i >= 0; i--) {
      const tt = new Date(this.sim.clock) ; // TEMP TIME VAR
      tt.setMinutes(0) ;
      tt.setSeconds(0) ;
      tt.setHours(tt.getHours() - i) ;
      
      let hx = lineArea.X + ((tt.getTime() - limTime.getTime()) /
              (curTime.getTime() - limTime.getTime())) * lineArea.W;
      
      const hl = this.simArea ;
      
      hl.beginPath() ;
      hl.moveTo(hx, lineArea.bb) ;
      hl.lineTo(hx, lineArea.Y) ;
      
      hl.lineWidth = .5 ;
      // hl.strokeStyle = "rgb(64 64 64)" ;
      hl.stroke() ;
      
    }
    

    // LABELS
    lg.textAlign = "right";
    let gyLabel = topCount + " uses/hr_" ;
    lg.fillText(gyLabel, lineArea.rb, lineArea.Y) ;
    
    lg.textAlign = "left";
    let glabel = "-" + timeLimit + "hrs";
    lg.fillText(glabel, lineArea.X, lineArea.bb + 10);

    lg.textAlign = "right";
    lg.fillText(curTime.toLocaleString(), lineArea.rb, lineArea.bb + 10);

    // SET UP DATASET
    const rcpts = this.receipts.filter(function (receipt) {
      let rTime = receipt.date.getTime;

      if (rTime > limTime.getTime()) {
        return receipt;
      }
    });

    let i = 0;
    let py = 0;
    const lDate = new Date();
    var prevPlot = {};
    
    
    // PLOT RECEIPTS

    for (const data of this.receipts) {

      i++;
      const plot = this.simArea;
      const time = new Date(data.date);


      // STORE LAST RECEIPT HOUR AND COMPARE TO CURRENT RECEIPT HOUR

      if (lDate.getHours() === time.getHours()) {

        lDate.setTime(time.getTime());

      } else {

        py = 0;
        lDate.setTime(time.getTime());

      }

      if (prevPlot.type === "Restock") {
        py = 0;
      }

      py++;

      // DO SOME MATH AND COLOR PLOTS
      let px = lineArea.X + ((time.getTime() - limTime.getTime()) /
              (curTime.getTime() - limTime.getTime())) * lineArea.W;

      let size = 2;

      plot.fillStyle = screen.color.fg;
      if (data.type === "Withdrawal") {
        plot.fillStyle = "lime";
      }
      if (data.type === "Insufficent Funds") {
        plot.fillStyle = "red";
      }
      if (data.type === "Restock") {
        plot.fillStyle = "orange";
        py = topCount / 2;
        size = 6;
      }

      if (time > limTime) {

        // DRAW PLOTS
        plot.beginPath();
        plot.arc(px, lineArea.bb - ((py / topCount) * lineArea.H),
                size, 0, 2 * Math.PI);

        plot.fill();

      }

      prevPlot = data ;
      
    }

  } // END GRAPHS

  atmScreen() {

    if (this.simArea !== undefined) {

      // UPDATE ATM SCREEN

      let sScale = 1;

      let sW = (this.simArea.canvas.width > 1024) ? (1024) :
              (this.simArea.canvas.width - 24);
      let sH = sW * .75;
      let sX = (this.simArea.canvas.width / 2) - (sW / 2);
      let sY = 60;
      let sRb = sX + sW;
      let sBb = sY + sH;
      let cX = (sX + (sW / 2));
      let cY = (sY + (sH / 2));
      let active = this.screen.active;
      const msgs = this.screen.messages;
      const colors = this.screen.color;
      let page = this.screen.page;

      this.screen = {

        scale: sScale,
        X: sX,
        Y: sY,
        W: sW,
        H: sH,
        cX: cX, // X-CENTER OF ATM SCREEN
        cY: cY, // Y-CENTER
        rb: sRb, // RIGHT BORDER OF ATM SCREEN
        bb: sBb, // BOTTOM BORDER OF ATM SCREEN
        active: active,
        page: page,
        color: colors,
        // MESSAGES
        messages: msgs,
        // BUTTON INFORMATION
        btnW: 256,
        btnH: 64,
        buttMarg: 12

      };

      const atmScreen = this.simArea;

      const scrn = this.screen;

      // HEADER
      let header = atmScreen;
      let hSize = 64;

      let cInfo;
      let ci;

      // **** OPERATE SCREEN ****
      switch (this.screen.active) {

        case "boot" :

          atmScreen.fillStyle = this.screen.color.bg;
          atmScreen.fillRect(this.screen.X, this.screen.Y,
                  this.screen.W, this.screen.H);

          header.textAlign = "center";
          header.font = hSize + "px Monospace";
          header.strokeStyle = this.screen.color.fg;
          header.strokeText(this.screen.messages.header, cX, cY -
                  (hSize * 2));

          // CENTERED INFORMATION
          cInfo = atmScreen;
          cInfo.textAlign = "center";
          cInfo.fillStyle = this.screen.color.fg;
          cInfo.font = "18px Monospace";

          ci = this.screen.messages.currMessage.split("\n");

          for (let i = 0; i < ci.length; i++) {

            cInfo.fillText(ci[i], (this.screen.cX),
                    ((this.screen.cY) + (16 * i) - 60));

          }

          this.graph();

          break; // END BOOT

        case "welcome" : // WELCCOME SCREEN

          atmScreen.fillStyle = this.screen.color.bg;
          atmScreen.fillRect(this.screen.X, this.screen.Y,
                  this.screen.W, this.screen.H);

          // HEADER
          header.textAlign = "center";
          header.font = hSize + "px Monospace";
          header.strokeStyle = this.screen.color.fg;
          header.strokeText(this.screen.messages.header, cX,
                  cY - (hSize * 2));

          // CENTERED INFORMATION
          cInfo = atmScreen;
          cInfo.textAlign = "center";
          cInfo.fillStyle = this.screen.color.fg;
          cInfo.font = "18px Monospace";

          ci = this.screen.messages.currMessage.split("\n");

          for (let i = 0; i < ci.length; i++) {

            cInfo.fillText(ci[i], (this.screen.cX),
                    ((this.screen.cY) + (16 * i) - 60));

          }

          // DISPLAY BUTTONS

          if (this.screen.messages.currMessage ===
                  this.screen.messages.memory) {

            for (const button of this.buttons) {
              button.screen = this.screen;
              drawButton(button, this.buttons,
                      this.sim.crsr);
            }

          }
          // GRAPHS
          this.graph();

          break; // END WELCOME SCREEN

        case "PIN" : // PIN ENTRY SCREEN

          atmScreen.fillStyle = this.screen.color.bg;
          atmScreen.fillRect(this.screen.X, this.screen.Y,
                  this.screen.W, this.screen.H);

          // HEADER                    
          header.textAlign = "center";
          header.font = hSize + "px Monospace";
          header.strokeStyle = this.screen.color.fg;
          header.strokeText(this.screen.messages.header, cX,
                  cY - (hSize * 2));

          // CENTERED INFORMATION
          cInfo = atmScreen;
          cInfo.textAlign = "center";
          cInfo.fillStyle = this.screen.color.fg;
          cInfo.font = "18px Monospace";

          ci = this.screen.messages.currMessage.split("\n");

          for (let i = 0; i < ci.length; i++) {

            cInfo.fillText(ci[i], (this.screen.X + (this.screen.W /
                    2)),
                    ((this.screen.Y) + (this.screen.H / 2) + (16 * i) -
                            60));

          }

          let PIN = atmScreen;

          PIN.fillStyle = this.screen.color.fg;
          PIN.textAlign = "center";
          PIN.font = "24 Monospace";
          PIN.fillText(this.screen.messages.PIN, (this.screen.X +
                  (this.screen.W / 2)),
                  ((this.screen.Y) + (this.screen.H / 2) + (64) -
                          60));
                  
          // GRAPHS
          this.graph();

          break;

        case "use" : // USE SCREEN

          atmScreen.fillStyle = this.screen.color.bg;
          atmScreen.fillRect(this.screen.X, this.screen.Y,
                  this.screen.W, this.screen.H);

          // HEADER                    
          header.textAlign = "center";
          header.font = hSize + "px Monospace";
          header.strokeStyle = this.screen.color.fg;
          header.strokeText(this.screen.messages.header, cX,
                  cY - (hSize * 2));

          // CENTERED INFORMATION
          cInfo = atmScreen;
          cInfo.textAlign = "center";
          cInfo.fillStyle = this.screen.color.fg;
          cInfo.font = "18px Monospace";

          ci = this.screen.messages.currMessage.split("\n");

          for (let i = 0; i < ci.length; i++) {

            cInfo.fillText(ci[i], (this.screen.X +
                    (this.screen.W / 2)),
                    ((this.screen.Y) + (this.screen.H / 2) +
                            (16 * i) - 60));

          }

          // BUTTONS

          for (const button of this.buttons) {
            button.screen = this.screen;
            drawButton(button, this.buttons, this.sim.crsr);
          }


          // GRAPHS
          this.graph();

          break;

        default :

          atmScreen.fillStyle = this.screen.color.off;
          atmScreen.fillRect(this.screen.X, this.screen.Y,
                  this.screen.W, this.screen.H);

          // CENTERED INFORMATION
          cInfo = atmScreen;
          cInfo.textAlign = "center";
          cInfo.fillStyle = this.screen.color.fg;
          cInfo.font = "18px Monospace";

          let dm = "This ATM is closed.";

          ci = dm.split("\n");

          for (let i = 0; i < ci.length; i++) {

            cInfo.fillText(ci[i], (this.screen.X + (this.screen.W /
                    2)),
                    ((this.screen.Y) + (this.screen.H / 2) + (16 * i) -
                            60));

          }

          break;
      } // END SWITCH

      function drawButton(buttonRef, buttonArr, crsr) {

        // BUTTON REFERENCE
        const button = buttonRef;

        const buttons = buttonArr;
        // BUTTON PLACEMENTS

        let shift;

        switch (button.placement) {

          case "center" :

            const centButts = buttons.filter(butt =>
              butt.placement === "center");

            let cB = centButts.indexOf(button);

            shift = (button.screen.btnH +
                    button.screen.buttMarg) * (cB);

            button.X = (button.screen.cX -
                    (button.screen.btnW / 2));

            button.Y = (button.screen.bb - button.screen.btnH -
                    button.screen.buttMarg) - shift;

            button.left = button.X;
            button.right = button.X + button.screen.btnW;
            button.top = button.Y;
            button.bottom = button.Y + button.screen.btnH;

            break;

          case "sides" :

            const sideButts = buttons.filter(butt =>
              butt.placement === "sides");

            let sB = sideButts.indexOf(button);
            let sC = sideButts.length;

            shift = (sB > 0) ? ((button.screen.btnH +
                    button.screen.buttMarg) * ((sB / 2))) :
                    ((button.screen.btnH) * (sB));

            if (sB === 0 || Number.isInteger(sB / 2)) {
              // PUT ALL EVEN NUMBERED INDEXED BUTTONS ON LEFT
              // SIDE OF SCREEN AND ALL OTHERS ON RIGHT SIDE

              // LEFT SIDE
              button.X = (button.screen.X);
              button.Y = (button.screen.bb -
                      button.screen.btnH) - shift;

              button.left = button.X;
              button.right = button.X + button.screen.btnW;
              button.top = button.Y;
              button.bottom = button.Y + button.screen.btnH;

            } else { // RIGHT SIDE

              shift = (sB > 1) ? ((button.screen.btnH +
                      button.screen.buttMarg) *
                      (((sB - 1) / 2))) :
                      ((button.screen.btnH) * (sB - 1));

              button.X = (button.screen.rb - button.screen.btnW);
              button.Y = (button.screen.bb -
                      button.screen.btnH) - shift;

              button.left = button.X;
              button.right = button.X + button.screen.btnW;
              button.top = button.Y;
              button.bottom = button.Y + button.screen.btnH;

            }


            break;

          case "default" :

            // CENTER
            button.X = (button.screen.cX -
                    (button.screen.btnW / 2));
            button.Y = (button.screen.bb - button.screen.btnH -
                    button.screen.buttMarg);

            button.left = button.X;
            button.right = button.X + button.screen.btnW;
            button.top = button.Y;
            button.bottom = button.Y + button.screen.btnH;

            break;

        }

        // UPDATE BUTTON INFO
        button.left = button.X;
        button.right = button.X + button.screen.btnW;
        button.top = button.Y;
        button.bottom = button.Y + button.screen.btnH;

        // CURSOR
        const c = crsr;

        const btn = atmScreen;
        const btnLabel = btn;

        // CHECK MOUSE POSITION AND HOVER EVENTS
        if (((c.X > button.left) && (c.X < button.right)) &&
                ((c.Y > button.top) && (c.Y < button.bottom))) {

          // HOVER STATE
          button.state = "hover";
          btn.strokeStyle = button.screen.color.fg;
          btn.fillStyle = button.screen.color.fg;
          btn.lineWidth = 5;

          btn.fillRect(button.X, button.Y, button.screen.btnW,
                  button.screen.btnH);

          btnLabel.font = " 900 18px Monospace";
          btnLabel.fillStyle = button.screen.color.bg;

        } else {

          // DEFAULT STATE
          button.state = "default";
          btn.strokeStyle = button.screen.color.fg;
          btn.lineWidth = 5;
          btn.fillStyle = button.screen.color.bg;

          btnLabel.font = "normal 18px Monospace";
          btnLabel.fillStyle = button.screen.color.fg;

        }

        btn.strokeRect(button.X, button.Y, button.screen.btnW,
                button.screen.btnH);

        // BUTTON LABEL
        btnLabel.textAlign = "center";


        btnLabel.fillText(button.label,
                ((button.right) - (button.screen.btnW / 2)),
                ((button.bottom) - ((button.screen.btnH -
                        btn.lineWidth) / 2)));

      } // END DRAW BUTTON FUNCITON

    } else {

      console.log("No ATM Screen created.");

    }

  } // END ATM SCREEN

  makeWithdrawalScreen = () => {

    // CARD SHREDDER
    if (this.timer.shredder) {

      clearTimeout(this.timer.shredder);

    }

    this.timer.shredder = setTimeout(this.shredder, 15000);


    this.clearButtons();

    this.screen.messages.header = "Select an Amount";

    let message = "Maximum withdrawal of $" + this.maxWithdrawal;

    if (this.screen.messages.memory !== message) {

      this.displayMessage(message);

    }

    const currObj = this;

    if (this.numberOfTens > 1) {

      // MAKE WITHDRAWAL OPTIONS

      let i = 0;
      do {
        i++;
        let amnt = i * 10;
        let lab = "$" + amnt;

        const wButt = {
          screen: currObj.screen,
          placement: "sides",
          label: lab,
          size: "full",
          click: () => {

            currObj.keyPress();
            currObj.acceptServiceScreen(amnt);

          },
          state: "default"
        };

        this.buttons.push(wButt);
      } while (i < (this.maxWithdrawal / 10))

    } else {

      if (this.numberOfTwentys > 1) {

        // MAKE WITHDRAWAL OPTIONS
        let i = 0;

        do {
          i = i + 2;
          let amnt = i * 10;
          let lab = "$" + amnt;

          const wButt = {
            screen: currObj.screen,
            placement: "sides",
            label: lab,
            size: "full",
            click: () => {

              currObj.keyPress();
              currObj.acceptServiceScreen(amnt);

            },
            state: "default"
          };

          this.buttons.push(wButt);
        } while (i < (this.maxWithdrawal / 10))

      } else {
        this.initializeATM();
      }
    }


    // LIMIT ON-SCREEN BUTTON OPTIONS

    const sideButts = this.buttons.filter(butt =>
      butt.placement === "sides");

    let page = this.screen.page;

    // IF MORE THAN 8 OPTIONS ARE PRESENT
    // DYNAMICALLY CREATE A "MORE" BTN
    let func = this.makeWithdrawalScreen;

    // CREATE "BACK" BUTTON IF NOT ON FIRST PAGE
    const backButton = {
      screen: this.screen,
      placement: "sides",
      label: "<< Back",
      size: "full",
      click: function () {

        currObj.keyPress();
        this.screen.page--;
        func();
      },
      state: "default"
    };

    const nextButton = {
      screen: this.screen,
      placement: "sides",
      label: "Next >>",
      size: "full",
      click: function () {

        currObj.keyPress();
        this.screen.page++;
        func();

      },
      state: "default"
    };

    let func2 = this.useScreen;

    const cancelButton = {
      screen: this.screen,
      placement: "sides",
      label: "<< Cancel",
      size: "full",
      click: function () {

        currObj.keyPress();
        this.screen.page = 0;
        func2();
      },
      state: "default"
    };

    const allButts = this.buttons;

    const pager = {
      a: page * 8,
      b: 8 + (page * 8)
    };

    const buttCount = sideButts.slice(pager.a, pager.b + 1);

    const buttList = sideButts.slice(pager.a, pager.b);

    if (buttCount.length > 8) {

      if (this.screen.page === 0) {

        buttList.unshift(cancelButton, nextButton);

      } else {

        buttList.unshift(nextButton);

      }

    }

    if (this.screen.page > 0) {

      buttList.unshift(backButton);

    }

    this.buttons = buttList;

  } // END WITHDRAWAL SCREEN

  welcomeScreen() {

    const sfx = new Audio(this.sfx.keyPress);
    sfx.volume = .2;
    sfx.play();

    let welcome = "Welcome to CMB Bank! \nThis ATM charges a $" +
            this.atmFee + " service fee.";
    welcome += "\n\n** Maximum daily withdrawal of $" +
            this.maxWithdrawal + " **";

    this.screen.active = "welcome";
    this.screen.page = 0;
    this.screen.messages.header = "Welcome!";
    this.displayMessage(welcome);


    // MAKE BUTTON OBJECT
    const useButton = this.makeButton("center", "Use ATM", this.screen,
            this.pinScreen);

  }

  acceptServiceScreen = (requestedAmount) => {

    if (this.timer.shredder) {

      clearTimeout(this.timer.shredder);

    }

    this.timer.shredder = setTimeout(this.shredder, 15000);

    this.clearButtons();
    this.screen.messages.header = "SERVICE FEE NOTICE";

    let message = "The owner of this ATM charges a $" + this.atmFee +
            " service fee.\n\nDo you accept this charge?";

    this.displayMessage(message);

    const currObj = this;

    const cancelButton = {
      screen: this.screen,
      placement: "sides",
      label: "<< Cancel",
      size: "full",
      click: function () {

        currObj.keyPress();
        currObj.screen.page = 0;
        currObj.useScreen();

      },
      state: "default"
    };

    const acceptButton = {
      screen: this.screen,
      placement: "sides",
      label: "Accept",
      size: "full",
      click: function () {

        let sfx = new Audio(currObj.sfx.ack);
        sfx.play();

        currObj.buttons = [];
        currObj.screen.messages.header = "DISPENSING";
        currObj.displayMessage("Please wait...");

        setTimeout(cont, 3000);

        function cont() {
          currObj.withdrawal(requestedAmount);
        }

      },
      state: "default"
    };

    this.buttons.push(cancelButton, acceptButton);


  } // END ACCEPT SERVICE FEE SCREEN

  pinScreen = () => {

    this.ready = false;
    this.sim.run(1);

    clearTimeout(this.timer.nextTransaction);
    console.log("Next transaction canceled.");

    this.clearButtons();
    this.screen.active = "PIN";
    this.screen.messages.header = "PIN ENTRY";
    this.displayMessage("Please enter your PIN");
    this.screen.messages.PIN = "";

    this.PIN_Entry();

  }

  useScreen = () => {

    this.ready = false;
    this.sim.run(1);

    if (this.timer.shredder) {

      clearTimeout(this.timer.shredder);

    }

    this.timer.shredder = setTimeout(this.shredder, 15000);

    this.clearButtons();

    if (!this.session.balance) {

      this.session.balance = Math.floor(Math.random() * 5000);
      this.session.startBalance = this.session.balance;
    }

    this.screen.active = "use";
    this.screen.messages.header = "CMB Bank";
    this.displayMessage("Please make a selection.");

    this.makeButton("sides", "<< Cancel", this.screen,
            this.cancel);
    this.makeButton("sides", "Make Withdrawal", this.screen,
            this.makeWithdrawalScreen);
    this.makeButton("sides", "Check Balance", this.screen,
            this.balInq);

  }

  model = () => {

    this.atmScreen();

  }

  statusReport() {


    this.set_ATM_Balance();

    let statusReport = "------------------------------------\n" +
            "STATUS REPORT FOR ATM " + this.atmID + "\n" +
            "------------------------------------\n" +
            "ATM " + this.atmID + " has " +
            this.numberOfTwentys + " twenty dollar bills remaining " +
            "and \n" + this.numberOfTens + " ten dollar bills remaining. " +
            "And has a total balance of $" + this.totalBalance +
            "\nThis ATM has collected $" + this.feesCollected +
            " in service fees.";

    console.log(statusReport);
    return statusReport;

  }

  collectServiceFee() {

    this.feesCollected = this.feesCollected + this.atmFee;
    this.transResult += "\n\n$" + this.atmFee + " service fee.";
    this.session.balance -= this.atmFee;

    const sfx = new Audio(this.sfx.chaChing);
    sfx.volume = 1;
    sfx.play();
  }

  cancel = () => {

    this.counter.canceled++;
    this.transResult += " Canceled by user.";

    this.clearButtons();

    this.screen.messages.header = "CANCELED BY USER";

    this.displayMessage("** PLEASE TAKE YOUR CARD **");

    setTimeout(this.initializeATM, 4000 / this.clockSpeed);

  }

  balInq = (isBot) => {
    this.counter.balance++;

    if (this.timer.shredder) {

      clearTimeout(this.timer.shredder);

    }

    this.clearButtons();
    this.screen.messages.header = "BALANCE INQUIRY";

    let message = "Your available balance is: $" + this.session.balance +
            ".00.";

    this.displayMessage(message);

    this.transResult = "Balance Inquiry";

    this.makeReceipt("Balance");

    var cs = this.sim.clockSpeed;

    if ((isBot) && isBot === true) {

      if (this.session.balance > (this.maxWithdrawal - 75)) {

        return setTimeout(this.withdrawal, 15000 / cs);

      }
      return setTimeout(this.initializeATM, 15000 / cs);

    } else {
      return setTimeout(this.useScreen, 15000 / cs);
    }


  }

  inFunds = () => {

    const sfx = new Audio(this.sfx.error);
    sfx.volume = .1;
    sfx.play();

    this.counter.inFunds++;

    this.clearButtons();

    this.screen.color.bg = "rgb(32 0 0)";
    this.screen.color.fg = "rgb(255 128 128)";

    this.screen.messages.header = "Insufficent Funds";

    this.displayMessage("Please check your balance.");

    this.transResult = "Insufficent Funds";

    this.makeReceipt("IF");

    const currObj = this;

    var cs = this.sim.clockSpeed;

    return setTimeout(function () {

      currObj.initializeATM();
    }, 7000 / cs);
    ;
  }

  withdrawal = (requestedAmount) => {

    if (this.timer.shredder) {
      clearTimeout(this.timer.shredder);
    }

    let withdrawalError = false;

    // RANDOM WITHDRAWAL AMOUNT IF AMOUNT REQUESTED IS NOT DEFINED
    let rwa = 0;

    if (this.numberOfTens > 1) {
      rwa = (Math.floor(Math.random() * (this.maxWithdrawal / 10)) + 1) * 10;
    } else {
      rwa = (Math.floor(Math.random() * (this.maxWithdrawal / 20)) + 1) * 20;
    }

    let withdrawalAmount = (requestedAmount) ? (requestedAmount) : (rwa);

    this.ready = false;
    this.screen.messages.header = "Withdrawal";

    // VALIDATE TRANSACTION
    if (this.maxWithdrawal > this.totalBalance) {

      withdrawalError = true;
      this.transResult +=
              "\nATM requires maintenance.  Please try again later.";
    }

    if (withdrawalError === false && isNaN(withdrawalAmount)) {

      withdrawalError = true;
      this.transResult += "\nThis request is invalid.";

    }

    if (withdrawalError === false &&
            withdrawalAmount > this.maxWithdrawal) {

      withdrawalError = true;
      this.transResult += "\nWithdrawal amount must be $" +
              this.maxWithdrawal + " or less.";
    }

    if (withdrawalError === false &&
            !Number.isInteger(withdrawalAmount / 10)) {

      withdrawalError = true;
      this.transResult += "\nWithdrawal amount must be in multiples of $10.";
    }

    if (withdrawalError === false &&
            (!Number.isInteger(withdrawalAmount / 20)) &&
            this.numberOfTens < 1) {

      withdrawalError = true;
      this.transResult += "\nWithdrawal amount must be in multiples of $20.";
    }

    if (withdrawalError === false && (withdrawalAmount >
            this.session.balance)) {

      withdrawalError = true;

      this.transResult = "Requested amount of $" + withdrawalAmount +
              ".00 exceeds the available balance of $" +
              this.session.balance + ".00." +
              "\n\nPlease try a different amount";

      return this.inFunds();
    }

    if (withdrawalError === true) {
      this.screen.messages.header = "ERROR!";
      this.buttons = [];
      this.displayMessage(this.transResult);
      return false;
    }

    // IF NO ERRORS OCCURRED, EXECUTE TRANSACTION

    if (withdrawalError === false) {

      let message = "Withdrawal amount of $" + withdrawalAmount;
      let details = "$" + withdrawalAmount + " was issued in ";

      let TensToIssue = 0;
      let TwentysToIssue = 0;

      // CALCULATE NUMBER OF TENS AND TWENTYS TO ISSUE

      let calc = withdrawalAmount / 20;

      if (Math.floor(calc) <= this.numberOfTwentys) {

        TwentysToIssue = Math.floor(calc);
        this.numberOfTwentys = this.numberOfTwentys - TwentysToIssue;

        // CALCULATE NUMBER OF TENS TO ISSUE

        TensToIssue = ((withdrawalAmount - (TwentysToIssue * 20)) / 10);
        this.numberOfTens = this.numberOfTens - TensToIssue;

      } else {

        // IF NOT ENOUGH TWENTYS, FALLBACK TO TENS

        TwentysToIssue = this.numberOfTwentys;
        TensToIssue = ((withdrawalAmount -
                (TwentysToIssue * 20)) / 10);
        this.numberOfTens = this.numberOfTens - TensToIssue;


      }

      // CREATE SUMMARY OF TRANSACTION

      if (TensToIssue > 1) {
        details += TensToIssue + " Tens";
      }

      if (TensToIssue === 1) {
        details += TensToIssue + " Ten";
      }

      if ((TensToIssue > 0) && (TwentysToIssue > 0)) {
        details += " and ";
      }

      if (TwentysToIssue > 1) {

        details += TwentysToIssue + " Twentys";

      }

      if (TwentysToIssue === 1) {

        details += TwentysToIssue + " Twenty";

      }

      details += ".";

      this.session.details = details;
      this.transResult = message;

      this.session.balance -= withdrawalAmount;

      // COLLECT SERVICE FEE    

      this.collectServiceFee();

      this.counter.withdrawal++;

      const receipt = this.makeReceipt("Withdrawal");

      this.buttons = [];

      this.displayMessage(receipt.summary);

      const currObj = this;

      var cs = this.sim.clockSpeed;

      setTimeout(function () {

        currObj.screen.messages.header = "Thank You!";

        currObj.displayMessage("** TAKE YOUR CARD **");

        setTimeout(function () {

          currObj.initializeATM();
        }, 7500 / cs);

      }, 25000 / cs);

      return true;

    } else {

      this.counter.fail++;
      this.counter.error++;
      this.makeReceipt("Error");

      return false;

    }

  } // END OF WITHDRAWAL METHOD

  use = (type) => { // FOR BOT USE ONLY

    this.counter.approaches++;
    this.ready = false;
    this.buttons = [];

    const sfx = new Audio(this.sfx.ack);
    sfx.volume = .2;
    sfx.play();

    this.session.balance = Math.floor(Math.random() * 5000);
    this.session.startBalance = this.session.balance;

    // CHECK IF ATM IS OPEN FOR BUSINESS
    if (this.atmIsOpen === true) {

      // DETERMINE AND DEFINE TRANSACTION TYPE
      if (type === undefined) {
        type = Math.floor(Math.random() * 10);

        if (type < 4) {
          type = 0;
        } else {
          type = 1;
        }
      }

      this.transType = type;

      switch (type) {
        case 0:
          this.balInq(true);
          break;
        case 1 :

          this.withdrawal();
          break;

        default :
          this.cancel();
      }


      return true;

    } else {

      this.transResult +=
              " Please come back during our normal operating hours.";
      this.displayMessage(transResult);

      return false;

    }
  }

}
// END OF ATM CLASS