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

const iniWidth = 512, iniHeight = 768, xOffset = 100, yOffset = 100;

const _ver = "1.1.4";

let bgm = document.getElementById("bgm");

let app = new Application({
    width: iniWidth,
    height: iniHeight,
    antialiasing: true,
    transparent: false,
    resolution: 1,
    backgroundColor: 0x93d1e2
  }
);

let gameArea = document.getElementById("gameArea");
gameArea.appendChild(app.view);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
let scale = window.innerHeight/iniHeight;
let appWidth = iniWidth*scale , appHeight = iniHeight*scale;
app.renderer.resize(appWidth,appHeight);


loader
  .add(["material/bg.png",
        "material/nbg.png",
        "material/btn.png",
        "material/poplong.json"])
  .on("progress",loadProgressHandler)
  .load(setup);

//game variables and objects
//id for main texure, mouseX and mouseY to capture and convert users input
let id, mouseX =appWidth/2/scale, mouseY = 0,
    //turn is for controlling wheel turning
    //isLaunchable to controll the play state
    wheel, turn, isLaunchable,
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
    count = 0, lineType, goal;

//UI objects
let titleText, startBtn, startText, aboutBtn, aboutText,
    aboutLine, aboutContent, returnBtn, returnText, qrcode,
    menuLine, endLine,endBG, endTitle, goalText, endText,
    reText,restartBtn, btnTexure;

//Scene containers and controlling variables
let state, bg, bgTexure, santaBgTexure, soundBtn,
    menueScene, gameScene, gameOverScene;

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
  let loadingText = new Text("Loading: " + loader.progress +"%",contentStyle);
  loadingText.anchor.set(0.5,0.5);
  loadingText.position.set(appWidth/2,appHeight/2);
  app.stage.addChild(loadingText);
  console.log(loader.progress);
}

function setup() {
  /*
  设置方程,布置游戏需要的变量并在最后启动游戏循环
  */

  //Game background imagine
  bgTexure = resources["material/bg.png"].texture;
  santaBgTexure = resources["material/nbg.png"].texture;
  bg = new Sprite(santaBgTexure);
  bg.scale.set(scale,scale);
  app.stage.addChild(bg);

  id = resources["material/poplong.json"].textures;

  soundBtn = new Sprite(id["soundon.png"]);
  soundBtn.position.set(400*scale,15*scale);
  soundBtn.play = false;
  soundBtn.interactive = true;
  soundBtn.buttonMode = true;
  soundBtn.on("pointerdown",soundSwitch);
  app.stage.addChild(soundBtn);

  // container for menue scene.
  menueScene = new Container();
  menueScene.position.set(0,0);
  app.stage.addChild(menueScene);
  menueScene.visible = false;

  // container for game scene.
  gameScene = new Container();
  app.stage.addChild(gameScene);

  //container for game over scene.
  gameOverScene = new Container();
  gameOverScene.position.set(0,0);
  app.stage.addChild(gameOverScene);
  gameOverScene.visible = false;

  btnTexure = resources["material/btn.png"].texture;
  let titleStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 56,
    fill: "#186f93",
    fontWeight: "bold"
  });
  let btnStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fill: "white"
  });
  let contentStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 32,
    fill: "black"
  });

  //Objects for menue scene
  titleText = new Text("Day Day \nBubble Shooter", titleStyle);
  titleText.anchor.set(0.5,0.5);
  titleText.position.set(appWidth/2,200*scale);
  menueScene.addChild(titleText);

  startBtn = new Sprite(btnTexure);
  startBtn.anchor.set(0.5,0.5);
  startBtn.position.set(appWidth/2,400*scale);
  startBtn.interactive = true;
  startBtn.buttonMode = true;
  startBtn
    .on('pointerdown', onButtonDown)
    .on('pointerup', onButtonUp)
    .on('pointerover', onButtonOver)
    .on('pointerout', onButtonOut);
  menueScene.addChild(startBtn);
  startText = new Text("Start",btnStyle);
  startText.anchor.set(0.5,0.5);
  startText.position.set(appWidth/2,400*scale);
  menueScene.addChild(startText);
  startBtn.text = startText;

  aboutBtn = new Sprite(btnTexure);
  aboutBtn.anchor.set(0.5,0.5);
  aboutBtn.position.set(appWidth/2,550*scale);
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
  aboutText.position.set(appWidth/2,550*scale);
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
                          "为游戏提供建议的小伙伴们:\n          "+
                          "大土贝, 夜书, M_eow, 九幽\n\n" +
                          "版本: " +_ver.toString(),
                          contentStyle);
  aboutContent.anchor.set(0.5,0);
  aboutContent.position.set(appWidth/2,appHeight+100*scale);
  menueScene.addChild(aboutContent);

  returnBtn = new Sprite(btnTexure);
  returnBtn.anchor.set(0.5,0.5);
  returnBtn.position.set(appWidth/2,appHeight+650*scale);
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
  returnText.position.set(appWidth/2,appHeight+650*scale);
  menueScene.addChild(returnText);
  returnBtn.text = returnText;

  menueScene.task = 0;

  //Objects for play scene
  menuLine = new Graphics();
  menuLine.beginFill(0x000000);
  menuLine.drawRect(0,0,appWidth,2*scale);
  menuLine.endFill();
  menuLine.position.set(0,94*scale);
  gameScene.addChild(menuLine);

  endLine = new Graphics();
  endLine.beginFill(0x000000);
  endLine.drawRect(0,0,appWidth,2*scale);
  endLine.endFill();
  endLine.position.set(0,576*scale);
  gameScene.addChild(endLine);

  classicTheme = ["redball.png",'blueball.png','yellowball.png','greenball.png',"sunball.png","moonball.png"];
  santaTheme = ["cb1.png", "cb2.png", "cb3.png", "cb4.png", "cb5.png", "cb6.png"];
  rawBall = santaTheme;

  maxBallColor = 3;
  colorStatic = [0,0,0,0,0,0];
  wheel = new Sprite(id["gameWheel.png"]);
  wheel.scale.set(scale,scale);
  wheel.anchor.set(0.5,0.5)
  wheel.position.set(appWidth/2,appHeight);
  gameScene.addChild(wheel);

  //ball是准备发射的球
  readyBall = createABall(appWidth/2,appHeight-128*scale);
  gameScene.addChild(readyBall);
  isLaunchable = true;

  //下一个准备发射的球
  nextBall = createABall(64*scale,appHeight - 32*scale);
  gameScene.addChild(nextBall);

  //create map with balls inside.
  //7 lines with invisiball for position finding
  lineType = -1;
  totalBalls = [];
  for(let i=0;i<7;i++) {
    createBalls(lineType,false,totalBalls);
    lineType *= -1;
  }
  // 3 lines for real balls
  for(let i=0;i<3;i++) {
    createBalls(lineType,true,totalBalls);
    lineType *= -1;
  }

  goalText = new Text("Goal: 0",contentStyle);
  goalText.position.set(30*scale,30*scale);
  gameScene.addChild(goalText);

  //add event for controlling the game
  gameArea.addEventListener("mousemove",onMouseMove);
  gameArea.addEventListener("click",onClick,false);
  gameArea.addEventListener("touchmove",onTouch);
  gameArea.addEventListener("touchend",endTouch,false);

  //objects for end scene.
  endBG = new Graphics();
  endBG.beginFill(0xC9CACA);
  endBG.lineStyle(5,0xFFFFFF,1);
  endBG.drawRect(0,0,400,400);
  endBG.endFill();
  endBG.alpha = 0.7;
  endBG.position.set((appWidth-400)/2*scale,70*scale);
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
  restartBtn.position.set(appWidth/2,400);

  //让该元素成为一个按钮
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
  reText.position.set(appWidth/2,400);
  gameOverScene.addChild(reText);
  restartBtn.text = reText;

  gameScene.task = 0;
  goal = 0;
  state = menue;

  gameOverScene.position.set(0,-600*scale);
  gameOverScene.vy = 30*scale;

  //add game looping function
  app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
  state(delta);
}

function menue(delta) {
  menueScene.visible = true;
  gameScene.visible = false;
  gameOverScene.visible = false;
  if(menueScene.task===1 && menueScene.y>-appHeight) {
    menueScene.y -= 20*scale;
  }
  if(menueScene.task === 0 && menueScene.y<0) {
    menueScene.y += 20*scale;
  }
}

function play(delta) {
  //初始化时设置发射器的初始位置
  wheel.rotation = turn;
  readyBall.position.set(ballX*scale,ballY*scale);

  //launchBall是发射中的球
  if(!isLaunchable) {
    switch (gameScene.task) {
      case 0:
        //发球中,判断撞击并确定位置然后找出同色的球
        //如果同色的球大于两个,进入case1,否则判断count决定是否进case3加球
        let continueMove = true;
        if(launchBall.y <= 128*scale) {
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
          launchBall.type = true;
          continueMove = false;
        }

        //撞到顶
        if(launchBall.y<128*scale) {
          hitLineNum = 0;
          closestEmpty = findClosestEmpty(launchBall,hitLineNum);
          pos = totalBalls[closestEmpty[0]][closestEmpty[1]];
          launchBall.x = pos.x;
          launchBall.y = pos.y;
          launchBall.type = true;
          continueMove=false;
        }
        //判断是否撞到两边
        if(launchBall.x<32*scale || launchBall.x>appWidth-32*scale) {
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
              temp.x = ball.x+20*scale;
              temp.y = ball.y-20*scale;
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
            mark.y -= 4*scale;
          });
          goal += readyToClear.length*10;
          goalText.text = "Goal: " + goal.toString();
        }
        else {
          readyToClear.forEach(function(ball) {
            ball.type = false;
            gameScene.removeChild(ball);
          });
          clearMark.forEach(function(mark) {
            gameScene.removeChild(mark);
          });
          //找出有依附的球
          let attachedBalls = [];
          totalBalls[0].forEach(function(ball){
            if(ball.type){
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
              if(tempBall.type) {
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
              ball.type = false;
              let ballCopy = new Sprite(id[ball.color]);
              ballCopy.anchor.set(0.5,0.5)
              ballCopy.x = ball.x;
              ballCopy.y = ball.y;
              ballCopy.vy = 10*scale + randomInt(-7*scale,12*scale);
              ballCopy.color = ball.color;
              ballCopy.alpha = 0.5;
              gameScene.addChild(ballCopy);
              lonelyBallCopy.push(ballCopy);
              let temp = new Sprite(id["plus2.png"]);
              temp.anchor.set(0.5,0.5);
              temp.x = ball.x+20*scale;
              temp.y = ball.y;
              gameScene.addChild(temp);
              temp.visible = false;
              lonelyMark.push(temp);
            });
            lonelyBallCopy[0].vy = 10*scale;
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
        if(distBM<20*scale){
          lonelyBallCopy.forEach(function(ball) {
            ball.y += ball.vy;
          });
          lonelyMark.forEach(function(mark) {
            mark.y += 6*scale;
          });
        }
        else if(distBM >= 20*scale && distBM<60*scale){
          lonelyMark.forEach(function(mark) {
            mark.visible = true;
            mark.y += 6*scale;
          });
          lonelyBallCopy.forEach(function(ball) {
            ball.y += 10*scale;
          });
          goal += lonelyBallCopy.length*20*scale;
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
          if(ball.type) {
             endText.text = "You have gained: " + goal.toString();
             gameOverScene.task = 0;
             gameOverScene.vy = 30*scale;
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

function end(delta) {
  gameOverScene.visible = true;
  switch (gameOverScene.task) {
    case 0:
    if (gameOverScene.y<90*scale) {
      gameOverScene.y += gameOverScene.vy;
    }
    else {
      gameOverScene.task = 1;
      gameOverScene.vy = -10*scale;
      totalBalls.forEach(function(line) {
        line.forEach(function(ball) {
          ball.vy = 15*scale + randomInt(-10*scale,15*scale);
        });
      });
    }
      break;
    case 1:
      if(gameOverScene.y>0) {
        gameOverScene.y += gameOverScene.vy;
      }
      break;
    case 2:
      if(gameOverScene.y > -600*scale) {
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
        restart();
      }
      break;
    default:
      restart();
      break;
  }
}

function onMouseMove(event) {
  mouseX = event.clientX + document.scrollingElement.scrollLeft - xOffset;
  mouseY = event.clientY + document.scrollingElement.scrollTop - yOffset;
  wheelMove(mouseX,mouseY);
}


function onClick(event) {
  //当场上没有球正在发射时发射球
  if(isLaunchable && state === play) {
    if(mouseX<96*scale && mouseY>appHeight-150*scale) {
      let tp = readyBall;
      readyBall = nextBall;
      nextBall = tp;
      nextBall.position.set(64*scale,appHeight - 32*scale);
      lastColor = nextBall.color;
    }
    else if(mouseY>100*scale){
      isLaunchable = false;
      let angle = getAngle([ballX,ballY],[appWidth/2, appHeight]);
      launchBall = readyBall;
      launchBall.vx = 12*Math.sin(angle);
      launchBall.vy = -12*Math.cos(angle);

      readyBall = nextBall;
      readyBall.visible = false;

      nextBall = createABall(64*scale,appHeight - 32*scale,1);
      gameScene.addChild(nextBall);
      nextBall.visible = false;
      count += 1;
      gameScene.task = 0;
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

async function onButtonUp(event) {
  await sleep(300);
  this.alpha = 1;
  this.text.alpha = 1;

  if(this.text === startText) {
    state = play;
    gameScene.visible = true;
    menueScene.visible = false;
    if(!soundBtn.play) soundSwitch();
  }

  if(this.text === aboutText) {
    menueScene.task = 1;
  }

  if(this.text === returnText) {
    menueScene.task = 0;
  }

  if(this.text === reText) {
    gameOverScene.task = 2;
    gameOverScene.vy = -10*scale;
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
  nextBall = createABall(64*scale,appHeight - 32*scale);
  gameScene.addChild(readyBall);
  gameScene.addChild(nextBall);
  goal = 0;
  goalText.text = "Goal: 0";
  state = play;
  gameOverScene.visible = false;
  gameScene.visible = true;
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
  Ball.scale.set(scale,scale)
  Ball.anchor.set(0.5,0.5);
  Ball.position.set(x,y);
  Ball.color = ballColor;
  return Ball;
}

function createBalls(lineType, ballType, ballArray) {
  ballArray.forEach(function(line) {
    line.forEach(function(ball) {
      ball.y += 56*scale;
    });
  });
  let begin, ballNum;
  if(lineType === -1) {
    beginPos = 64*scale;
    ballNum = 7;
  }
  else {
    beginPos = 32*scale;
    ballNum = 8;
  }
  let ballLine = [];

  for(let i = 0; i < ballNum; i++) {
    mapBall = createABall(beginPos,128*scale);
    mapBall.type = ballType;
    ballLine.push(mapBall);
    if(ballType) gameScene.addChild(mapBall);
    beginPos += 64*scale;
  }
  ballArray.unshift(ballLine);
}

function findHitLine() {
  for(let i = 0; i<totalBalls.length; i++) {
    if(totalBalls[i][0].y-launchBall.y<32*scale && totalBalls[i][0].y-launchBall.y>-32*scale) {
      let line = totalBalls[i];
      for(let j=0; j<line.length; j++) {
        let ball = line[j];
        if(hitTestCircle(launchBall,ball) && ball.type) {
          return i;
        }
      }
    }
  }
  return -1;
}

function findClosestEmpty(launchBall, lineNum) {
  let close = [];
  let minDist = 512*scale;
  for(let i = 0; i < totalBalls[lineNum].length; i++) {
    let ball = totalBalls[lineNum][i];
    let dist = Math.sqrt(
      (launchBall.x-ball.x)**2 + (launchBall.y-ball.y)**2
    );
    if(dist < minDist && !ball.type) {
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
      if(dist < minDist && !ball.type) {
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
      if(dist < minDist && !ball.type) {
        close[0] = lineNum+1;
        close[1] = i;
        minDist = dist;
      }
    }
  }
  return close;
}

function findClearSub(r1, tempBall, readyToClear) {

  if(tempBall.color === r1.color && tempBall.type) {
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
  let rowVal = (r1.y-128*scale)/56*scale;
  console.log(rowVal);
  let row = Math.floor(rowVal);
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
    if(ball.type) {
      return ball;
    }
  }
}

function findAttached(r1, attachedBalls) {
  let rowVal = (r1.y-128*scale)/56*scale;
  console.log(rowVal);
  let row = rowVal%1>0.5? Math.ceil(rowVal): Math.floor(rowVal);
  let column = Math.ceil(r1.x/64*scale)-1;
  let lineType = totalBalls[row].length===8? 1: -1;

  let ballLine = totalBalls[row];
  if(column-1>=0) {
    let tempBall = ballLine[column-1];
    if(tempBall.type){
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
    if(tempBall.type){
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
      if(tempBall.type){
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
      if(tempBall.type){
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
      if(tempBall.type){
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
      if(tempBall.type){
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
  centalDist = 52*scale;
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

document.getElementById("version").innerHTML ="version: "+_ver;
