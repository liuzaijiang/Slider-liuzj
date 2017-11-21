(function() {
	/**
	 * [滑动条模板字符串]
	 * @type {String}
	 */
	var sliderString = '\
			<div class="slider-content" id="<%=sliderId%>">\
				<div class="slider-label"><%=sliderLabel%></div>\
				<div class="slider-left-label"><%=sliderLeftLabel%></div>\
				<div class="slider-setting">\
					<div class="slider-component">\
						<div class="slider-wrap">\
							<div class="slider-tracker">\
								<div class="slider-handle" id="handle<%=num%>"></div>\
								<div class="slider-progress" id="progress<%=num%>"></div>\
							</div>\
						</div>\
					</div>\
				</div>\
				<div class="slider-left-label"><%=sliderRightLabel%></div>\
			    <div class="slider-input-div">\
					<input type="text" maxLength=<%=inputMaxLength%> class="slider-input" id="text<%=num%>" value=<%=initialValue%>></input>\
					<label><%=suffix%></label>\
					<input type="hidden" name="<%=passValueName%>" id="passValueId<%=num%>"></input>\
				</div>\
			</div>\
			'

	/**
	 * [滑动条构造器函数] 
	 * @Author Liuzj
	 * @param {[Object]} [obj] [函数初始化数据对象]
	 * @param {[String]} [obj.sliderId] [设置ID]
	 * @param {[String]} [obj.mountId] [设置挂载对象ID]
	 * @param {[Array]}  [obj.range] [数据范围]
	 * @param {[Number]} [obj.inputMaxLength] [input输入字符限制，默认4]
	 * @param {[String]} [obj.title] [名称]
	 * @param {[Number or String]} [obj.initialValue] [初始值]
	 * @param {[Number]} [obj.passValueName] [数据传输时的name]
	 * @param {[String]} [obj.suffix] [数据单位，例如 '%' ]
	 * @param {[Number]} [obj.step] [分段值，用于连续分段数据，例如0-100的范围，以10为单位分段，0,10,20,30...100]
	 * @param {[Array]}  [obj.dataArray] [不连续分段数据，例如"1/32000", "1/24000", "1/16000", "1/12000",
	 * 									  当设置此值时input不能操作，并且设置step无效.]
	 * @param {[Boolean]} [obj.disabled] [控制状态，是否灰选，true为灰]
	 * @param {[Function]} [obj.callback] [拖动滑动条时触发的函数]
	 */
	function Slider(obj) {
		this.sliderId = obj.sliderId;
		this.mountId = obj.mountId || 'body';
		this.range = obj.range;
		this.inputMaxLength = obj.inputMaxLength || 4;
		this.title = obj.title;
		this.passValueName = obj.passValueName;
		this.initialValue = obj.initialValue;
		this.suffix = obj.suffix||"";
		this.sliderNum = 0; //内部使用，用来标示当前滑动条是第几个
		this.step = obj.step || 1;
		this.dataArray = obj.dataArray || [];
		this.disabled = obj.disabled || false;
		this.callback = obj.callback;

		this.init();
	}



	var g_sliderTotal = 0; //全局变量，表示滑动条总数
	var g_contextObj = {}; //全局变量，存放每个滑动条实例的上下文
	Slider.prototype = {
		/**
		 * [初始化函数]
		 * @return {[void]}
		 */
		init: function() {
			g_contextObj[this.sliderId] = this;
			this.renderFn();
			this.eventBindFn(this);
			this.setValue(this.initialValue);
			_disabledFn(this.sliderId, this.disabled);
			g_sliderTotal++;
		},
		/**
		 * [渲染函数]
		 * @return void
		 */
		renderFn: function() {
			// 利用_.template创建滑动条基本布局并将其渲染至页面
			sliderTemplate = _.template(sliderString);
			this.sliderNum = g_sliderTotal;

			var dom = sliderTemplate({
				sliderId: this.sliderId,
				sliderLabel: this.title,
				sliderLeftLabel: this.range[0]+this.suffix,
				sliderRightLabel: this.range[1]+this.suffix,
				inputMaxLength: this.inputMaxLength,
				num: this.sliderNum,
				passValueName: this.passValueName,
				initialValue: this.initialValue,
				suffix:this.suffix
			})
			if (this.mountId == "body") {
				$(this.mountId).append(dom);
			} else {
				$("#" + this.mountId).append(dom);
			}
			// 若是不连续分段函数则禁止input
			if (this.dataArray.length > 0) {
				$("#text" + this.sliderNum).prop("disabled", true);
			}

		},
		/**
		 * [事件绑定函数]
		 * @param  context  上下文
		 * @return void
		 */
		eventBindFn: function(context) {
			var sliderWidth = $(".slider-component").width();
			var sliderOffsetLeft = $("#" + context.sliderId + " .slider-setting").offset().left;
			var maxVal = context.range[1];
			var minVal = context.range[0];
			/*拖动*/
			$("#handle" + context.sliderNum).mousedown(function(e) {
				var status = $(this).parent().prop("disabled"); //判断滑动条是否禁止
				if (status) {
					return;
				}
				$(document).mousemove(_.throttle(function(e) {
					var x = e.pageX - sliderOffsetLeft;
					var per = parseFloat(parseFloat(x / sliderWidth * 100).toFixed(4)) //移动百分比

					if (per < 0) {
						per = 0;
					}
					if (per > 100) {
						per = 100;
					}

					_setValue(per, context);
					_triggerFn(context.callback);
					e.stopPropagation();

				}, 30));

				$(document).mouseup(function(e) {
					$(document).off("mousemove");
					$(document).off("mouseup");
					$(document).off("mouseleave");

					e.stopPropagation();

				});
				$("document").mouseleave(function(e) {
					$(document).off("mousemove");
					$(document).off("mouseup");
					$(document).off("mouseleave");
				});

				e.stopPropagation();
			})

			/*点击*/
			$("#" + context.sliderId + " .slider-wrap").mousedown(function(e) {
				var status = $(this).prop("disabled"); //判断滑动条是否禁止
				if (status) {
					return;
				}

				var x = e.pageX - sliderOffsetLeft;
				var per = parseFloat(parseFloat(x / sliderWidth * 100).toFixed(4))
				if (per < 0) {
					per = 0;
				}
				if (per > 100) {
					per = 100;
				}

				_setValue(per, context);
				_triggerFn(context.callback);
				e.stopPropagation();
			})

			/*文本框输入*/
			$("#text" + context.sliderNum).keyup(_.debounce(function() {
				var regStatus = (/^0+|\D+/g).test($(this).val());
				var val = $(this).val().replace(/^0+|\D+/g, "");
				if (!val || regStatus || val < context.range[0] || val > context.range[1]) {
					val = context.range[0];
				}
				context.setValue(val);
				context.callback();
			}, 800))

		},
		/**
		 * [改变滑动条数值函数]
		 * @param val为数据的具体显示值
		 */
		setValue: function(val) {
			var context = this;
			var len = context.dataArray.length;
			var per;
			if (len == 0) {
				var maxVal = context.range[1];
				var minVal = context.range[0];
				per = parseFloat(parseFloat((val - minVal) / (maxVal - minVal) * 100).toFixed(4));
			} else {
				_.forEach(context.dataArray, function(item, index) {
					if (val == item) {
						per = parseInt(index / (len - 1)) * 100;
					}
				})
			}
			$("#handle" + context.sliderNum).css("left", per + "%");
			$("#progress" + context.sliderNum).css("width", per + "%");
			$("#text" + context.sliderNum).val(val);
		},
	}

	/***************************提供给外部的接口**************************/
	/**
	 * [批量控制滑动条状态函数]
	 * @param  obj为传入对象;
	 * 		   obj.arry为滑动条id的数组;
	 * 		   obj.disabled为控制状态，true为灰选;
	 * @return void
	 */
	Slider.disabledFn = function(obj) {
		var arry = obj.arry;
		var status = obj.disabled;
		_.forEach(arry, function(item) {
			_disabledFn(item, status);
		})
	}

	/**
	 * [批量设置滑动条值函数]
	 * @param  obj为传入对象;
	 * 		   key为滑动条id;
	 *		   obj[key]为具体设置的值;
	 *		   例如:{
	 *		          "id1":20,
	 *		          "id2":80
	 *		   		}
	 */
	Slider.setValueFn = function(obj) {
			for (key in obj) {
				g_contextObj[key].setValue(obj[key]);
			}
		}
		/********************************end**********************************/

	/*****************************内部使用接口****************************/

	/**
	 * [单个滑动条的状态控制函数]
	 * @param  id为滑动条id;
	 * @param  status为控制状态，true为灰选;
	 * @return void
	 */
	var _disabledFn = function(id, status) {
		if (g_contextObj[id].dataArray.length == 0) {
			$("#" + id + " .slider-input").prop("disabled", status);
		}
		$("#" + id + " .slider-wrap").prop("disabled", status);
		$("#" + id + " .slider-handle").prop("disabled", status);
		$("#" + id + " .slider-progress").css("background-color", ["#e4e4e4", "#00a1d6"][status == true ? 0 : 1]);
	}

	/**
	 * [改变滑动条数值函数]
	 * @param per当前滑动条移动距离占整个滑动条宽度的百分比
	 * @param context为上下文
	 */
	var _setValue = function(per, context) {
		var val;
		var len = context.dataArray.length;
		if (len == 0) {
			var maxVal = context.range[1];
			var minVal = context.range[0];
			var _step = (maxVal - minVal) / context.step;
			val = minVal + Math.floor(per / 100 * _step) * context.step;
			val = per == 100 ? maxVal : val;
		} else {
			val = context.dataArray[parseInt(per * (len - 1) / 100)];
		}
		$("#handle" + context.sliderNum).css("left", per + "%");
		$("#progress" + context.sliderNum).css("width", per + "%");
		$("#text" + context.sliderNum).val(val);
	}

	/**
	 * [滑动条数值改变时的回调函数]
	 * @param  callback 为执行函数
	 * @return void
	 */
	var _triggerFn = _.debounce(function(callback) {
		if (callback) {
			callback();
		}
	}, 600);

	/********************************end**********************************/

	// 将Slider导出
	window.Slider = Slider;

})()

$(function() {

	var obj = {
		sliderId: "wdr",
		mountId: "mount",
		range: [10, 90],
		inputMaxLength: 4,
		title: "透明度",
		passValueName: "passValueName1",
		step: 10,
		initialValue: 20,
		suffix:'%'
	}

	var obj2 = {
		sliderId: "wdr2",
		mountId: "mount2",
		range: [0, 100],
		inputMaxLength: 4,
		title: "透明度",
		passValueName: "passValueName2",
		initialValue: 12,
		callback: function() {
			console.log("调用1")
		}
	}

	var obj3 = {
		sliderId: "wdr3",
		mountId: "mount2",
		range: ["1/32000", "1/100"],
		title: "透明度",
		passValueName: "passValueName3",
		dataArray: ["1/32000", "1/24000", "1/16000", "1/12000", "1/10000", "1/8000", "1/6000", "1/4000", "1/2000", "1/1000", "1/500", "1/250", "1/200", "1/150", "1/100"],
		initialValue: "1/100",
		disabled: false,
		callback: function() {
			console.log("调用2")
		}
	}

	new Slider(obj);

	new Slider(obj2);

	new Slider(obj3);


	Slider.setValueFn({
		"wdr2": 90
	});

	Slider.disabledFn({
		arry: ["wdr3"],
		disabled: false
	});
})