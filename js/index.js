class Mine {
  constructor(tr = 9, td = 9, miniNum = 10) {
    this.tr = tr; // 行数
    this.td = td; // 列数
    this.miniNum = miniNum; // 雷的数量

    // 存储所有坐标信息的二维数组
    this.squares = [];

    // 存储所有单元格的二维数组
    this.tds = [];

    // 剩余雷的数量
    this.surplusMine = miniNum;

    // 点击标的小红旗是否全是雷，用来判断用户是否游戏成功
    this.allRight = false;

    this.parent = document.querySelector(".gameBox");

    this.mineNumDom = document.querySelector(".mineNum");
  }
  // 生成n个不重复的数字
  randomNum() {
    // 生成一个空数组,但是有长度,长度为格子总数
    const square = new Array(this.tr * this.td);
    for (let i = 0; i < square.length; i++) {
      square[i] = i;
    }
    square.sort(() => 0.5 - Math.random());
    return square.slice(0, this.miniNum);
  }
  // 填充坐标信息
  fillCoordinates() {
    // 雷在格子里的位置
    const minePosition = this.randomNum();
    let n = -1; // 用来找对应的索引格子

    //  行与列的形式:  (0,0) (0,1) (0,2) ...
    //  坐标的形式:    (0,0) (1,0) (2,0) ...
    //
    // 注意:  取一个方块在数组里的数据，要使用行与列的形式存取
    //     找方块周围的方块的时候，要用坐标的形式去取
    //     行与列的形式，和坐标的形式，x，y是刚好相反的
    //     行对应的是y轴 (y轴固定),列对应的是x轴(x轴变化)

    // 生成坐标信息数组(二维数组) 存储在 this.squares中
    for (let i = 0; i < this.tr; i++) {
      this.squares[i] = [];
      for (let j = 0; j < this.td; j++) {
        // 如果这个条件成立，说明现在循环到的索引在雷的数组里面找到了，那就表明这个索引对应的是个雷
        if (minePosition.includes(++n)) {
          this.squares[i][j] = {
            type: "mine",
            x: j,
            y: i,
          };
        } else {
          this.squares[i][j] = {
            type: "number",
            x: j,
            y: i,
            value: 0,
          };
        }
      }
    }
    console.log(`雷的随机位置:`, minePosition);
    // console.log(`坐标信息数组: `, this.squares);
  }
  init() {
    this.fillCoordinates();
    this.updateNum();
    this.createDom();

    // 阻止扫雷区域鼠标右击事件
    this.parent.oncontextmenu = function () {
      return false;
    };

    // 剩余雷数量的变化 
    this.mineNumDom.innerHTML = this.surplusMine;
    // console.log(`dom信息数组: `, this.tds);
  }
  // 创建表格
  createDom() {
    const table = document.createElement("table");
    for (let i = 0; i < this.tr; i++) {
      const tr = document.createElement("tr");
      this.tds[i] = [];
      for (let j = 0; j < this.td; j++) {
        const td = document.createElement("td");
        // 把所有创建的td添加到数组当中
        this.tds[i][j] = td;

        //把格子对应的行与列存到格子身上,为了下面通过这个值去数组里取到对应的数据
        td.pos = [i, j];

        // 给每一个格子注册鼠标按钮事件
        td.onmousedown = (event) => {
          this.play(event, td);
        };

        // if (this.squares[i][j].type === "mine") {
        //   td.className = "mine";
        // } else {
        //   td.innerHTML = this.squares[i][j].value;
        // }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    this.parent.innerHTML = "";
    this.parent.appendChild(table);
  }
  // 找某个方格周围的8个方格
  // square 坐标,与行和列是相关的
  getAround(square) {
    const x = square.x; // x轴坐标
    const y = square.y; // y轴坐标
    // 把找到的格子的坐标返回出去(二维数组)
    const result = [];
    /*
			x-1,y-1   x,y-1   x+1,y-1  
			x-1,y     x,y     x+1,y
			x-1,y+1	  x,y+1   x+1,y+1
		*/
    // 通过坐标去循环九宫格
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (
          i < 0 || // 格子超出来左边的范围
          i > this.td - 1 || // 格子超出了右边的范围
          j < 0 || // 格子超出了上边的范围
          j > this.tr - 1 || //格子超出了下边的范围
          (i === x && j === y) || // 当前循环到的格子是自己, 当前x,y是坐标
          this.squares[j][i].type === "mine" // 周围的格子是个雷
        ) {
          continue;
        }
        // 要以行与列的形式返回出去，因为到时候需要它去取数组里的数据
        result.push([j, i]);
      }
    }
    return result;
  }
  // 更新所有的数字
  updateNum() {
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {
        // 如果当前这个格子是数字，跳出当前循环，只更新雷周围的数字
        if (this.squares[i][j].type === "number") {
          continue;
        }
        // 获取到每一个雷周围的数字
        const num = this.getAround(this.squares[i][j]);
        for (let k = 0; k < num.length; k++) {
          /**
           * num[k] = [0, 0]
           * num[k][0] = 0;
           * num[k][1] = 1;
           */
          this.squares[num[k][0]][num[k][1]].value += 1;
        }
      }
    }
  }
  // 开始游戏
  play(ev, obj) {
    // 用户点击的是左键(用户标完小红旗后不能被左键点击)
    if (ev.which === 1 && obj.className !== "flag") {
      // 1. 当前点击的格子所存储的类型信息
      const curSquare = this.squares[obj.pos[0]][obj.pos[1]];
      // console.log(curSquare); // {type: "number", x: 6, y: 4, value: 2}

      // 2. 数字的颜色数组
      const color = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
      ];
      // 用户点击的是数字
      if (curSquare.type === "number") {
        // 1.点击的不是数字0
        obj.innerHTML = curSquare.value;
        obj.className = color[curSquare.value];
        // 2.点击的是数字0,使用递归
        if (curSquare.value === 0) {
          /**
           *     用户拿到了数字0
           *     1、显示自己
           *     2、找四周
           *          1、显示四周(如果四周的值不为0,那就显示到这里,不需要在找了)
           *          2、如果值为0
           *               1、显示自己
           *               2、找四周(如果四周的值不为0,那就显示到这里,不需要在找了)
           *                    1、显示自己
           *                    2、找四周(如果四周的值不为0,那就显示到这里,不需要在找了)
           */
          obj.innerHTML = "";

          const getAllZero = (square) => {
            // 找到了空白周围的n个格子
            const around = this.getAround(square);

            for (let i = 0; i < around.length; i++) {
              const x = around[i][0]; // 行
              const y = around[i][1]; // 列

              this.tds[x][y].className = color[this.squares[x][y].value];

              if (this.squares[x][y].value === 0) {
                // 如果以某个格子为中心找到的格子值为0,那么就需要接着调用函数(递归)
                if (!this.tds[x][y].check) {
                  // 给对应的td添加一个属性,这条属性用于决定这个格子有没有被找过,如果找过的话,它的值就为true,下次就不会再找了
                  this.tds[x][y].check = true;
                  getAllZero(this.squares[x][y]);
                }
              } else {
                // 如果以某个格子为中心找到的四周格子不为0,那就把人家的数字显示出来
                this.tds[x][y].innerHTML = this.squares[x][y].value;
              }
            }
          };
          getAllZero(curSquare);
        }
      } else {
        // 用户点到的是雷
        alert("游戏失败~");
        this.gameOver(obj);
      }
    }
    // 用户点击的是右键
    else if (ev.which === 3) {
      // 1.如果点击的是一个数字，就不能点击
      if (obj.className && obj.className !== "flag") {
        return;
      }
      // 2.点击添加标记,以及切换class类名
      obj.className = obj.className === "flag" ? "" : "flag";

      // 3.判断标过的标记是否正确
      if (this.squares[obj.pos[0]][obj.pos[1]].type === "mine") {
        this.allRight = true;
      } else {
        this.allRight = false;
      }

      // 4.剩余的雷数的更改
      if (obj.className === "flag") {
        this.mineNumDom.innerHTML = --this.surplusMine;
      } else {
        this.mineNumDom.innerHTML = ++this.surplusMine;
      }

      // 5.判断游戏是否胜利
      if (this.surplusMine === 0) {
        //剩余的雷的数量为0,表示用户已经标完小红旗了,这时候要判断游戏是成功还是结束
        if (this.allRight) {
          alert("恭喜你，游戏胜利~");
        } else {
          alert("游戏失败~");
          this.gameOver();
        }
      }
    }
  }
  // 游戏失败
  gameOver(clickTd) {
    /**
     * 1. 显示所有的雷
     * 2. 取消所有格子的点击事件
     * 3. 把当前点击的雷标红
     */
    for (let i = 0; i < this.tr; i++) {
      for (let j = 0; j < this.td; j++) {
        if (this.squares[i][j].type === "mine") {
          this.tds[i][j].className = "mine";
        }
        // 全消所有单元格的点击事件
        this.tds[i][j].onmousedown = null;
      }
    }
    if (clickTd) {
      clickTd.style.backgroundColor = "#f00";
    }
  }
}

const btnAll = document.querySelectorAll(".level button");
//不同级别的行数与列数,雷数
const gameArr = [
  [9, 9, 10],
  [16, 16, 40],
  [28, 28, 99],
];  

//用来处理当前选中的状态
let ln = 0;
for (let i = 0; i < btnAll.length - 1; i++) {
  btnAll[i].onclick = function () {
    btnAll[ln].className = "";
    this.className = "active";
    const mine = new Mine(...gameArr[i]);
    mine.init();
    ln = i;
  };
}

//页面初始化
btnAll[0].onclick();

// 重新开始 (执行当前有active的点击事件)
btnAll[3].onclick = function () {
  for (var i = 0; i < btnAll.length - 1; i++) {
    if (btnAll[i].className == "active") {
      btnAll[i].onclick();
    }
  }
};
