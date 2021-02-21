# JavaScript-Mine-Clearance
原生JavaScript实现扫雷小游戏

## 实现思路:

核心:  实现存储页面所有方格信息数组(squares):  格式为 { x: 行坐标, y: 列坐标,  type: mine/number, value: 如果是数字,所展示的数字 }

### 一、动态生成页面结构

1. 扫雷整体使用表格<table></table>实现
2. 根据传入的行数与列数，循环生成tr/td标签

### 二、地雷的随机分布

1. 封装一个函数randomNum() 
   * 根据方格的总数量(tr*td)生成一个对应长度的数组(内容为从1~ 总数量)，并将其进行乱序，并根据传入的雷数进行对应数量的截取

2. 生成存储所有坐标信息的二维数组 squares
   * [ [ {}, {} ], [ {}, {} ] ]
   * 根据randomNum() 生成的雷的位置，填充每一个格子的信息
   * 格式为 { x: 行坐标, y: 列坐标,  type: mine/number, value: 如果是数字,所展示的数字 }
   * value值一开始都设置为0

### 三、根据地雷的位置，生成周围的数字

1. 封装一个函数 getAround()
   * 获取某一个格子一圈的坐标， 以行与列的形式返回出去,是一个二维数组

2. 更新雷周围的数字
   * 循环所有格子，根据squares判断当前格子是不是雷，如果不是，跳出循环
   * 如果是雷，根据getAround()生成周围的坐标
   * 遍历坐标，将所有的坐标的value值加1
3. 执行到这步以后，每个格子的信息都存储到squares中，页面上不会有任何效果，在元素中也检查不到哪个元素是雷

### 四、事件的注册

1. 创建元素的时候，就顺便给每一个格子td注册鼠标按下事件(因为要区分左右键)，执行play(event, td)这个开始游戏函数

2. 点击左键 

   * 执行play(event,obj)函数

   * 获取当前格子信息 （如何获取）

     * 当初创建元素的时候，就给每一个td添加一个属性position  td.position = [行，列]

     * 根据td的position属性从squares上获取每一个格子具体的信息  currentSquare = squares(obj.position [0])(obj.position [1]);

     * 判断当前的点击的是雷还是数字

       * 是数字

         * 点击的不是0

           * 显示数字 obj.innerHTML = currentSquare.value
           * const color = ["zero","one","two","three","four","five","six","seven","eight"];
           * 数字的颜色无非就是添加分别添加一个样式  obj.className = color[currentSquare.value];

         * 点击的是0

           * 清空内容  obj.innerHTML = ""

           * 思路：

             *用户拿到了数字0*

             ​      *1、显示自己*

             ​      *2、找四周*

             ​             *1、显示四周(如果四周的值不为0,那就显示到这里,不需要在找了)*

             ​            *2、如果值为0*

             ​                     *1、显示自己*

             ​                     *2、找四周(如果四周的值不为0,那就显示到这里,不需要在找了)*

             ​                          *1、显示自己*

           ​                                 *2、找四周(如果四周的值不为0,那就显示到这里,不需要在找了)*

           * 整个过程是重复性的，使用递归
             * 封装函数 getAllZero(square)函数
               * 找到空白格子一周的坐标
               * 循环遍历，添加一个zero类名
               * 判断如果以某个格子为中心找到的格子值为0,那么就需要接着调用函数(递归)， 但是会重复性的寻找，导致栈溢出
               * 所以给每一个格子添加一个属性check，表示是否找过，如果找过以后不再调用，否则继续调用该函数
               * 判断如果以某个格子为中心找到的格子值不为0，显示原有的数字
             * 先调用一次 getAllZero(currentSquare);

       * 是雷

         * 执行gameOver(obj)函数
         * obj为当前点击的雷

3. 点击右键

	 * 阻止系统默认行为
   * 如果点击的是一个数字，就不能点击
   * 点击添加标记flag(小红旗)，可切换是否显示标记
   * 判断标记过后的标记是否正确 （allRight = true）
     * 根据squares(td.position[0])(td.position[1]).type === 'mine'  是不是雷
     * 确定allRight的值 true/false

   * 剩余雷数的更改
     * 是否存在flag，更改一个变量surplusMine的值  

   * 判断游戏是否胜利
     * 判断surplusMine是否全等于0
     * 再判断allRight的值是否为true，判断游戏胜利失败

### 五、游戏失败

> 封装函数：gameOver(clickTd)

* 显示所有的雷
  * 循环所有格子，判断squares(i)(j).type === 'mine'
  * tds(i)(j).className =  'mine'
* 取消所有格子(td)的点击事件
  * this.tds[i][j].onmousedown = null;
* 把当前的点击的雷标红
  * clickTd.style.backgroundColor = "#f00";