//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var zx = 20;
        var zy = 20;
        var cellSize = 20;
        var cellN = 9;
        var fullSizeN = [2 * zx + cellSize * (cellN + 1), 2 * zy + cellSize * (cellN + 1)];

        var colorDark = "#294270";
        var colorOrange = "#F0801A";
        var colorBlue = "#6BA3CF";
        var colorWhite = "#FFFFFF";
        var attrAxis = {"stroke": colorDark, "stroke-width": 2, "arrow-end": "classic"};
        var attrEdge = {"stroke": colorDark, "stroke-width": 2, "stroke-linecap": "round"};
        var attrInnerLine = {"stroke": colorBlue, "stroke-width": 1, "stroke-dasharray": ["-"]};
        var attrText = {"font-family": "Verdana", "font-size": 14, "stroke": colorDark};
        var attrPointText = {"font-family": "Verdana", "font-size": 14, "stroke": colorBlue, "fill": colorDark, "opacity": 0};
        var attrPoint = {"stroke": colorOrange, "fill": colorOrange, "r": cellSize / 4};

        var delay = 200;

        function createPath(x1, y1, x2, y2) {
            return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
        }

        function createPathLineOnPlane(x1, y1, x2, y2) {
            return createPath(
                x1 * cellSize + zx, fullSizeN[1] - zy - cellSize * y1, x2 * cellSize + zx, fullSizeN[1] - zy - cellSize * y2
            )
        }

        function createPointOnPlane(paper, i, x, y) {
            var pointText = paper.text(x * cellSize + zx * 1.7, fullSizeN[1] - zy - cellSize * y, String(i)).attr(attrPointText);
            var point = paper.circle(x * cellSize + zx, fullSizeN[1] - zy - cellSize * y, 1).attr(attrPoint);
            point.mouseover(function() {
                  pointText.attr("opacity", 1);
            });
            point.mouseout(function() {
                pointText.attr("opacity", 0);
            });

            return paper.set(point, pointText);

        }

        function createPlane(paper) {
            for (var i = 1; i <= cellN; i++) {
                paper.path(createPath(
                    zx, fullSizeN[1] - zy - i * cellSize,
                    zx + cellN * cellSize + zx / 2, fullSizeN[1] - zy - i * cellSize)
                ).attr(attrInnerLine);

                paper.path(createPath(
                    zx + i * cellSize, fullSizeN[1] - zy,
                    zx + i * cellSize, fullSizeN[1] - zy - cellN * cellSize - zy / 2)
                ).attr(attrInnerLine);
                paper.text(zx + i * cellSize, fullSizeN[1] - zy / 2, String(i)).attr(attrText);
                paper.text(zx / 2, fullSizeN[1] - zy - i * cellSize, String(i)).attr(attrText);
            }

            paper.path(createPath(zx, fullSizeN[1] - zy / 2, zx, zy / 2)).attr(attrAxis);
            paper.text(zx / 2, zy / 2, "Y").attr(attrText);
            paper.path(createPath(zx / 2, fullSizeN[1] - zy, fullSizeN[0] - zx / 2, fullSizeN[1] - zy)).attr(attrAxis);
            paper.text(fullSizeN[0] - zx / 2, fullSizeN[1] - zy / 2, "X").attr(attrText);
            paper.text(zx / 2, fullSizeN[1] - zy / 2, "0").attr(attrText);


        }



        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            //animation
            //plane
            var canvas = Raphael($content.find(".explanation")[0], fullSizeN[0], fullSizeN[1], 0, 0);
            createPlane(canvas);
            //points
            var pointSet = canvas.set();
            var edgeSet = canvas.set();
            for (var p = 0; p < checkioInput.length; p++) {
                pointSet.push(createPointOnPlane(canvas, p, checkioInput[p][0], checkioInput[p][1]));

            }
            var route = rightResult.slice(0);
            route.push(route[0]);
            for (var i = 0; i < route.length - 1; i++){
                setTimeout(function(){
                    var from = route[i];
                    var to = route[i + 1];
                    var line = canvas.path(createPathLineOnPlane(
                        checkioInput[from][0], checkioInput[from][1],
                        checkioInput[from][0], checkioInput[from][1])).attr(attrEdge);
                    edgeSet.push(line);
                    return function(){
                        line.animate({"path": createPathLineOnPlane(
                            checkioInput[from][0], checkioInput[from][1],
                            checkioInput[to][0], checkioInput[to][1])}, delay);

                    }

                }(), delay * i)
            }
            pointSet.insertAfter(edgeSet);


            this_e.setAnimationHeight($content.height() + 60);

        });

        var $tryit;
        var tCanvas;
        var tPointSet;
        var tPoints = [];
        var tEdgeSet;

        function isInteger(n) {
            return !isNaN(Number(n)) && isFinite(n) && n === Math.floor(n);
        }

        ext.set_console_process_ret(function (this_e, ret) {
            $tryit.find(".checkio-result-in").html(ret);
            ret = ext.JSON.decode(ret);
            if (ret && typeof object && ret.length) {
                for (var i = 0; i < ret.length; i++) {
                    var j = (i+1 < ret.length) ? i+1 : 0;
                    if (!isInteger(ret[i]) || ret[i] < 0 || ret[i] >= tPoints.length) {
                        break;
                    }
                    if (!isInteger(ret[j]) || ret[j] < 0 || ret[j] >= tPoints.length) {
                        break;
                    }
                    setTimeout(function () {
                        var from = ret[i];
                        var to = ret[j];
                        var line = tCanvas.path(createPathLineOnPlane(
                            tPoints[from][0], tPoints[from][1],
                            tPoints[from][0], tPoints[from][1])).attr(attrEdge);
                       tEdgeSet.push(line);
                        return function () {
                            line.animate({"path": createPathLineOnPlane(
                                tPoints[from][0], tPoints[from][1],
                                tPoints[to][0], tPoints[to][1])}, delay);
                        }
                    }(), delay * i);
                    tPointSet.insertAfter(tEdgeSet);
                }
            }
        });

        ext.set_generate_animation_panel(function (this_e) {
            $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));

            tCanvas = Raphael($tryit.find(".tryit-canvas")[0], fullSizeN[0], fullSizeN[1], 0, 0);
            tPointSet = tCanvas.set();
            tEdgeSet = tCanvas.set();
            $tryit.find(".tryit-canvas").width(fullSizeN[0]);
//            $tryit.find(".tool .btn:parent").height(fullSizeN[1] / 6);
//            $tryit.find(".tool .bn-reset").css("margin-top", cellSize);

            createPlane(tCanvas);
            var activeRect = tCanvas.rect(zx + 0.5 * cellSize, fullSizeN[1] - zy - cellSize * (cellN + 0.5),
                cellN * cellSize, cellN * cellSize).attr({"fill": colorWhite, "opacity": 0});
            activeRect.click(function (e) {
                tEdgeSet.remove();
                tEdgeSet = tCanvas.set();
                var x = Math.round(((e.offsetX || e.layerX) - zx) / cellSize);
                var y = Math.round((fullSizeN[1] - (e.offsetY || e.layerY) - zy) / cellSize);
                for (var i = 0; i < tPoints.length; i++) {
                    if (String([x, y]) == String(tPoints[i])) {
                        break;
                    }
                }
                if (i === tPoints.length) {
                    tPoints.push([x, y]);
                    tPointSet.push(createPointOnPlane(tCanvas, tPointSet.length, x, y));
                }
            });

            $tryit.find(".bn-reset").click(function (e) {
                tPointSet.remove();
                tPointSet = tCanvas.set();
                tPoints = [];
                tEdgeSet.remove();
                tEdgeSet = tCanvas.set();
                return false;
            });
            $tryit.find('.bn-check').click(function (e) {
                tEdgeSet.remove();
                tEdgeSet = tCanvas.set();
                this_e.sendToConsoleCheckiO(tPoints);
                e.stopPropagation();
                return false;
            });

        });

        var colorOrange4 = "#F0801A";
        var colorOrange3 = "#FA8F00";
        var colorOrange2 = "#FAA600";
        var colorOrange1 = "#FABA00";

        var colorBlue4 = "#294270";
        var colorBlue3 = "#006CA9";
        var colorBlue2 = "#65A1CF";
        var colorBlue1 = "#8FC7ED";

        var colorGrey4 = "#737370";
        var colorGrey3 = "#9D9E9E";
        var colorGrey2 = "#C5C6C6";
        var colorGrey1 = "#EBEDED";

        var colorWhite = "#FFFFFF";
        //Your Additional functions or objects inside scope
        //
        //
        //


    }
);
