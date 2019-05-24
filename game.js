//Aliases
const Application = PIXI.Application,
      Container = PIXI.Container,
      loader = PIXI.loader,
      resources = PIXI.loader.resources,
      Graphics = PIXI.Graphics,
      TextureCache = PIXI.utils.TextureCache,
      Sprite = PIXI.Sprite,
      Text = PIXI.Text,
      TextStyle = PIXI.TextStyle;

const appWidth = 512, appHeight = 768, xOffset = 100, yOffset = 100;

const _ver = "1.2.5";

let classicBgm = document.getElementById("classicBgm");
let santaBgm = document.getElementById("santaBgm");

let bgm = santaBgm;

let app = new Application({
    width: appWidth,
    height: appHeight,
    antialiasing: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x93d1e2
  }
);

let gameArea = document.getElementById("gameArea");
gameArea.appendChild(app.view);

loader
  .add(["material/bg.png",
        "material/nbg.png",
        "material/btn.png",
        "material/temBtn.png",
        "material/timeIntro.png",
        "material/menueBtn.png",
        "material/poplong.json"])
  .on("progress",loadProgressHandler)
  .load(setup);

//game variables and objects
//id for main texure, mouseX and mouseY to capture and convert users input
let id, mouseX =appWidth/2, mouseY = 0,
    //turn is for controlling wheel turning
    //isLaunchable to controll the play state
    wheel, turn, isLaunchable, timer, timeLimit, timeLeft, continueTime,
    //rawBall is an array recording different color for generating
    //maxBallColor to controll how many colors now should generate
    //lastColor for recording what is last ball's color to prevent two same color ball appears continuesly
    rawBall,maxBallColor, lastColor=null, colorStatic, classicTheme, santaTheme,
    //readyBall is ball on the wheel, nextBall is the next readyBall
    //ballX and ballY determine the position of readyBall based on the input
    //launchBall is the readyBall being launched
    //totalBalls is an array contain all balls on the map
    readyBall,ballX, ballY, nextBall, totalBalls, launchBall = null,
    //readyToClear is array of the same color balls ready to be cleared
    //clearMark is the array +100 mark
    //lonelyBall and lonelyMark are for balls has no attach
    readyToClear, clearMark, lonelyBallCopy, lonelyMark,
    //when count > 4, new line of balls created
    //line type determines odd or even number balls current line is.
    //startTime for record start time for time mode to count goal
    //collect Time is goal when clear red ball in time mode.
    count = 0, lineType, goal;

//UI objects
let titleText, startBtn, startText, aboutBtn, aboutText,
    timeModeBtn, timeModeText,
    aboutLine, aboutContent, returnBtn, returnText, qrcode,
    topLine, endLine, santaTopLine, santaEndLine,
    endBG, endTitle, goalText, endText,
    backMenueText, soundBtn, themeBtn, backMenueBtn,
    menueBtn, pauseBtn, pauseText,backMenueBtn2,backMenueText2,
    reText,restartBtn, btnTexure, timeIntro, checkBtn, checkText;

//Scene containers and controlling variables
let state, lastState, bg, bgTexure, santaBgTexure,
    menueScene, gameScene, gameOverScene, topScene;

let menueSlide;

//The loading program show progress when loading
function loadProgressHandler(loader) {
  let loadingBG = new Graphics();
  loadingBG.beginFill(0xffffff);
  loadingBG.lineStyle(2,0x000000,1);
  loadingBG.drawRect(0,0,256,50);
  loadingBG.endFill();
  loadingBG.position.set(appWidth/2-128,appHeight/2-25);
  app.stage.addChild(loadingBG);
  let contentStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black"
  });
  let loadingText = new Text("Loading: " + Math.floor(loader.progress) +"%",contentStyle);
  loadingText.anchor.set(0.5,0.5);
  loadingText.position.set(appWidth/2,appHeight/2);
  app.stage.addChild(loadingText);
  console.log(Math.floor(loader.progress));
}

function setup() {
  /*
  设置方程,布置游戏需要的变量并在最后启动游戏循环
  */

  //Game background imagine
  bgTexure = resources["material/bg.png"].texture;
  santaBgTexure = resources["material/nbg.png"].texture;
  bg = new Sprite(santaBgTexure);
  app.stage.addChild(bg);

  //the main texure file
  id = resources["material/poplong.json"].textures;

  //the sound button to control the bgm
  soundBtn = new Sprite(id["soundon.png"]);
  soundBtn.position.set(400,15);
  soundBtn.play = false;
  soundBtn.interactive = true;
  soundBtn.buttonMode = true;
  soundBtn.on("pointerdown",soundSwitch);
  app.stage.addChild(soundBtn);

  // container for menue scene.
  menueScene = new Container();
  menueScene.position.set(0,0);
  app.stage.addChild(menueScene);
  menueScene.visible = true;

  // container for game scene.
  gameScene = new Container();
  app.stage.addChild(gameScene);
  gameScene.visible = false;

  //container for game over scene.
  gameOverScene = new Container();
  gameOverScene.position.set(0,0);
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;

  topScene = new Container();
  app.stage.addChild(topScene);
  topScene.visible = true;

  btnTexure = resources["material/btn.png"].texture;

  let titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 56,
    fill: "#186f93",
    fontWeight: "bold",
    stroke: '#ffffff',
    strokeThickness: 4
  });

  let btnStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fill: "white"
  });

  let contentStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black",
    align: 'center'
  });

  //Objects for menue scene
  titleText = new Text("Day Day \nBubble Shooter", titleStyle);
  titleText.anchor.set(0.5,1);
  titleText.position.set(appWidth/2,0);
  menueScene.addChild(titleText);

  //Theme button to change the theme
  let themeBtnTexture = resources["material/temBtn.png"].texture;
  themeBtn = new Sprite(themeBtnTexture);
  themeBtn.position.set(30,15);
  themeBtn.interactive = true;
  themeBtn.buttonMode = true;
  themeBtn.on("pointerdown",onButtonUp);
  themeBtn.text = "Theme";
  menueScene.addChild(themeBtn);

  startBtn = new Sprite(btnTexure);
  startBtn.anchor.set(0.5,0.5);
  startBtn.position.set(-300,400);
  startBtn.interactive = true;
  startBtn.buttonMode = true;
  startBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  menueScene.addChild(startBtn);
  startText = new Text("Classic Mode",btnStyle);
  startText.anchor.set(0.5,0.5);
  startText.position.set(-300,400);
  menueScene.addChild(startText);
  startBtn.text = startText;

  timeModeBtn = new Sprite(btnTexure);
  timeModeBtn.anchor.set(0.5,0.5);
  timeModeBtn.position.set(appWidth+300,500);
  timeModeBtn.interactive = true;
  timeModeBtn.buttonMode = true;
  timeModeBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  menueScene.addChild(timeModeBtn);
  timeModeText = new Text("Time Mode",btnStyle);
  timeModeText.anchor.set(0.5,0.5);
  timeModeText.position.set(appWidth+300,500);
  menueScene.addChild(timeModeText);
  timeModeBtn.text = timeModeText;

  aboutBtn = new Sprite(btnTexure);
  aboutBtn.anchor.set(0.5,0.5);
  aboutBtn.position.set(-300,600);
  aboutBtn.interactive = true;
  aboutBtn.buttonMode = true;
  aboutBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  menueScene.addChild(aboutBtn);

  aboutText = new Text("About",btnStyle);
  aboutText.anchor.set(0.5,0.5);
  aboutText.position.set(-300,600);
  menueScene.addChild(aboutText);
  aboutBtn.text = aboutText;

  aboutLine = new Graphics();
  aboutLine.beginFill(0xFFFFFF);
  aboutLine.drawRect(0,0,512,2);
  aboutLine.endFill();
  aboutLine.position.set(0,appHeight);
  menueScene.addChild(aboutLine);

  aboutContent = new Text("策划: Wally Y\n运营: Wally Y\n" +
                          "美工: Wally Y\n开发: Wally Y\n" +
                          "为游戏提供建议的小伙伴们:\n"+
                          "大土贝, 夜书, M_eow, 九幽\n\n" +
                          "版本: " +_ver.toString(),
                          contentStyle);
  aboutContent.anchor.set(0.5,0);
  aboutContent.position.set(appWidth/2,appHeight+100);
  menueScene.addChild(aboutContent);

  returnBtn = new Sprite(btnTexure);
  returnBtn.anchor.set(0.5,0.5);
  returnBtn.position.set(appWidth/2,appHeight+650);
  returnBtn.interactive = true;
  returnBtn.buttonMode = true;
  returnBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  menueScene.addChild(returnBtn);
  returnText = new Text("Return",btnStyle);
  returnText.anchor.set(0.5,0.5);
  returnText.position.set(appWidth/2,appHeight+650);
  menueScene.addChild(returnText);
  returnBtn.text = returnText;

  menueScene.task = 0;

  //Objects for play scene
  santaTopLine = new Graphics();
  santaTopLine.beginFill(0x000000);
  santaTopLine.drawRect(0,0,512,2);
  santaTopLine.endFill();
  santaTopLine.position.set(0,94);
  gameScene.addChild(santaTopLine);

  santaEndLine = new Graphics();
  santaEndLine.beginFill(0x000000);
  santaEndLine.drawRect(0,0,512,2);
  santaEndLine.endFill();
  santaEndLine.position.set(0,576);
  gameScene.addChild(santaEndLine);

  topLine = new Graphics();
  topLine.beginFill(0xffffff);
  topLine.drawRect(0,0,512,2);
  topLine.endFill();
  topLine.position.set(0,94);
  gameScene.addChild(topLine);

  endLine = new Graphics();
  endLine.beginFill(0xffffff);
  endLine.drawRect(0,0,512,2);
  endLine.endFill();
  endLine.position.set(0,576);
  gameScene.addChild(endLine);

  topLine.visible =false;
  endLine.visible = false;

  timer = new Text("00:00",contentStyle);
  timer.anchor.set(0.5,0);
  timer.position.set(appWidth/2+30,-30);
  gameScene.addChild(timer);

  menueBtn = new Sprite(resources["material/menueBtn.png"].texture);
  menueBtn.position.set(appWidth-96,appHeight-64);
  menueBtn.interactive = true;
  menueBtn.buttonMode = true;
  menueBtn.on("pointerup",onButtonUp);
  menueBtn.text = "menue";
  gameScene.addChild(menueBtn);

  classicTheme = ["redball.png",'blueball.png','yellowball.png','greenball.png',"sunball.png","moonball.png"];
  santaTheme = ["cb1.png", "cb2.png", "cb3.png", "cb4.png", "cb5.png", "cb6.png"];
  rawBall = santaTheme;
  continueTime = 5000;

  maxBallColor = 3;
  colorStatic = [0,0,0,0,0,0];
  wheel = new Sprite(id["gameWheel.png"]);
  wheel.anchor.set(0.5,0.5)
  wheel.position.set(256,768);
  gameScene.addChild(wheel);

  //ball是准备发射的球
  readyBall = createABall(appWidth/2,appHeight-128);
  gameScene.addChild(readyBall);
  isLaunchable = true;

  //下一个准备发射的球
  nextBall = createABall(64,appHeight - 32);
  gameScene.addChild(nextBall);

  //create map with balls inside.
  //7 lines with invisiball for position finding
  lineType = -1;
  totalBalls = [];

  goalText = new Text("Goal: 0",contentStyle);
  goalText.position.set(30,30);
  gameScene.addChild(goalText);

  //add event for controlling the game
  gameArea.addEventListener("mousemove",onMouseMove);
  gameArea.addEventListener("click",onClick,false);
  gameArea.addEventListener("touchmove",onTouch);
  gameArea.addEventListener("touchend",endTouch,false);

  timeIntro = new Sprite(resources["material/timeIntro.png"].texture);
  timeIntro.position.set(0,0);
  if(!localStorage.getItem("timeRead")) {
    timeIntro.isRead = false;
    console.log(false);
  } else {
    timeIntro.isRead = true;
  }
  topScene.addChild(timeIntro);

  checkBtn = new Sprite(btnTexure);
  checkBtn.anchor.set(0.5,0.5);
  checkBtn.position.set(appWidth/2,400);
  checkBtn.interactive = true;
  checkBtn.buttonMode = true;
  checkBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  topScene.addChild(checkBtn);
  checkText = new Text("Got it",btnStyle);
  checkText.anchor.set(0.5,0.5);
  checkText.position.set(appWidth/2,400);
  topScene.addChild(checkText);
  checkBtn.text = checkText;

  pauseBtn = new Sprite(btnTexure);
  pauseBtn.anchor.set(0.5,0.5);
  pauseBtn.position.set(appWidth/2,300);
  pauseBtn.interactive = true;
  pauseBtn.buttonMode = true;
  pauseBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  topScene.addChild(pauseBtn);
  pauseText = new Text("Continue",btnStyle);
  pauseText.anchor.set(0.5,0.5);
  pauseText.position.set(appWidth/2,300);
  topScene.addChild(pauseText);
  pauseBtn.text = pauseText;

  backMenueBtn2 = new Sprite(btnTexure);
  backMenueBtn2.anchor.set(0.5,0.5);
  backMenueBtn2.position.set(appWidth/2,400);
  backMenueBtn2.interactive = true;
  backMenueBtn2.buttonMode = true;

  backMenueBtn2
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);

  topScene.addChild(backMenueBtn2);

  backMenueText2 = new Text("Back to Menue", btnStyle);
  backMenueText2.anchor.set(0.5,0.5);
  backMenueText2.position.set(appWidth/2,400);
  topScene.addChild(backMenueText2);
  backMenueBtn2.text = backMenueText2;

  timeIntro.visible = false;
  checkBtn.visible = false;
  checkText.visible = false;
  pauseBtn.visible = false;
  pauseText.visible = false;
  backMenueBtn2.visible = false;
  backMenueText2.visible = false;

  //objects for end scene.
  endBG = new Graphics();
  endBG.beginFill(0xC9CACA);
  endBG.lineStyle(5,0xFFFFFF,1);
  endBG.drawRect(0,0,400,550);
  endBG.endFill();
  endBG.alpha = 0.7;
  endBG.position.set(46,70);
  gameOverScene.addChild(endBG);

  endTitle = new Text("Game Over",titleStyle);
  endTitle.anchor.set(0.5,0.5);
  endTitle.x = appWidth/2;
  endTitle.y = 150;
  gameOverScene.addChild(endTitle);

  endText = new Text("finalGoal",contentStyle);
  endText.anchor.set(0.5,0.5);
  endText.position.set(appWidth/2,250);
  gameOverScene.addChild(endText);

  restartBtn = new Sprite(btnTexure);
  restartBtn.anchor.set(0.5,0.5);
  restartBtn.position.set(appWidth/2,350);
  restartBtn.interactive = true;
  restartBtn.buttonMode = true;

  restartBtn
    //pointer方法包括了触摸和鼠标事件
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);

  gameOverScene.addChild(restartBtn);

  reText = new Text("Restart", btnStyle);
  reText.anchor.set(0.5,0.5);
  reText.position.set(appWidth/2,350);
  gameOverScene.addChild(reText);
  restartBtn.text = reText;

  backMenueBtn = new Sprite(btnTexure);
  backMenueBtn.anchor.set(0.5,0.5);
  backMenueBtn.position.set(appWidth/2,450);
  backMenueBtn.interactive = true;
  backMenueBtn.buttonMode = true;

  backMenueBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);

  gameOverScene.addChild(backMenueBtn);

  backMenueText = new Text("Menue", btnStyle);
  backMenueText.anchor.set(0.5,0.5);
  backMenueText.position.set(appWidth/2,450);
  gameOverScene.addChild(backMenueText);
  backMenueBtn.text = backMenueText;

  gameScene.task = 0;
  goal = 0;
  state = menue;

  gameOverScene.position.set(0,-600);
  gameOverScene.vy = 30;

  menueSlide = new Charm(PIXI);

  //add game looping function
  app.ticker.add(delta => gameLoop(delta));
}

// the main looping program, changing the function for state to control the game.
function gameLoop(delta) {
  menueSlide.update();
  state(delta);
}

//the menue scene looping
function menue(delta) {
  menueSlide.slide(startBtn,appWidth/2,400,40, "smoothstep", false);
  menueSlide.slide(startText,appWidth/2,400,40, "smoothstep", false);
  menueSlide.slide(timeModeBtn,appWidth/2,500,50, "smoothstep", false);
  menueSlide.slide(timeModeText,appWidth/2,500,50, "smoothstep", false);
  menueSlide.slide(aboutBtn,appWidth/2,600,60, "smoothstep", false);
  menueSlide.slide(aboutText,appWidth/2,600,60, "smoothstep", false);
  menueSlide.slide(titleText,appWidth/2,300,60,"deceleration",false);

}

// the classic mode looping.
function play(delta) {
  //初始化时设置发射器的初始位置
  wheel.rotation = turn;
  readyBall.position.set(ballX,ballY);

  //launchBall是发射中的球
  if(!isLaunchable) {
    switch (gameScene.task) {
      case 0:
        //发球中,判断撞击并确定位置然后找出同色的球
        //如果同色的球大于两个,进入case1,否则判断count决定是否进case3加球
        let continueMove = true;
        if(launchBall.y <= 128) {
          continueMove = false;
        }
        //判断是否和场上的球有碰撞
        let hitLineNum = findHitLine();
        let closestEmpty;
        if(hitLineNum !== -1) {
          closestEmpty = findClosestEmpty(launchBall,hitLineNum);
          pos = totalBalls[closestEmpty[0]][closestEmpty[1]];
          launchBall.x = pos.x;
          launchBall.y = pos.y;
          launchBall.isActive = true;
          continueMove = false;
        }

        //撞到顶
        if(launchBall.y<128) {
          hitLineNum = 0;
          closestEmpty = findClosestEmpty(launchBall,hitLineNum);
          pos = totalBalls[closestEmpty[0]][closestEmpty[1]];
          launchBall.x = pos.x;
          launchBall.y = pos.y;
          launchBall.isActive = true;
          continueMove=false;
        }
        //判断是否撞到两边
        if(launchBall.x<32 || launchBall.x>512-32) {
          launchBall.vx = -launchBall.vx;
        }

        if(continueMove) {
          launchBall.x += launchBall.vx;
          launchBall.y += launchBall.vy;
        }
        //如果发生碰撞停止移动
        else {
          let putBall = launchBall;
          totalBalls[closestEmpty[0]].splice(closestEmpty[1],1,putBall);

          gameScene.addChild(putBall);
          launchBall = null;

          //找出和发射的球相连的所有同色球
          readyToClear = [putBall];
          clearMark = []
          findClear(putBall,readyToClear);
          if(readyToClear.length>2) {
            readyToClear.forEach(function(ball) {
              ball.alpha = 0.5;
              let temp = new Sprite(id["plus1.png"]);
              temp.x = ball.x+20;
              temp.y = ball.y-20;
              gameScene.addChild(temp);
              clearMark.push(temp);
            });
            gameScene.task = 1;
          }
          else {
            if(count>4) gameScene.task = 3;
            else gameScene.task = 4;
          }
        }
        break;
      case 1:
        //播放消除同色的球的动画并找出悬空的球,如果有,进case2
        if(readyToClear[0].y-clearMark[0].y<60) {
          clearMark.forEach(function(mark) {
            mark.y -= 4;
          });
          goal += readyToClear.length*10;
          goalText.text = "Goal: " + goal.toString();
        }
        else {
          readyToClear.forEach(function(ball) {
            ball.isActive = false;
            gameScene.removeChild(ball);
          });
          clearMark.forEach(function(mark) {
            gameScene.removeChild(mark);
          });
          //找出有依附的球
          let attachedBalls = [];
          totalBalls[0].forEach(function(ball){
            if(ball.isActive){
              attachedBalls.push(ball);
            }
          });

          attachedBalls.forEach(function(ball) {
            findAttached(ball, attachedBalls);
          });

          //找出没有依附的球
          let lonelyBall = [];
          lonelyBallCopy = [];
          lonelyMark = [];
          totalBalls.forEach(function(line) {
            line.forEach(function(tempBall) {
              if(tempBall.isActive) {
                let isIn = false;
                attachedBalls.forEach(function(ball){
                  if(tempBall === ball) isIn = true;
                });
                if(!isIn) {
                  lonelyBall.push(tempBall);
                }
              }
            });
          });

          if(lonelyBall.length>0) {
            lonelyBall.forEach(function(ball) {
              ball.visible = false;
              ball.isActive = false;
              let ballCopy = new Sprite(id[ball.color]);
              ballCopy.anchor.set(0.5,0.5)
              ballCopy.x = ball.x;
              ballCopy.y = ball.y;
              ballCopy.vy = 10 + randomInt(-7,12);
              ballCopy.color = ball.color;
              gameScene.addChild(ballCopy);
              lonelyBallCopy.push(ballCopy);
              let temp = new Sprite(id["plus2.png"]);
              temp.anchor.set(0.5,0.5);
              temp.x = ball.x+20;
              temp.y = ball.y;
              gameScene.addChild(temp);
              temp.visible = false;
              lonelyMark.push(temp);
            });
            lonelyBallCopy[0].vy = 10;
            gameScene.task = 2;
          }
          else if(count>4) {
             gameScene.task = 3;
          }
          else {
            gameScene.task = 4;
          }
        }
        break;
      case 2:
        //播放悬空的球消失的动画,之后计算count,大于4进入case3播放添加球的动画
        let distBM = lonelyBallCopy[0].y-lonelyMark[0].y;
        if(distBM<30){
          lonelyBallCopy.forEach(function(ball) {
            ball.y += ball.vy;
          });
          lonelyMark.forEach(function(mark) {
            mark.y += 6;
          });
        }
        else if(distBM >= 30 && distBM<70){
          lonelyMark.forEach(function(mark) {
            mark.visible = true;
            mark.y += 6;
          });
          lonelyBallCopy.forEach(function(ball) {
            ball.y += ball.vy;
            ball.alpha = 0.5;
          });
          goal += lonelyBallCopy.length*20;
          goalText.text = "Goal: " + goal.toString();
        }
        else {
          lonelyMark.forEach(function(mark) {
            gameScene.removeChild(mark);
          });
          lonelyBallCopy.forEach(function(ball) {
            gameScene.removeChild(ball);
          });

          if(count>4) gameScene.task = 3;
          else gameScene.task = 4;
        }
        break;
      case 3:
        //添加球的动画,之后进case4进行回合末判断
        createBalls(lineType, true, totalBalls);
        lineType *= -1;
        count = 0;

        gameScene.task = 4;
        break;
      case 4:
        //回合末判断是否过线
        if(totalBalls.length>10) totalBalls.pop();
        totalBalls[8].forEach(function(ball) {
          if(ball.isActive) {
             endText.text = "You have gained: " + goal.toString();
             gameOverScene.task = 0;
             gameOverScene.vy = 30;
             state = end;
          }
        });

        if(goal>5000 && goal<15000) maxBallColor = 4;
        else if (goal>=15000) maxBallColor = 5;

        readyBall.visible = true;
        nextBall.visible = true;
        isLaunchable = true;

        break;
      default:
        console.log("error");
        break;
    }
  }
}

function timeMode(delta) {
  //初始化时设置发射器的初始位置
  wheel.rotation = turn;
  readyBall.position.set(ballX,ballY);

  switch (gameScene.task) {
    case 0:
    //set the time widget when first loading.
      if(timer.y<30) {
        timer.y += 3;
        let dt = new Date();
        timeLimit = dt.getTime() + 60000;
        timeLeft = getTimeLeft();
      }
      // when set finished, start counting the time.
      else {
        let dt = new Date();
        timeLimit = dt.getTime() + 60000;
        timeLeft = getTimeLeft();
        goalText.text = `Goal: 0`;
        gameScene.task = 4;
      }
    case 1:
      if(!isLaunchable){
        //发球中,判断撞击并确定位置然后找出同色的球
        //如果同色的球大于两个,进入case2
        let continueMove = true;
        if(launchBall.y <= 128) {
          continueMove = false;
        }
        //判断是否和场上的球有碰撞
        let hitLineNum = findHitLine();
        let closestEmpty;
        if(hitLineNum !== -1) {
          closestEmpty = findClosestEmpty(launchBall,hitLineNum);
          pos = totalBalls[closestEmpty[0]][closestEmpty[1]];
          launchBall.x = pos.x;
          launchBall.y = pos.y;
          launchBall.isActive = true;
          continueMove = false;
        }

        //撞到顶
        if(launchBall.y<128) {
          hitLineNum = 0;
          closestEmpty = findClosestEmpty(launchBall,hitLineNum);
          pos = totalBalls[closestEmpty[0]][closestEmpty[1]];
          launchBall.x = pos.x;
          launchBall.y = pos.y;
          launchBall.isActive = true;
          continueMove=false;
        }
        //判断是否撞到两边
        if(launchBall.x<32 || launchBall.x>512-32) {
          launchBall.vx = -launchBall.vx;
        }

        if(continueMove) {
          launchBall.x += launchBall.vx;
          launchBall.y += launchBall.vy;
        }
        //如果发生碰撞停止移动
        else {
          let putBall = launchBall;
          totalBalls[closestEmpty[0]].splice(closestEmpty[1],1,putBall);

          gameScene.addChild(putBall);
          launchBall = null;

          //找出和发射的球相连的所有同色球
          readyToClear = [putBall];
          clearMark = []
          findClear(putBall,readyToClear);
          if(readyToClear.length>2) {
            readyToClear.forEach(function(ball) {
              ball.alpha = 0.5;
              let temp = new Sprite(id["plus1.png"]);
              temp.x = ball.x+20;
              temp.y = ball.y-20;
              gameScene.addChild(temp);
              clearMark.push(temp);
            });
            gameScene.task = 2;
          }
          else {
            //没有要消除的球直接进入case4
            gameScene.task = 4;
          }
        }
      }

      break;
    case 2:
      //播放消除球的动画之后寻找悬空的球
      if(readyToClear[0].y-clearMark[0].y<60) {
        clearMark.forEach(function(mark) {
          mark.y -= 4;
        });
        goal += readyToClear.length*10;
        goalText.text = "Goal: " + goal.toString();
      }
      else {
        readyToClear.forEach(function(ball) {
          ball.isActive = false;
          gameScene.removeChild(ball);
        });
        clearMark.forEach(function(mark) {
          gameScene.removeChild(mark);
        });
        //找出有依附的球
        let attachedBalls = [];
        totalBalls[0].forEach(function(ball){
          if(ball.isActive){
            attachedBalls.push(ball);
          }
        });

        attachedBalls.forEach(function(ball) {
          findAttached(ball, attachedBalls);
        });

        //找出没有依附的球
        let lonelyBall = [];
        lonelyBallCopy = [];
        lonelyMark = [];
        totalBalls.forEach(function(line) {
          line.forEach(function(tempBall) {
            if(tempBall.isActive) {
              let isIn = false;
              attachedBalls.forEach(function(ball){
                if(tempBall === ball) isIn = true;
              });
              if(!isIn) {
                lonelyBall.push(tempBall);
              }
            }
          });
        });

        if(lonelyBall.length>0) {
          lonelyBall.forEach(function(ball) {
            ball.visible = false;
            ball.isActive = false;
            let ballCopy = new Sprite(id[ball.color]);
            ballCopy.anchor.set(0.5,0.5)
            ballCopy.x = ball.x;
            ballCopy.y = ball.y;
            ballCopy.vy = 10 + randomInt(-7,12);
            ballCopy.color = ball.color;
            gameScene.addChild(ballCopy);
            lonelyBallCopy.push(ballCopy);
            let temp = new Sprite(id["plus2.png"]);
            temp.anchor.set(0.5,0.5);
            temp.x = ball.x+20;
            temp.y = ball.y;
            gameScene.addChild(temp);
            temp.visible = false;
            lonelyMark.push(temp);
          });
          lonelyBallCopy[0].vy = 10;
          gameScene.task = 3;
        }

        else {
          gameScene.task = 4;
        }
      }
      break;
    case 3:
      //播放悬空的球消失的动画,之后进入case4
      let distBM = lonelyBallCopy[0].y-lonelyMark[0].y;
      if(distBM<30){
        lonelyBallCopy.forEach(function(ball) {
          ball.y += ball.vy;
        });
        lonelyMark.forEach(function(mark) {
          mark.y += 6;
        });
      }
      else if(distBM >= 30 && distBM<70){
        lonelyMark.forEach(function(mark) {
          mark.visible = true;
          mark.y += 6;
        });
        lonelyBallCopy.forEach(function(ball) {
          ball.y += ball.vy;
          ball.alpha = 0.5;
        });
        goal += lonelyBallCopy.length*20;
        goalText.text = "Goal: " + goal.toString();
      }
      else {
        lonelyMark.forEach(function(mark) {
          gameScene.removeChild(mark);
        });
        lonelyBallCopy.forEach(function(ball) {
          gameScene.removeChild(ball);
        });
        gameScene.task = 4;
      }
      break;

    case 4:
      let ballNum = 0;
      totalBalls.forEach(function(line) {
        line.forEach(function(ball) {
          if(ball.isActive) ballNum += 1;
        });
      });
      while(ballNum<30) {
        createBalls(lineType, true, totalBalls);
        lineType *= -1;
        ballNum = 0;
        totalBalls.forEach(function(line) {
          line.forEach(function(ball) {
            if(ball.isActive) ballNum += 1;
          });
        });
      }
      gameScene.task = 5;

      break;

    case 5:
      //回合末判断是否过线
      if(totalBalls.length>10) totalBalls.pop();
      totalBalls[8].forEach(function(ball) {
        if(ball.isActive) {
          gameScene.removeChild(ball);
          ball.isActive = false;
        }
      });

      //分数达到30和60后调整游戏难度
      if(goal>5000 && goal<15000) maxBallColor = 4;
      else if (goal>=15000) maxBallColor = 5;

      readyBall.visible = true;
      nextBall.visible = true;
      isLaunchable = true;
      break;
    default:
  }
  //每一帧末都刷新时间并判断是否需要加球


  timeLeft = getTimeLeft();
  if(timeLeft<0) {
    timer.text = "YOU DEAD";
    endText.text = `You have gaind:\n${goal} \nIn total 60s`;
    gameOverScene.task = 0;
    gameOverScene.vy = 30;
    timer.y = -30;
    if(launchBall !== null) gameScene.removeChild(launchBall);
    state = end;
  }
}

//the end cene looping
function end(delta) {
  gameOverScene.visible = true;
  switch (gameOverScene.task) {
    //the menu going down.
    case 0:
    if (gameOverScene.y<90) {
      gameOverScene.y += gameOverScene.vy;
    }
    else {
      gameOverScene.task = 1;
      gameOverScene.vy = -10;
      totalBalls.forEach(function(line) {
        line.forEach(function(ball) {
          ball.vy = 15 + randomInt(-10,15);
        });
      });
    }
      break;
    //the menue jump back a little
    case 1:
      if(gameOverScene.y>0) {
        gameOverScene.y += gameOverScene.vy;
      }
      break;
    //the menue going back and restart.
    case 2:
      if(gameOverScene.y > -600) {
        gameOverScene.y += gameOverScene.vy;
        goal -= Math.floor(goal/10);
        goalText.text = "Goal: " + goal.toString();
        totalBalls.forEach(function(line) {
          line.forEach(function(ball) {
            ball.y += ball.vy;
          });
        });
      }
      else {
        state = lastState;
        restart();
      }
      break;
    default:
      state = lastState;
      restart();
      break;
  }
}

function pause(delta) {

}

function onMouseMove(event) {
  mouseX = event.clientX + document.scrollingElement.scrollLeft - xOffset;
  mouseY = event.clientY + document.scrollingElement.scrollTop - yOffset;
  wheelMove(mouseX,mouseY);
}


function onClick(event) {
  //当场上没有球正在发射时发射球
  let condA = isLaunchable && state === play;
  let condB = getTimeLeft()>0 && isLaunchable && state === timeMode;
  if(condA || condB) {
    if(mouseX<96 && mouseY>appHeight-70) {
      let tp = readyBall;
      readyBall = nextBall;
      nextBall = tp;
      nextBall.position.set(64,appHeight - 32);
      lastColor = nextBall.color;
    }
    else if (mouseX>appWidth-96 && mouseY>appHeight-70) {

    }
    else if(mouseY>100){
      isLaunchable = false;
      let angle = getAngle([ballX,ballY],[appWidth/2, appHeight]);
      launchBall = readyBall;
      launchBall.vx = 12*Math.sin(angle);
      launchBall.vy = -12*Math.cos(angle);

      readyBall = nextBall;
      readyBall.visible = false;

      nextBall = createABall(64,appHeight - 32,1);
      gameScene.addChild(nextBall);
      nextBall.visible = false;
      count += 1;
      gameScene.task = condA? 0: 1;
    }
  }
}

function onTouch(event) {
  let touches = event.changedTouches;
  mouseX = touches[0].clientX - xOffset;
  mouseY = touches[0].clientY - yOffset;
  wheelMove(mouseX,mouseY);
}

function endTouch(event) {
  onTouch(event);
  onClick(event);
}

function onButtonDown() {
  this.alpha = 0.5;
  this.text.alpha = 0.5;
}

//the main button controling event.
async function onButtonUp(event) {
  await sleep(300);
  this.alpha = 1;
  this.text.alpha = 1;

  if(this.text === startText) {
    restart();
    lastState = play;
    state = lastState;
    gameScene.visible = true;
    menueScene.visible = false;
    if(!soundBtn.play) soundSwitch();
  }

  if(this.text === timeModeText) {
    await sleep(300);
    gameScene.visible = true;
    menueScene.visible = false;
    if(timeIntro.isRead) {
      restart();
      gameScene.task = 0;
      lastState = timeMode;
      state = lastState;
      if(!soundBtn.play) soundSwitch();
    }
    else {
      timeIntro.visible = true;
      checkBtn.visible = true;
      checkText.visible = true;
    }
  }

  if(this.text === checkText) {
    restart();
    await sleep(300);
    gameScene.task = 0;
    lastState = timeMode;
    state = lastState;
    timeIntro.visible = false;
    checkBtn.visible = false;
    checkText.visible = false;
    if(!soundBtn.play) soundSwitch();
    localStorage.setItem("timeRead",true);
    timeIntro.isRead = true;
  }

  if(this.text === aboutText) {
    menueSlide.slide(menueScene,0,-appHeight,40,"acceleration");
  }

  if(this.text === returnText) {
    menueSlide.slide(menueScene,0,0,40,"acceleration");
  }

  if(this.text === reText) {
    gameOverScene.task = 2;
    gameOverScene.vy = -10;
  }
  if(this.text === backMenueText) {
    console.log("back1");
    titleText.position.set(appWidth/2,0);
    gameOverScene.position.set(0,-600);
    startBtn.position.set(-300,400);
    startText.position.set(-300,400);
    timeModeBtn.position.set(appWidth+300,500);
    timeModeText.position.set(appWidth+300,500);
    aboutBtn.position.set(-300,600);
    aboutText.position.set(-300,600);
    gameOverScene.vy = 30;
    if(soundBtn.play) soundSwitch();
    gameOverScene.visible = false;
    gameScene.visible = false;
    menueScene.visible = true;
    state = menue;
  }
  if(this.text === "menue") {
    timeIntro.visible = true;
    pauseBtn.visible = true;
    pauseText.visible = true;
    backMenueBtn2.visible = true;
    backMenueText2.visible = true;
    state = pause;
    timeLeft = getTimeLeft();
  }
  if(this.text === pauseText) {
    timeIntro.visible = false;
    pauseBtn.visible = false;
    pauseText.visible = false;
    backMenueBtn2.visible = false;
    backMenueText2.visible = false;
    let dt = new Date();
    timeLimit  = dt.getTime() + timeLeft*1000;
    state = lastState;
  }
  if(this.text === backMenueText2) {
    console.log("back2");
    timeIntro.visible = false;
    pauseBtn.visible = false;
    pauseText.visible = false;
    backMenueBtn2.visible = false;
    backMenueText2.visible = false;
    gameScene.visible = false;
    menueScene.visible = true;
    timer.y = -60;
    if(soundBtn.play) soundSwitch();
    state = menue;
  }
  if(this.text === "Theme") {
    if(bg.texture===bgTexure) {
      bg.texture = santaBgTexure;
      rawBall = santaTheme;
      bgm = santaBgm;
      aboutContent.style = {fontFamily: "Arial",
                            fontSize: 32,
                            fill:"black"};
      goalText.style = aboutContent.style;
      timer.style = aboutContent.style;
      topLine.visible =false;
      endLine.visible = false;
      santaTopLine.visible = true;
      santaEndLine.visible = true;
    }
    else {
      bg.texture = bgTexure;
      rawBall = classicTheme;
      bgm = classicBgm;
      aboutContent.style = {fontFamily: "Arial",
                            fontSize: 32,
                            fill:"white"};
      goalText.style = aboutContent.style;
      timer.style = aboutContent.style;
      topLine.visible =true;
      endLine.visible = true;
      santaTopLine.visible = false;
      santaEndLine.visible = false;
    }
  }
}

function onButtonOver() {
  this.scale.set(1.2,1.2);
  this.text.scale.set(1.2,1.2);
}

function onButtonOut() {
  this.scale.set(1,1);
  this.text.scale.set(1,1);
}

function soundSwitch() {
  if(soundBtn.play) {
    bgm.pause();
    soundBtn.texture = id["soundon.png"];
    soundBtn.play = false;
  }
  else {
    bgm.play();
    soundBtn.texture = id["soundoff.png"];
    soundBtn.play = true;
  }
}

function restart() {
  totalBalls.forEach(function(line){
    line.forEach(function(ball){
      gameScene.removeChild(ball);
    });
  });
  gameScene.removeChild(readyBall);
  gameScene.removeChild(nextBall);
  maxBallColor = 3;
  colorStatic = [0,0,0,0,0,0];
  lineType = -1;
  totalBalls = [];
  for(let i=0;i<7;i++) {
    createBalls(lineType,false,totalBalls);
    lineType *= -1;
  }
  for(let i=0;i<3;i++) {
    createBalls(lineType,true,totalBalls);
    lineType *= -1;
  }
  readyBall = createABall(ballX,ballY);
  nextBall = createABall(64,appHeight - 32);
  gameScene.addChild(readyBall);
  gameScene.addChild(nextBall);
  goal = 0;
  goalText.text = "Goal: 0";
  gameOverScene.visible = false;
  gameScene.visible = true;
  gameScene.task = 0;
}

function wheelMove(mouseX,mouseY) {
  //计算轮子的旋转角度
  turn = Math.atan2(mouseX-appWidth/2,appHeight-mouseY);
  //规定轮子的旋转范围
  let turnLimit = 0.9;
  if(turn>turnLimit){turn = turnLimit;}
  else if(turn<-turnLimit){turn = -turnLimit;}
  //计算ball的位置
  if(turn<turnLimit && turn>-turnLimit){
    let times = Math.sqrt(
      Math.pow((mouseX - appWidth/2),2) + Math.pow((appHeight - mouseY),2)
    )/128;
    ballX =(mouseX - appWidth/2)/times+appWidth/2;
    ballY = (mouseY - appHeight)/times + appHeight;
  }
}

function getAngle(dot1,dot2) {
  let dx = dot2[0] - dot1[0],
      dy = dot2[1] - dot1[1];
  let temp =  Math.atan(dy / dx) + 0.5*Math.PI;
  return temp<0.5*Math.PI? temp: temp-Math.PI;
}

function getColor() {
  //return colorIndex(int) for nextBall;
  let minNum = colorStatic[0],
      maxNum = colorStatic[0],
      colorIndex;
  for(let i = 0; i < maxBallColor+1; i++) {
    minNum = colorStatic[i]<minNum? colorStatic[i]: minNum;
    maxNum = colorStatic[i]>maxNum? colorStatic[i]: maxNum;
  }
  if(maxNum-minNum>2){
    colorIndex = colorStatic.indexOf(minNum);
    for(let i = 0; i < maxBallColor+1; i++) {
      colorStatic[i] -= minNum;
    }
    return colorIndex;
  }
  else {
    do {
      colorIndex = randomInt(0, maxBallColor);
    }
    while (colorIndex === lastColor);
    return colorIndex;
  }
}

function createABall(x,y,type = 0) {
  let colorIndex;
  if(type === 1){
    colorIndex = getColor();
    lastColor = colorIndex;
    colorStatic[lastColor] += 1;
  }
  else {
    colorIndex = randomInt(0, maxBallColor);
  }
  let ballColor = rawBall[colorIndex];
  let Ball = new Sprite(id[ballColor]);
  Ball.anchor.set(0.5,0.5);
  Ball.position.set(x,y);
  Ball.color = ballColor;
  return Ball;
}

function createBalls(lineType, ballType, ballArray) {
  ballArray.forEach(function(line) {
    line.forEach(function(ball) {
      ball.y += 56;
    });
  });
  let begin, ballNum;
  if(lineType === -1) {
    beginPos = 64;
    ballNum = 7;
  }
  else {
    beginPos = 32;
    ballNum = 8;
  }
  let ballLine = [];

  for(let i = 0; i < ballNum; i++) {
    mapBall = createABall(beginPos,128);
    mapBall.isActive = ballType;
    ballLine.push(mapBall);
    if(ballType) gameScene.addChild(mapBall);
    beginPos += 64;
  }
  ballArray.unshift(ballLine);
}

function findHitLine() {
  for(let i = 0; i<totalBalls.length; i++) {
    if(totalBalls[i][0].y-launchBall.y<32 && totalBalls[i][0].y-launchBall.y>-32) {
      let line = totalBalls[i];
      for(let j=0; j<line.length; j++) {
        let ball = line[j];
        if(hitTestCircle(launchBall,ball) && ball.isActive) {
          return i;
        }
      }
    }
  }
  return -1;
}

function findClosestEmpty(launchBall, lineNum) {
  let close = [];
  let minDist = 512;
  for(let i = 0; i < totalBalls[lineNum].length; i++) {
    let ball = totalBalls[lineNum][i];
    let dist = Math.sqrt(
      (launchBall.x-ball.x)**2 + (launchBall.y-ball.y)**2
    );
    if(dist < minDist && !ball.isActive) {
      close[0] = lineNum;
      close[1] = i;
      minDist = dist;
    }
  }
  if(lineNum>0) {
    let line = totalBalls[lineNum-1];
    for(let i = 0; i < line.length; i++) {
      let ball = line[i];
      let dist = Math.sqrt(
        (launchBall.x-ball.x)**2 + (launchBall.y-ball.y)**2
      );
      if(dist < minDist && !ball.isActive) {
        close[0] = lineNum-1;
        close[1] = i;
        minDist = dist;
      }
    }
  }
  if(lineNum<totalBalls.length-1) {
    let line = totalBalls[lineNum+1];
    for(let i = 0; i < line.length; i++) {
      let ball = line[i];
      let dist = Math.sqrt(
        (launchBall.x-ball.x)**2 + (launchBall.y-ball.y)**2
      );
      if(dist < minDist && !ball.isActive) {
        close[0] = lineNum+1;
        close[1] = i;
        minDist = dist;
      }
    }
  }
  return close;
}

function findClearSub(r1, tempBall, readyToClear) {

  if(tempBall.color === r1.color && tempBall.isActive) {
    let isIn = false;
    readyToClear.forEach(function(ball) {
      if(tempBall === ball) isIn = true;
    });
    if(!isIn) {
      readyToClear.push(tempBall);
      findClear(tempBall,readyToClear);
    }
  }
}


function findClear(r1,readyToClear) {
  let row = (r1.y-128)/56;
  let column = Math.ceil(r1.x/64)-1;
  let lineType = totalBalls[row].length===8? 1: -1;

  let ballLine = totalBalls[row];
  if(column-1>=0) {
    let tempBall = ballLine[column-1];
    findClearSub(r1, tempBall, readyToClear);
  }
  if(column+1<ballLine.length) {
    let tempBall = ballLine[column+1];
    findClearSub(r1, tempBall, readyToClear);
  }
  if(row>0) {
    let topBallLine = totalBalls[row-1];
    if(column<topBallLine.length) {
      let tempBall = topBallLine[column];
      findClearSub(r1, tempBall, readyToClear);
      }

    if(column-lineType<topBallLine.length && column-lineType>=0) {
      let tempBall = topBallLine[column-lineType];
      findClearSub(r1, tempBall, readyToClear);
    }
  }
  if(row<totalBalls.length-1) {
    let topBallLine = totalBalls[row+1];
    if(column<topBallLine.length){
      let tempBall = topBallLine[column];
      findClearSub(r1, tempBall, readyToClear);
    }

    if(column-lineType<topBallLine.length && column-lineType>=0) {
      let tempBall = topBallLine[column-lineType];
      findClearSub(r1, tempBall, readyToClear);
    }
  }
}

function findFirst() {
  for(let i = 0; i< totalBalls[0].length;i++){
    ball = totalBalls[0][i];
    if(ball.isActive) {
      return ball;
    }
  }
}

function findAttached(r1, attachedBalls) {

  let row = (r1.y-128)/56;
  let column = Math.ceil(r1.x/64)-1;
  let lineType = totalBalls[row].length===8? 1: -1;

  let ballLine = totalBalls[row];
  if(column-1>=0) {
    let tempBall = ballLine[column-1];
    if(tempBall.isActive){
      let isIn = false;
      attachedBalls.forEach(function(ball) {
        if(ball === tempBall) isIn = true;
      });
      if(!isIn){
        attachedBalls.push(tempBall);
        findAttached(tempBall, attachedBalls);
      }
    }
  }
  if(column+1<ballLine.length) {
    let tempBall = ballLine[column+1];
    if(tempBall.isActive){
      let isIn = false;
      attachedBalls.forEach(function(ball) {
        if(ball === tempBall) isIn = true;
      });
      if(!isIn){
        attachedBalls.push(tempBall);
        findAttached(tempBall, attachedBalls);
      }
    }
  }
  if(row>0) {
    let topBallLine = totalBalls[row-1];
    if(column<topBallLine.length) {
      let tempBall = topBallLine[column];
      if(tempBall.isActive){
        let isIn = false;
        attachedBalls.forEach(function(ball) {
          if(ball === tempBall) isIn = true;
        });
        if(!isIn){
          attachedBalls.push(tempBall);
          findAttached(tempBall, attachedBalls);
        }
      }
    }

    if(column-lineType<topBallLine.length && column-lineType>=0) {
      let tempBall = topBallLine[column-lineType];
      if(tempBall.isActive){
        let isIn = false;
        attachedBalls.forEach(function(ball) {
          if(ball === tempBall) isIn = true;
        });
        if(!isIn){
          attachedBalls.push(tempBall);
          findAttached(tempBall, attachedBalls);
        }
      }
    }
  }
  if(row<totalBalls.length-1) {
    let topBallLine = totalBalls[row+1];
    if(column<topBallLine.length){
      let tempBall = topBallLine[column];
      if(tempBall.isActive){
        let isIn = false;
        attachedBalls.forEach(function(ball) {
          if(ball === tempBall) isIn = true;
        });
        if(!isIn){
          attachedBalls.push(tempBall);
          findAttached(tempBall, attachedBalls);
        }
      }
    }

    if(column-lineType<topBallLine.length && column-lineType>=0) {
      let tempBall = topBallLine[column-lineType];
      if(tempBall.isActive){
        let isIn = false;
        attachedBalls.forEach(function(ball) {
          if(ball === tempBall) isIn = true;
        });
        if(!isIn){
          attachedBalls.push(tempBall);
          findAttached(tempBall, attachedBalls);
        }
      }
    }
  }
}

function hitTestCircle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, actualDist, centalDist;
  //hit will determine whether there's a collision
  hit = false;
  //Calculate the distance vector between the sprites
  actualDist = Math.sqrt(
    Math.pow(r1.x-r2.x, 2) + Math.pow(r1.y-r2.y, 2)
  );
  centalDist = 52;
  //Check for a collision on the x axis
  if (Math.abs(actualDist) < centalDist) {
    //A collision might be occuring. Check for a collision on the y axis
    hit = true;
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;
};

//The `randomInt` helper function
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//一个暂停小程序,要用在async 函数中
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

//补位程序
function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

function getTimeLeft() {
  let dt = new Date();
  let left = (timeLimit - dt.getTime())/1000;
  let sec = pad(Math.floor(left),2);
  timer.text = "00:"+sec ;
  return left;
}

document.getElementById("version").innerHTML ="version: "+_ver;
