/******************************************************
说明：2017-5-25

******************************************************/
if (typeof jQuery === 'undefined') {
		throw new Error('Slider\'s JavaScript requires jQuery')
}

function Slider(){
	this.imgMinus = new Image();
	this.imgPlus = new Image();
	this.imgSlider = new Image();
	this.imgSlope = new Image();
}



Slider.prototype = {
	sliderArray : new Array(),
	target : null,
	timeout : null,
	dragID: 0,
	type: "Slider",
	/************************/
	imgSet: function(type){
		if(typeof(type)==="object"){
			this.imgMinus.src = type.imgMinus;
			this.imgPlus.src = type.imgPlus;
			this.imgSlider.src = type.imgSlider;
			this.imgSlope.src = type.imgSlope;
		}else{
			this.imgMinus.src = './images/minus.gif'
			this.imgPlus.src = './images/plus.gif'
			this.imgSlider.src = './images/slider_handle.gif'
			if(type=="Slider-Slope")
			{
				this.imgSlope.src = './images/slope.gif'
			}	
		}
	},
	/************************/
	value : function(divID,value,flag){
		var value = parseInt(value);
		var length = this.sliderArray.length;
		var obj, temp;
		for(var i = 0; i < length; i++){
			temp = this.sliderArray[i];
			if(divID==temp.divID){
				obj=temp; 
				break;
			}
		}
		if(obj){
			if(isNaN(value)){
				return obj.value;
			}
			value = value<obj.Nmin? obj.Nmin: value;
			value = value>obj.Nmax? obj.Nmax: value;
			var pos = parseInt( (value-obj.Nmin)*obj.sliderRge/(obj.Nmax-obj.Nmin) );//移动距离
			//console.log(value)
			//console.log(obj.sliderRge)
			//console.log(pos);
			if(obj.type=="Slider-BreakPoint")
			{
				for(var i=0;i<obj.rangeArray.length;i++)
				{
						if(flag==1)
						{
							if(pos>=obj.rangeArray[i]&&pos<=obj.rangeArray[i+1])
							{
								pos=obj.rangeArray[i+1];
								value=obj.dataArray[i+1];
								break;
							}
						}
						else if(flag==0)
						{
							if(pos>=obj.rangeArray[i]&&pos<obj.rangeArray[i+1])
							{
								pos=obj.rangeArray[i];
								value=obj.dataArray[i];
								break;
							}
						}
						else{
							break;
						}
				}
			}
			temp = obj.slider.style.display;
			obj.slider.style.display="inline";
			obj.slider.style.left= 18+pos+"px";
			obj.slider.style.display=temp;
			temp = obj.front.style.display;
			obj.front.style.display = "inline";
			obj.front.style.width = pos+obj.offset+"px";
			obj.front.style.display = temp;
			//value = obj.Nmax + obj.Nmin - value;//调转大小头
			obj.inputObj.val(value);
			obj.passObj.val(value);
			obj.labelObj.text(value);
			obj.value = value;
		}
	},
	/************************/
	sliderMove: function(obj, ev){
			var offset = ev.pageX - obj.line.offset().left;
			var rgeMax = obj.sliderRge;
			offset = offset<0? 0: offset;
			offset = offset>rgeMax? rgeMax: offset;
			
			obj.slider.style.left= offset+18+"px";
			obj.front.style.width = offset+obj.offset+"px";
			var value = Math.round(offset*obj.step) + obj.Nmin;
			//value =targetObj.Nmax + targetObj.Nmin -value; //调转大小头
			if(obj.type!="Slider-BreakPoint")
			{
				obj.value = value;
				obj.inputObj.val(value);
				obj.passObj.val(value);
				obj.labelObj.text(value);
			}
			return obj.value;
		},
		
	/************************/
	sliderUp : function(obj, ev){
			var offset = ev.pageX - obj.line.offset().left;
			var rgeMax = obj.sliderRge;
			offset = offset<0? 0: offset;
			offset = offset>rgeMax? rgeMax: offset;
			var value = Math.round(offset*obj.step) + obj.Nmin;
			var value;
			for(var i=0;i<obj.dataArray.length;i++){
				if(obj.value==obj.dataArray[i])
					break;
			}
			if(offset<obj.rangeArray[i]){
				offset=obj.rangeArray[i-1];
				value=obj.dataArray[i-1];
			}
			else if(offset>obj.rangeArray[i]){
				offset=obj.rangeArray[i+1];
				value=obj.dataArray[i+1];
			}
			else{
				offset=obj.rangeArray[i];
				value=obj.dataArray[i];
			}

			obj.slider.style.left= offset+18+"px";
			obj.front.style.width = offset+obj.offset+"px";
			
			setTimeout(function(){
				obj.value = value;
				obj.inputObj.val(value);
				obj.passObj.val(value);
				obj.labelObj.text(value);
			},10)
	},
	
	creat: function(obj){
		//解析对象
		var divID=obj.divID;
		var dataName=obj.dataName;
		var textChange=obj.textChange||false;
		var Nmin=obj.Nmin||0;
		var Nmax=obj.Nmax||10;
		var clickStep=obj.step||1;
		var hander=obj.hander;
		var defaultValue=obj.defaultValue||Nmin;
		var type=obj.type;
		var dataArray=obj.dataArray;
		var state=obj.state
		
		//断点式
		if(type=="Slider-BreakPoint")
		{
			Nmin=dataArray[0];
			Nmax=dataArray[dataArray.length-1];
		}
		
		if(typeof obj.divID == "undefined"){
			throw new Error("Please check the target id!");
		}
		
		//图片初始化
		this.imgSet(type);
	
		var targetDiv = $("#"+divID);
		targetDiv.empty();
		
		var tempArray = this.sliderArray;
		var length=tempArray.length;
		for(var i=0; i < length;i++){
			if(divID==tempArray[i].divID){
				tempArray.splice(i, 1);
				break;
			}
		}
		targetDiv.css({
			'float': 'left',
			'width': '140px',
			'margin-top': '2px',
		})
		
		
		//减
		var imgMinus = $("<img style='width:18px;"+
									  "height:18px;"+
									  "position:absolute;"+
									  "left:0;"+
									  "cursor:pointer;"+
									  "'/>");
		
		imgMinus.attr("src",this.imgMinus.src);
		//加
		var imgPlus = $("<img style='width:18px;"+
									"height:18px;"+
									"position:absolute;"+
									"cursor:pointer;"+
									"'/>");
		
		imgPlus.attr("src",this.imgPlus.src);
		//斜坡
		if(type=="Slider-Slope")
		{
			var imgSlope = $("<img style='position:absolute;"+
										 "top:2px;"+
										 "left:22px;"+
										 "z-index:0"+
										 "'/>");
			imgSlope.attr("src",this.imgSlope.src);
		}
	
		//空白点击处，宽度为整个滑动条区域，使得点击空白地方显示的滑动块可以移动
		var blankClick  = $("<div style='height:28px;"+
										"position:absolute;"+
										"top:0px;"+
										"left:22px;"+
										"cursor:pointer;"+
										"z-index:2;"+
										"'/>");
		
		//显示的滑动块，我们可以看见的，能够用手拖动
		var imgSlider = document.createElement("img");
		$.extend(imgSlider.style, {
									width:'9px', 
									height:'13px',
									position:'absolute',
									top:'3px',
									left:'18px',
									cursor:'pointer',
									zIndex:'3'
									});
		imgSlider.src=this.imgSlider.src;
		
		//整个容器
		var container = $('<div style="width:100%;'+
									  'overflow:hidden;'+
									  'height:30px;'+
									  'border:0;'+
									  'padding:0;'+
									  'position:relative"'+
									  '></div>');
		//滑动条有效区域
		var background = $('<div style="overflow:hidden;'+
										"position:absolute;"+
										"left:22px;"+
										"top:12px;"+
										"border-top:1px #888 solid;"+
										"cursor:pointer;"+
										"z-index:2"+
										'"></div>');
		
		//底部滑动块进度条
		var front = document.createElement("div");
		$.extend(front.style, {
							   width:"0px",
							   height:'3px',
							   overflow:'hidden',
							   position:'absolute',
							   left:'22px',
							   top:'10px',
							   cursor:'pointer',
							   zIndex:1,
							   backgroundColor:'#636363'
							   });//backgroundColor:'#696969',
			
		//最小值标签
		var labelMin = document.createElement("label");
		var minText=document.createTextNode(Nmin);
		labelMin.appendChild(minText);
		$.extend(labelMin.style, {
									overflow:'hidden',
									position:'absolute',
									left:'18px',
									top:'14px'
								 });
		
		//最大值标签
		var labelMax = document.createElement("label");
		var maxText=document.createTextNode(Nmax);
		labelMax.appendChild(maxText);
		$.extend(labelMax.style, {
									overflow:'hidden',
									position:'absolute',
									top:'14px'
								 });
		
		

		var labelHidden=textChange==true?"none":"";
		var inputHidden=textChange==true?"":"none";
		
		//显示数据
		var labelData = document.createElement("label");
		var defaultData = document.createTextNode(defaultValue);
		labelData.appendChild(defaultData);
		$(labelData).css({
					'float': 'left',
					'font-size':'14px',
					'display': 'inline',
					'margin-left': '0',
					'margin-top': '4px',
					'margin-right': '5px',
					'width': '38px',
					'display':'inline-block',
					'overflow':'hidden',
					'padding':'0',
					'display':labelHidden
					})
		
		//修改数据
		var inputData = document.createElement("input");
		$(inputData).css({
					'float': 'left',
					'font-size':'14px',
					'display': 'inline',
					'margin-left': '0',
					'margin-top': '4px',
					'margin-right': '5px',
					'width': '38px',
					'display':'inline-block',
					'overflow':'hidden',
					'padding':'0',
					'display':inputHidden
					})
		$(inputData).prop("maxLength",Nmax.toString().length)
		
		//传递数据，由于input被灰掉后无法传值，所以加一个hidden进行传值
		var passData = document.createElement("input");
		$(passData).prop({
			'type':'hidden',
			'name':dataName
		})
	
		
		var wrappWidth, centerWidth, sliderWidth;
		//wrappWidth为包裹整个滑动条div的宽度
		//centerWidth为整个滑动条div除了加减号外的宽度
		//sliderWidth为滑动块的宽度
		if( (wrappWidth=parseInt(targetDiv.width())) && wrappWidth > (imgMinus.width()+imgPlus.width()) ){
			/**/;
		}else{
			wrappWidth = 100 + imgMinus.width() + imgPlus.width();
			targetDiv.css("width", wrappWidth+"px");
		}
		

		
		imgPlus.css("left",wrappWidth - imgPlus.width() + "px");
		//加减号和滑动条之间的空白距离为8
		centerWidth = parseInt(wrappWidth) - 2*parseInt(imgPlus.css("width").replace(/\D/g,'')) - 8;
		blankClick .css("width", centerWidth+"px");
		background.css("width", centerWidth+"px");
		$(labelMax).css("left",centerWidth+10+"px");//动态决定最大标签的位置，因为滑动条宽度可变
		sliderWidth = imgSlider.style.width.replace(/\D/g,'');
		
		/*断点式滑动条*/
		if(type=="Slider-BreakPoint")
		{
			var oneWidth=(centerWidth - sliderWidth+8)/(dataArray[dataArray.length-1]-dataArray[0])
			var rangeArray=new Array();
			var breakPonitDiv=new Array();
			for(var i=0;i<dataArray.length;i++)
			{
				rangeArray[i]=oneWidth*(dataArray[i]-dataArray[0]);
				breakPonitDiv[i]=document.createElement("div");
				var left=rangeArray[i]+22
				$(breakPonitDiv[i]).css({
									"width":"2px",
									"left":left+"px",
									"height":"6px",
									"position":'absolute',
									"top":'7px',
									"zIndex":'1',
									"background-color":"#888"
				})
				container.prepend(breakPonitDiv[i]);
			}
		}
		/*end*/
		
		container.prepend(imgMinus);
		container.prepend(imgPlus);
		container.prepend(imgSlope);
		container.prepend(blankClick );
		container.prepend(imgSlider);
		container.prepend(background);
		container.prepend(front);
		container.prepend(labelMin);
		container.prepend(labelMax);
		targetDiv.prepend(container);
		targetDiv.before(labelData);
		targetDiv.before(inputData);
		targetDiv.before(passData);
		targetDiv.contextmenu(function(){return false});//防止右键出现菜单
		
		

		var inputObj = $(inputData);
		var labelObj = $(labelData);
		var passObj = $(passData);
		
		var Nmin = Nmin? Nmin: 0;
		var Nmax = Nmax? Nmax: 100;
		if(Nmin==Nmax){Nmax=Nmax+1};
		if(Nmin > Nmax){var tempValue=Nmin; Nmin=Nmax; Nmax=tempValue};
		

		var dragObj = {
			divID: divID,
			type:type,
			Nmin: Nmin,
			Nmax: Nmax,
			value: Nmin,
			inputObj: inputObj,
			labelObj: labelObj,
			passObj:passObj,
			background: background,
			front: front,
			minus: imgMinus,
			plus: imgPlus,
			line: blankClick ,
			slider: imgSlider,
			slope:imgSlope,
			sliderRge: centerWidth - sliderWidth+8,//可以移动的范围
			step: ((Nmax - Nmin)/(centerWidth - sliderWidth+8)).toFixed(5),//每一步走多远
			offset: parseInt(sliderWidth/2),
			hander: ( "function"==(typeof hander) )? hander: function(){},
			enable: true,
			rangeArray:rangeArray,
			dataArray:dataArray
		};
		
		//将对象放入数组中
		var tempIndex;
		tempIndex = this.sliderArray.length;
		this.sliderArray[tempIndex] = dragObj;
		
		var temp;
		temp = dragObj

		var condition = this;
		//condition为当前这个对象
		//temp为当前这个滑动条创造出来用来存放自己属性的对象
		
		/*默认值初始化*/
		if(defaultValue>0)
		{
			this.value(divID,defaultValue)
		}
		/*状态初始化*/
		if(state==false)
		{
			this.state(divID,false);
		}
		//减号按钮事件
		$(temp.minus).mousedown(function(ev) {

			var value = temp.value;
            if( (!temp.enable)||(value<=temp.Nmin) ){
				return;
			}
			var timeout = 50;
			if( "object"==(typeof ev) ){
				ev.preventDefault();
				timeout = 500;
			};
			condition.value(temp.divID, value-clickStep,0);
			temp.hander(temp.value);
			
			//可以做连续动作
			condition.timeout = setTimeout(
			arguments.callee, timeout);
        });
		
		//加号按钮事件
		$(temp.plus).mousedown(function(ev){
			var value = temp.value;
			if( (!temp.enable)||(value>=temp.Nmax) ){
				return;
			}
			var timeout = 50;
			if( "object"==(typeof ev) ){
				ev.preventDefault(); timeout = 500;
			};
            condition.value(temp.divID, value+clickStep,1);
			temp.hander(temp.value);
			condition.timeout = setTimeout(
			arguments.callee, timeout
			);
        });
		
		//文本框修改值
		$(temp.inputObj).keyup(function(){
			if(this.value>=temp.Nmin&&this.value<=temp.Nmax)
			{
				condition.value(temp.divID, this.value);
			}
			}).blur(function(){
				if(this.value==""||this.value<temp.Nmin||this.value>temp.Nmax)
				{
					this.value=temp.Nmin;
					condition.value(temp.divID,temp.Nmin);
				}
			})
		
		$(temp.minus).mousemove(function(ev){ev.preventDefault();});
		$(temp.plus).mousemove(function(ev){ev.preventDefault();});
		$(temp.line).mousemove(function(ev){ev.preventDefault();});
		$(temp.slope).mousemove(function(ev){ev.preventDefault();});
		$(temp.minus).mouseup(function(ev){clearTimeout(condition.timeout);});
		$(temp.plus).mouseup(function(ev){clearTimeout(condition.timeout);});
		$(temp.minus).mouseout(function(ev){clearTimeout(condition.timeout);});
		$(temp.plus).mouseout(function(ev){clearTimeout(condition.timeout);});
		
		
		//点击空白滑动条空白处
		$(temp.line).mousedown(function(ev){
			if(!temp.enable){return;};
			condition.target = temp;
			ev.preventDefault();
			condition.sliderMove(temp, ev);
			temp.hander(temp.value);
        });
		
		
		//拖动滑动块
		$(temp.slider).mousedown(function(ev){
			if(!temp.enable){return;};
			condition.target = temp;
			ev.preventDefault();
			condition.sliderMove(temp, ev);
			temp.hander(temp.value);
			
			$(this).mousemove(function(ev){
				if( condition.target != temp ){
					ev.preventDefault();
					return;
				}
				clearTimeout(condition.dragID);
				condition.dragID = setTimeout(function(){
					var valueLast = temp.value;
					if(valueLast != condition.sliderMove(temp, ev)){
						temp.hander(temp.value);
					}
				},0);
				return false;
			});
        });
		
		$(temp.slider).mouseup(function(ev){
			$(this).off("mousemove");
			if(condition.target&&condition.target.type=="Slider-BreakPoint")
			{
				condition.sliderUp(temp, ev)
			}
			condition.target = null;
			return false;
		});
	
		
		
		if(1 == condition.sliderArray.length)
		{
			$(document).mousemove(function(ev){
				var dragObj = condition.target;
				if( !dragObj){
//					ev.preventDefault();
					return;
				}
				clearTimeout(condition.dragID);
				condition.dragID = setTimeout(function(){
					var valueLast = dragObj.value;
					if(valueLast != condition.sliderMove(dragObj, ev)){
					dragObj.hander(dragObj.value);
					};},0);
				return false;
			});
			
			$(document).mouseup(function(ev){
				if(condition.target&&condition.target.type=="Slider-BreakPoint")
				{
					condition.sliderUp(temp, ev)
				}
				condition.target = null;
				clearTimeout(condition.timeout);
			});
		}
	},
	/************************/
	state: function(divID, flag){
		var targetObj;
		var objArray = this.sliderArray;
		for(var i=0, j=objArray.length; i<j; i++){
			if(divID==objArray[i].divID){
				targetObj = objArray[i];
				break;
			}
		}
		if(targetObj){
			if("undefined" == (typeof flag)){
				return targetObj.enable;
			}else{
				var ObjCss;
				if(flag){
					ObjCss={cursor: "pointer", opacity: 1};
					targetObj.line.css("cursor", "pointer");
					targetObj.inputObj.attr("disabled", false);
					targetObj.labelObj.attr("disabled", false);
				}else{
					ObjCss={cursor: "default", opacity: 0.6};
					targetObj.line.css("cursor", "default");
					targetObj.inputObj.attr("disabled", true);
					targetObj.labelObj.attr("disabled", true);
				}
				targetObj.minus.css(ObjCss);
				targetObj.plus.css(ObjCss);
				$(targetObj.slider).css(ObjCss);
				targetObj.background.css(ObjCss);
				$(targetObj.front).css(ObjCss);
				$(targetObj.slope).css(ObjCss);
				targetObj.enable = Boolean(flag);
			}
		}
	}
};