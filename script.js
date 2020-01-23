var spinning;
function resetSpin()
{
	clearInterval(spinning);
	$("#loading_box").stop().css({
		textIndent: 0,
		"transform": "rotateZ(45deg)",
		"-webkit-transform": "rotateZ(45deg)",
		"-moz-transform": "rotateZ(45deg)",
		"-o-transform": "rotateZ(45deg)",
		"-ms-transform": "rotateZ(45deg)"
	});
}
function spin()
{
	$("#loading_box").animate({textIndent: "+=180"}, {
		step: function(now,fx) {
			$(this).css("transform","rotateZ("+(now+45)+"deg)");
			$(this).css("-webkit-transform","rotateZ("+(now+45)+"deg)");
			$(this).css("-moz-transform","rotateZ("+(now+45)+"deg)");
			$(this).css("-o-transform","rotateZ("+(now+45)+"deg)");
			$(this).css("-ms-transform","rotateZ("+(now+45)+"deg)");
		},
		duration: 1000
	}, "easeOutQuart");
}
function startSpin()
{
	spin();
	spinning = setInterval(function() { spin(); }, 2000);
}

var pos = 1;
var imagecount = 0;
var moving = false;
function openProject(id)
{
	resetSpin();
	$("body").addClass("loading");
	startSpin();
	t_start = new Date().getTime();

	$.ajax({
		"url": "load_project.php",
		"data": {"id": id},
		"method": "POST",
		"success": function(data)
		{
			if (data != "error")
			{
				data = $.parseJSON(data);
				images = data.images;
				$("#imageviewer_images").html("");
				$("#imageviewer_nav").html("");
				$(".imageviewer_text").html(data.name +" &ndash; "+ data.description);
				var loadedimages = 0;
				var totalimages = images.length;
				for (i = 0; i<images.length; i++)
				{
					image = images[i];
					$("#imageviewer_images").append(
						$("<img class='image' data-id='"+(i+1)+"' src='images/"+image.src+"'>").load(function()
						{
							loadedimages++;
							if (loadedimages == totalimages)
							{
								$("#imageviewer").fadeIn(0);
								updateImageSize();
								t_now = new Date().getTime();
								if (t_now - t_start > 1000)
								{
									$("body").removeClass("loading").css("overflow", "hidden");
								}
								else
								{
									setTimeout(function()
									{
										$("body").removeClass("loading").css("overflow", "hidden");
									}, 1000 - (t_now - t_start))
								}
							}
						})
					);
					$("#imageviewer_nav").append(
						$("<div class='nav' target-id='"+(i+1)+"'></div>").click(function()
						{
							pos = $(this).attr("target-id");
							jumpTo(pos);
						})
					);
				}



				// erstes Bild
				pos = 1;
				imagecount = images.length;
				$("#imageviewer_nav .nav:nth-child("+pos+")").addClass("active");
				$("#imageviewer_images .image:nth-child("+pos+")").css("left", "0px").addClass("active");
			}
			else
			{
				alert("fehler");
				t_now = new Date().getTime();
				if (t_now - t_start > 1000)
				{
					$("body").removeClass("loading").css("overflow", "hidden");
					closeProject();
				}
				else
				{
					setTimeout(function()
					{
						$("body").removeClass("loading").css("overflow", "hidden");
						closeProject();
					}, 1000 - (t_now - t_start))
				}
			}
		}
	});
}

/* NAV POINTS */
function jumpTo(id)
{
	if (moving == false)
	{
		moving = true;

		// nav punkt
		$("#imageviewer .nav").removeClass("active");
		$("#imageviewer .nav[target-id="+id+"]").addClass("active");

		// bild
		$("#imageviewer .image").removeClass("active");
		$("#imageviewer .image[data-id="+id+"]").addClass("active").animate({"left":"0px"}, 1500, "easeInOutQuint", function()
		{
			$("#imageviewer .image").not(this).removeClass("active").css("left", $(this).width());
			moving = false;
		});
	}
}
/* /NAV POINTS */

function updateImageSize()
{
	wrapper_width = Math.round(window.innerWidth*0.8);
	wrapper_height = window.innerHeight - 200;
	org_width = 2000;
	org_height = 857;
	wrapper_ratio = wrapper_width / wrapper_height;
	org_ratio = org_width / org_height;

	if (wrapper_ratio > org_ratio)
	{
		$("#imageviewer_images .image").height(wrapper_height).width("auto");
	}
	else
	{
		$("#imageviewer_images .image").height("auto").width(wrapper_width);
	}
	_height = $("#imageviewer_images .image").height();
	_width = $("#imageviewer_images .image").width();

	$("#imageviewer_images .image").not(".active").css("left", _width);

	$("#imageviewer_middle").height(_height).width(_width);
	$("#imageviewer_images").height(_height).width(_width);
	$("#imageviewer_actions").height(_height).width(_width);

	$("#imageviewer_top, #imageviewer_bottom").height((window.innerHeight-_height)/2).width(_width);
}

$(document).ready(function()
{
	/* spinin'*/
	startSpin();

	/* LOADING */
	$(window).load(function()
	{
		updateCover();
		if (start == "home")
		{
			$("body").removeClass("loading");
		}
	});
	/* /LOADING */


	$(window).scroll(function()
	{
		/* PFEIL */
		if ($(window).scrollTop() <= 0)
		{
			$("#header #pointer").fadeIn(500);
		}
		else
		{
			$("#header #pointer").fadeOut(500);
		}
		/* /PFEIL */

		/* START PARALLAX */
		if ($(window).scrollTop() < window.innerHeight)
		{
			var precent = Math.min(1, $(window).scrollTop() / window.innerHeight);
			$("#content #header #header_parallax").css("top", (precent * -15)+"%");
			$("#content #header #header_parallax #header_text").css("opacity", Math.max(1-precent*2, 0));
		}
		/* /START PARALLAX */
	});
	// $openNav(function() {
	// 	document.getElementById("mySidenav").style.width = "250px";
	// });
	
	// $closeNav(function() {
	// 	document.getElementById("mySidenav").style.width = "0";
	// });

	/* PFEIL CLICKEVENT */
	$("#header #pointer").click(function()
	{
		$("html, body").animate({scrollTop: window.innerHeight}, 700);

	});
	/* /PFEIL CLICKEVENT */

	/* PROJECT �FFNEN */
	$("#projects .project").click(function()
	{
		var id = $(this).attr("data-id");
		var link = $(this).attr("data-link");
		window.history.pushState("project_"+id, "Project #"+id, "/"+link);
		openProject(id);
		return false;
	});
	$("#projects .project, #projects .placeholder").mousedown(function()
	{
		return false;
	});
	/* /PROJECT �FFNEN */

	/* */
	$("#imageviewer #imageviewer_actions .next").click(function()
	{
		if (moving == false)
		{
			if (pos < imagecount)
			{
				pos++;
			}
			else
			{
				pos = 1;
			}
			jumpTo(pos);
		}
	});
	$("#imageviewer #imageviewer_actions .prev").click(function()
	{
		if (moving == false)
		{
			if (pos > 1)
			{
				pos--;
			}
			else
			{
				pos = imagecount;
			}
			jumpTo(pos);
		}
	});
	/* */

	/* UPDATE CONTENT */

	function updateProjects()
	{
		projectsWidth = $("#projects_inner").width();
		projectWidth = Math.floor(projectsWidth / 3);

		$("#content #projects #projects_inner .project").css("width", projectWidth - 40);
		$("#content #projects #projects_inner .placeholder").css("width", projectWidth - 40);
	};

	$(window).load(function()
	{
		updateProjects();
	});

	$(window).resize(function()
	{
		updateProjects();
	});
	/* /UPDATE CONTENT */

	/* UPDATE IMAGE */
	function updateCover()
	{
		about_width = $("#content #about_content").width();
		about_height = $("#content #about_content").height();
		about_ratio = about_width / about_height;

		wrapper_width = window.innerWidth;
		wrapper_height = window.innerHeight;
		wrapper_ratio = wrapper_width / wrapper_height;

		org_width = 1700;
		org_height = 1134;
		org_ratio = org_width / org_height;

		if (wrapper_ratio < org_ratio)
		{
			$("#content #header #header_parallax #header_background").height(wrapper_height).width("auto");
		}
		else
		{
			$("#content #header #header_parallax #header_background").height("auto").width(wrapper_width);
		}
		_height = $("#content #header #header_parallax #header_background").height();
		_width = $("#content #header #header_parallax #header_background").width();

		$("#content #header #header_parallax #header_background").css("margin-top", (_height - wrapper_height) / -2);
		$("#content #header #header_parallax #header_background").css("margin-left", (_width - wrapper_width) / -2);

		if (about_ratio < org_ratio)
		{
			$("#content #about_content #about_background").height(about_height).width("auto");
		}
		else
		{
			$("#content #about_content #about_background").height("auto").width(about_width);
		}
		_height = $("#content #about_content #about_background").height();
		_width = $("#content #about_content #about_background").width();

		$("#content #about_content #about_background").css("margin-top", _height/-2);
		$("#content #about_content #about_background").css("margin-left", _width/-2);
	}
	/* */

	$(window).resize(function()
	{
		updateImageSize();
		updateCover();
	});
	/* /UPDATE IMAGE */

	/* PROJECT CLOSE */
	$("#imageviewer #imageviewer_back").click(function()
	{
		window.history.pushState("start", "Let's Wander", "/");
		closeProject();
	})
	function closeProject()
	{
		$("#imageviewer_loading").fadeOut(0);
		$("#imageviewer").fadeOut(0);
		$("body").css("overflow", "auto");
		updateProjects();
	}
	/* /PROJECT CLOSE */

	/* -- HISTORY LISTENER -- */
	$(window).bind("popstate", function(e)
	{
		var state = e.originalEvent.state;
		if (state == null)
		{
			if (start == "home")
			{
				closeProject();
			}
			else
			{
				id = start.substr(8, start.length-8);
				openProject(id);
			}
		}
		else if (state == "start")
		{
			closeProject();
		}
		else if (state.indexOf("project_") == 0)
		{
			id = state.substr(8, state.length-8);
			openProject(id);
		}
	});
});
