BrainContent = function()
{
	if (typeof $ == "undefined") { console.log("jQuery required!"); return null; }

	/**** stats ****/
	var stats_session;
	var stats_ping_interval;
	var stats_ping_delay = 30; // in seconds
	var stats_max_scrolling = 0;
	this.iniStats = function(session)
	{
		if (session == "null") { console ? console.error("Error: %s (%i)", "bcStats database error", 501) : alert("bcStats database error"); return false; }
		stats_session = session;
		_this = this;
		stats_ping_interval = setInterval(function()
		{
			_this.ping();
		}, stats_ping_delay*1000);
		this.ping();
		$(document).ready(function()
		{
			$(window).scroll(function()
			{
				var current_scrolling = Math.round($(window).scrollTop() / ($(document).height() - window.innerHeight) * 100);

				stats_max_scrolling = Math.max(stats_max_scrolling, current_scrolling);
			});
		});
	};
	this.stopAutoPing = function()
	{
		clearInterval(stats_ping_interval);
		console ? console.info("bcStats.autoPing has been stopped") : alert("bcStats.autoPing has been stopped");
	};
	this.ping = function()
	{
		if (typeof stats_session != "undefined")
		{
			if (document.referrer)
			{
				var referrer = document.referrer.match(/(https|http):\/\/(www\.|)(.*)/)[3];
			}
			else
			{
				var referrer = "direct";
			}
			var timestamp = Math.round(new Date().getTime()/1000);
			// var ping_url =  "/bc_ping.php?s="+stats_session+
			// 				"&r="+encodeURIComponent(referrer)+
			// 				"&m="+stats_max_scrolling+
			// 				"&t="+timestamp;
			// var ping = new Image();
			// ping.src = ping_url;
		}
		else
		{
			console ? console.error("Error: %s (%i)", "bcStats are not initialised", 400) : alert("bcStats are not initialised");
		}
	};

	/**** mouse stuff ****/
	this.disableDrag = function(elem)
	{
		if (typeof elem != "undefined")
		{
			elem.addClass("bcNoDrag").bind("dragstart", function(e)
			{
				e.preventDefault();
			});
		}
	};
	this.disableMousedown = function(elem)
	{
		if (typeof elem != "undefined")
		{
			elem.addClass("bcNoMousedown").bind("mousedown", function()
			{
				return false;
			});
		}
	};

	this.resizeIframe = function(obj)
	{
		obj.style.height = obj.contentWindow.document.body.scrollHeight+"px";
	};

	/**** contextmenu ****/
	this.contextmenu = function(elem, items)
	{
		elem.contextmenu(function(e)
		{
			$("#contextmenu").remove();

			var x = e.pageX, y = e.pageY;

			var ctxmenu = $("<ul></ul>");
			ctxmenu.attr("id", "contextmenu")
			ctxmenu.css({
				"left": x,
				"top": y
			});

			for (i=0; i<items.length; i++)
			{
				item = items[i];
				ctxmenu.append(
					$("<li></li>")
						.html(item.title)
						.data("action", item.action)
						.click(function()
						{
							$(this).data("action")();
						})
				);
			}

			ctxmenu.appendTo("body");

			return false;
		});

		$("body").contextmenu(function()
		{
			if ($("#contextmenu").length > 0)
			{
				$("#contextmenu").fadeOut(80, function(){$(this).remove();});
			}
		});
		$("body").click(function()
		{
			if ($("#contextmenu").length > 0)
			{
				$("#contextmenu").fadeOut(80, function(){$(this).remove();});
			}
		});
		$(window).scroll(function()
		{
			if ($("#contextmenu").length > 0)
			{
				$("#contextmenu").fadeOut(80, function(){$(this).remove();});
			}
		});
	};

	/**** dialogs ****/
	this.popup = function(title, content)
	{
		var bg = $("<div id='popup_background'></div>").appendTo("body");
		var elem = $("<div id='popup_box' class='box'></div>").append(
			$("<div class='box_title'><span>"+title+"</span></div>")
		).append(
			$("<div class='box_content'></div>").append(content)
		).appendTo("body");

		elem.css({"margin-left": (elem.width()+2)/-2, "margin-top": (elem.height()+2)/-2});

		return {"element": elem, "background": bg, "inner": elem.children(".box_content")};
	};
	this.alert = function(title, message)
	{
		var bg = $("<div id='popup_background'></div>").appendTo("body");
		var elem = $("<div id='popup_box' class='box'></div>").append(
			$("<div class='box_title'><span>"+title+"</span></div>")
		).append(
			$("<div class='box_content'></div>")
				.append(message)
				.append(
					$("<div style='text-align:right;margin-top:10px'></div>").append(
						$("<button class='button positive' style='margin-right:5px'>Schließen</button>").click(function()
						{
							elem.remove();
							bg.remove();
						})
					)
				)
		).appendTo("body");

		elem.css({"margin-left": (elem.width()+2)/-2, "margin-top": (elem.height()+2)/-2});

		return {"element": elem, "background": bg, "inner": elem.children(".box_content")};
	};
	this.confirm = function(title, message, callback)
	{
		var bg = $("<div id='popup_background'></div>").appendTo("body");
		var elem = $("<div id='popup_box' class='box'></div>").append(
			$("<div class='box_title'><span>"+title+"</span></div>")
		).append(
			$("<div class='box_content'></div>").append(
					message
				).append(
				$("<div style='text-align:right;margin-top:10px'></div>").append(
					$("<button class='button positive' style='margin-right:5px'>Ja</button>").click(function()
					{
						callback(true);
						elem.remove();
						bg.remove();
					})
				).append(
					$("<button class='button negative'>Abbrechen</button>").click(function()
					{
						callback(false);
						elem.remove();
						bg.remove();
					})
				)
			)
		).appendTo("body");

		elem.css({"margin-left": (elem.width()+2)/-2, "margin-top": (elem.height()+2)/-2});

		return {"element": elem, "background": bg, "inner": elem.children(".box_content")};
	};

	/**** cookies ****/
	this.setCookie = function(name, value, daysToLive)
	{
		var cookie = name + "=" + encodeURIComponent(value);
		if (typeof daysToLive === "number")
		{
			cookie += "; max-age=" + (daysToLive*60*60*24);
		}
		document.cookie = cookie;
	}
	this.getCookie = function(name)
	{
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2)
		{
			return parts.pop().split(";").shift();
		}
	}

	/**** MD5 ****/
	this.MD5 = function (string)
	{
		function RotateLeft(lValue, iShiftBits)
		{
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		}

		function AddUnsigned(lX,lY)
		{
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4)
			{
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4)
			{
				if (lResult & 0x40000000)
				{
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				}
				else
				{
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			}
			else
			{
				return (lResult ^ lX8 ^ lY8);
			}
		}

		function F(x,y,z) { return (x & y) | ((~x) & z); }
		function G(x,y,z) { return (x & z) | (y & (~z)); }
		function H(x,y,z) { return (x ^ y ^ z); }
		function I(x,y,z) { return (y ^ (x | (~z))); }

		function FF(a,b,c,d,x,s,ac)
		{
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function GG(a,b,c,d,x,s,ac)
		{
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function HH(a,b,c,d,x,s,ac)
		{
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function II(a,b,c,d,x,s,ac)
		{
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

		function ConvertToWordArray(string)
		{
			var lWordCount;
			var lMessageLength = string.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength )
			{
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};

		function WordToHex(lValue)
		{
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++)
			{
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};

		function Utf8Encode(string)
		{
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++)
			{
				var c = string.charCodeAt(n);

				if (c < 128)
				{
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048))
				{
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else
				{
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}

			return utftext;
		};

		var x=Array();
		var k,AA,BB,CC,DD,a,b,c,d;
		var S11=7, S12=12, S13=17, S14=22;
		var S21=5, S22=9 , S23=14, S24=20;
		var S31=4, S32=11, S33=16, S34=23;
		var S41=6, S42=10, S43=15, S44=21;

		string = Utf8Encode(string);

		x = ConvertToWordArray(string);

		a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

		for (k=0;k<x.length;k+=16)
		{
			AA=a; BB=b; CC=c; DD=d;
			a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
			d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
			c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
			b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
			a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
			d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
			c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
			b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
			a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
			d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
			c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
			b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
			a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
			d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
			c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
			b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
			a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
			d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
			c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
			b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
			a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
			d=GG(d,a,b,c,x[k+10],S22,0x2441453);
			c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
			b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
			a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
			d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
			c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
			b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
			a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
			d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
			c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
			b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
			a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
			d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
			c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
			b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
			a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
			d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
			c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
			b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
			a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
			d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
			c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
			b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
			a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
			d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
			c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
			b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
			a=II(a,b,c,d,x[k+0], S41,0xF4292244);
			d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
			c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
			b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
			a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
			d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
			c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
			b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
			a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
			d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
			c=II(c,d,a,b,x[k+6], S43,0xA3014314);
			b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
			a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
			d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
			c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
			b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
			a=AddUnsigned(a,AA);
			b=AddUnsigned(b,BB);
			c=AddUnsigned(c,CC);
			d=AddUnsigned(d,DD);
		}

		var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

		return temp.toLowerCase();
	}

	/**** include bc_graphics ****/
	this.graphics = new BC_graphics();
}

BC_graphics = function()
{
	this.pieChart = function(canvas, values, width, x, y)
	{
		var colors = ["#00aaff", "#FF1930", "#FF8D00", "#CCC614", "#3D4A99", "#B26300", "#0088CC", "#FF8E40", "CC4514"];

		var radius = width/2 - 20;

		var total = 0, count = 0;
		for (index in values)
		{
			value = values[index];
			total += value;
			count++;
		}

		var start = 0, i = 0, first = false;
		for (index in values)
		{
			title = index;
			value = values[index];
			percent = value / total;

			if (!first) first = {"title": title, "value": Math.round(percent*100)+"%"};

			degrees = Math.round(360*percent);

			canvas.drawPath({
				layer: true,
				groups: ["piechart"],
				fillStyle: colors[i],
				title: title,
				value: Math.round(percent*100)+"%",
				closed: true,
				p1: {
					type: "arc",
					x: x+radius+20, y: y+radius+20,
					radius: (i == 0 ? radius+10 : radius),
					start: start, end: (i+1 < count ? start+degrees : 360)
				},
				p2: {
					type: "arc",
					x: x+radius+20, y: y+radius+20,
					radius: radius - 30,
					start: (i+1 < count ? start+degrees : 360), end: start,
					ccw: true
				},
				mouseover: function(layer)
				{
					group = canvas.getLayerGroup("piechart");
					for (i=0; i<group.length; i++)
					{
						group[i].p1.radius = radius;
					}

					layer.p1.radius = radius + 10;

					canvas.getLayer("percent").text = layer.value;
					canvas.getLayer("title").text = layer.title;

					canvas.setLayerGroup("piechart_inner", { fillStyle: layer.fillStyle });
				}
			});
			start += degrees;
			i++;
		}

		canvas.drawText({
			layer: true,
			name: "percent",
			groups: ["piechart_inner"],
			fillStyle: colors[0],
			x: x+radius+20, y: y+radius +30,
			fontSize: 40,
			fontFamily: "Arial",
			fontStyle: "bold",
			baseline: "bottom",
			text: ""+first.value
		});

		canvas.drawText({
			layer: true,
			name: "title",
			groups: ["piechart_inner"],
			fillStyle: colors[0],
			x: x+radius+20, y: y+radius +30,
			fontSize: 22,
			fontFamily: "Arial",
			baseline: "top",
			text: ""+first.title
		});
	};

	this.lineGraph = function(canvas, values, labels, width, height, x, y)
	{
		var max = 0, count = 0;

		for (index in values)
		{
			value = values[index];
			max = Math.max(max, value);
			count++;
		}

		// settings
		var padding_y = 20;
		var padding_x = 30;

		// calculate scale
		if (max <= 1)
		{
			scale_max = 1;
			scale = new Array(0, "", "", "", "", 1);
		}
		else
		{
			scale_max = 5;
			for (i=5; true; i*=2)
			{
				if (i > max)
				{
					scale_max = i;
					break;
				}
			}
			scale = new Array(0, scale_max/5*1, scale_max/5*2, scale_max/5*3, scale_max/5*4, scale_max/5*5);
		}

		// draw x-axis
		canvas.drawLine({
			layer: true,
			strokeStyle: "#ccc",
			strokeWidth: 2,
			rounded: true,
			x1: x+padding_x, y1: y+height-padding_y,
			x2: x+width-padding_x+15, y2: y+height-padding_y
		});

		//--> arrow
		canvas.drawLine({
			layer: true,
			strokeStyle: "#ccc",
			strokeWidth: 2,
			rounded: true,
			x1: x+width-padding_x+10, y1: y+height-padding_y-4,
			x2: x+width-padding_x+15, y2: y+height-padding_y,
			x3: x+width-padding_x+10, y3: y+height-padding_y+4,
		});

		var i = 0;
		for (index in labels)
		{
			i++;
			var label = labels[index];
			var point_x = x + (i-1) * ((width-2*padding_x)/(count-1)) + padding_x;
			var point_y = y + height - padding_y;

			canvas.drawLine({
				layer: true,
				strokeStyle: "#ccc",
				strokeWidth: 2,
				x1: point_x, y1: point_y,
				x2: point_x, y2: point_y+10
			});

			canvas.drawText({
				layer: true,
				groups: ["xScale_numbers"],
				fillStyle: "#ccc",
				x: point_x, y: point_y+10,
				fontSize: 12,
				fontFamily: "Arial",
				text: ""+label,
				align: "center",
				baseline: "top"
			});
		}

		// draw help lines
		for (i=1; i<scale.length; i++)
		{
			var point_x = x + padding_x;
			var point_y = y + height - padding_y - (i/5*(height-padding_y*2));

			canvas.drawLine({
				layer: true,
				groups: ["helplines"],
				strokeStyle: "#f4f4f4",
				strokeWidth: 2,
				x1: point_x, y1: point_y,
				x2: point_x+width-padding_x*2, y2: point_y
			});
		}

		// draw y-axis
		canvas.drawLine({
			layer: true,
			strokeStyle: "#ccc",
			strokeWidth: 2,
			rounded: true,
			x1: x+padding_x, y1: y+height-padding_y,
			x2: x+padding_x, y2: y+padding_y-15
		});

		//--> arrow
		canvas.drawLine({
			layer: true,
			strokeStyle: "#ccc",
			strokeWidth: 2,
			rounded: true,
			x1: x+padding_x+4, y1: y+padding_y-10,
			x2: x+padding_x, y2: y+padding_y-15,
			x3: x+padding_x-4, y3: y+padding_y-10,
		});

		// draw scale
		var i=0;
		for (i=0; i<scale.length; i++)
		{
			label = scale[i];
			if (label >= 1000)
			{
				label = (label/1000) + "k";
			}
			var point_x = x + padding_x;
			var point_y = y + height - padding_y - (i/5*(height-padding_y*2));

			canvas.drawLine({
				layer: true,
				groups: ["yScale"],
				strokeStyle: "#ccc",
				strokeWidth: 2,
				x1: point_x, y1: point_y,
				x2: point_x-10, y2: point_y
			});

			canvas.drawText({
				layer: true,
				groups: ["yScale_numbers"],
				fillStyle: "#ccc",
				x: point_x-17, y: point_y,
				fontSize: 12,
				fontFamily: "Arial",
				text: ""+label,
				align: "right",
				baseline: "middle"
			});
		}

		// draw line
		var i = 0;
		lines = {};
		for (index in values)
		{
			i++;
			var value = values[index];
			if (value == null) { value = 0; }

			var point_x = x + (i-1) * ((width-2*padding_x)/(count-1)) + padding_x;
			var point_y = y + (height-2*padding_y) - (value/scale_max) * (height-2*padding_y) + padding_y   - 1;

			lines["x"+i] = point_x;
			lines["y"+i] = point_y ;
		}

		canvas.drawLine($.extend({
			layer: true,
			strokeStyle: "#0af",
			strokeWidth: 3,
			rounded: true
		}, lines));

		/* draw info tooltip */
		canvas.drawRect({
			layer: true,
			name: "info",
			visible: false,
			fromCenter: false,
			fillStyle: "#fff",
			strokeStyle: "#eee",
			opacity: 0.9,
			x: 0, y: 0,
			width: 80,
			height: 30
		});
		canvas.drawText({
			layer: true,
			name: "info_text",
			visible: false,
			fillStyle: "#0af",
			x: 0, y: 0,
			fontSize: 16,
			fontFamily: "Arial",
			strokeWidth: 2,
			text: "0",
			align: "left",
			baseline: "middle"
		});

		i = 0;
		for (index in values)
		{
			i++;
			var value = values[index];
			if (value == null) { value = 0; }

			var point_x = x + (i-1) * ((width-2*padding_x)/(count-1)) + padding_x;
			var point_y = y + (height-2*padding_y) - (value/scale_max) * (height-2*padding_y) + padding_y   - 1;

			canvas.drawArc({
				layer: true,
				name: "point_"+i,
				fillStyle: "#fff",
				strokeStyle: "#0af",
				strokeWidth: 3,
				x: point_x, y: point_y,
				radius: 5,
				value: value,
				visible: false
			});

			canvas.drawRect({
				layer: true,
				fromCenter: false,
				x: point_x - ((width-2*padding_x)/(count-1))/2, y: y+padding_y-10,
				width: ((width-2*padding_x)/(count-1)),
				height: (height-2*padding_y) + 20,
				id: i,
				value: value,
				mouseover: function(layer)
				{
					point = canvas.getLayer("point_"+layer.id);

					value = layer.value;

					canvas.setLayer("point_"+layer.id, {
						visible: true
					});
					canvas.setLayer("info_text", {
						x: point.x + 20, y: point.y,
						text: value,
						visible: true
					});
					canvas.setLayer("info", {
						x: point.x - 15, y: point.y - canvas.getLayer("info").height/2,
						//width: canvas.measureText("info_text").width + 20
						visible: true
					});

					canvas.drawLayers();
				},
				mouseout: function(layer)
				{
					canvas.setLayer("point_"+layer.id, {
						visible: false
					});
					canvas.setLayer("info_text", {
						visible: false
					});
					canvas.setLayer("info", {
						visible: false
					});
				}
			});
		}
	};

	// under construction
	this.barChart = function(context, values, width, height, x, y)
	{
		var max = 0, count = 0;
		for (index in values)
		{
			value = values[index];
			max = Math.max(max, value);
			count++;
		}

		console.log(max);

		var i = 0;
		for (index in values)
		{
			value = values[index];
			console.log(index+": "+value);
			percent = value / max;

			h = Math.round(height*percent);
			w = Math.round(width/count);

			context.save();

			// -- blue font
			context.font = '16px arial';
			context.textAlign = 'center';
			context.textBaseline = 'bottom';
			context.fillStyle = "#0af";
			context.fillText(index, x + i*w+w/2, y + height);
			// --

			context.beginPath();
			context.rect(x + i*w+1, y + height-h, w-2, h);
			context.closePath();
			context.fillStyle = "#0af";
			context.fill();

			context.clip();

			// -- white font on the bars
			context.font = '16px arial';
			context.textAlign = 'center';
			context.textBaseline = 'bottom';
			context.fillStyle = "#fff";
			context.fillText(index, x + i*w+w/2, y + height);
			// --

			context.restore();

			i++;
		}
	};
}

bc = new BrainContent();
