import React, { useEffect, useRef } from "react";
let lines = []; // 保存所有线路数据：{ points, color, name }

//==============================
// 1) 计算点到线段的最小距离
//==============================
function distancePointToSegment(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const wx = px - x1;
    const wy = py - y1;
    const segLen2 = vx * vx + vy * vy;
    if (segLen2 < 1e-10) {
        const dx = px - x1;
        const dy = py - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / segLen2));
    const projX = x1 + t * vx;
    const projY = y1 + t * vy;
    const dx = px - projX;
    const dy = py - projY;
    return Math.sqrt(dx * dx + dy * dy);
}

//==============================
// 2) 将原始点缩放到画布坐标
//==============================
function trackScale(points, canvasWidth, canvasHeight) {
    const beijing_west_most = 115.9408604;
    const beijing_east_most = 116.7720000;
    const beijing_north_most = 40.2700000;
    const beijing_south_most = 39.4668447;
    for (let i = 0; i < points.length; i++) {
        const px =
            ((points[i].lon - beijing_west_most) /
                (beijing_east_most - beijing_west_most)) *
            canvasWidth;
        const py =
            ((beijing_north_most - points[i].lat) /
                (beijing_north_most - beijing_south_most)) *
            canvasHeight;
        points[i].x = px;
        points[i].y = py;
    }
    return points;
}

//==============================
// 3) 加载一条线路数据，不直接绘制
//==============================
async function loadLine(url, lineName, color, info, canvasWidth, canvasHeight) {
    const response = await fetch(url);
    const gpxText = await response.text();
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(gpxText, "text/xml");
    const trkpts = gpxDoc.getElementsByTagName("trkpt");
    let points = [];
    for (let j = 0; j < trkpts.length; j++) {
        const trkpt = trkpts[j];
        const lat = parseFloat(trkpt.getAttribute("lat"));
        const lon = parseFloat(trkpt.getAttribute("lon"));
        points.push({ lat, lon });
    }
    points = trackScale(points, canvasWidth, canvasHeight);
    return { points, color, name: lineName, info: info };
}

//==============================
// 4) 根据当前状态重绘所有线路
//==============================
function redrawAllLines(canvas, highlightIndex, highlightColor) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line, index) => {
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        for (let k = 1; k < line.points.length; k++) {
            ctx.lineTo(line.points[k].x, line.points[k].y);
        }
        if (index === highlightIndex) {
            ctx.strokeStyle = highlightColor || line.color;
            ctx.lineWidth = 4;
        } else {
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 2;
        }
        ctx.stroke();
    });
}

//==============================
// 5) React 组件
//==============================
function GPXView({
    hoverTolerance = 5,
    currentLine,
    setCurrentLine,
    setCurrentLineName,
    currentLineColor,
    setCurrentLineColor,
    setCurrentLineInfo,
    year,
    setYearInfo }) {

    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // 加载所有线路
        const fetchAllLines = async () => {
            lines = [];

            const url = `/info/${year}.json`;
            const response = await fetch(url);
            const jsonText = await response.text();
            const lineData = JSON.parse(jsonText);

            for (let i = 0; i < lineData.length; i++) {
                if (lineData[i].lineName === undefined) {
                    setYearInfo(lineData[i].info);
                    continue;
                }
                const id = lineData[i].id;
                const lineName = lineData[i].lineName;
                const gpxUrl = lineData[i].gpxTrackFile;
                const color = lineData[i].color;
                const info = lineData[i].info;
                try {
                    const lineData = await loadLine(gpxUrl, lineName, color, info, canvasWidth, canvasHeight);
                    lines[id] = lineData;
                } catch (err) {
                    console.error("读取 gpx 文件失败:", err);
                }
            }
            redrawAllLines(canvas, currentLine, currentLineColor);
            if (currentLine !== -1) {
                setCurrentLineInfo(lines[currentLine].info);
            }
        };

        fetchAllLines();

        // 鼠标移动事件：保留原有的光标位置计算方法
        const handleMouseMove = (e) => {
            // 保留原有计算方式
            const mouseX = 4000 * e.clientX / window.innerWidth;
            const mouseY = 2000 / 0.96633 * e.clientY / window.innerHeight;

            let hoveredLineIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i] === undefined) {
                    continue;
                }
                const points = lines[i].points;
                for (let j = 0; j < points.length - 1; j++) {
                    const dist = distancePointToSegment(
                        mouseX,
                        mouseY,
                        points[j].x,
                        points[j].y,
                        points[j + 1].x,
                        points[j + 1].y
                    );
                    if (dist <= hoverTolerance) {
                        hoveredLineIndex = i;
                        break;
                    }
                }
                if (hoveredLineIndex !== -1) break;
            }
            if (hoveredLineIndex !== -1) {
                setCurrentLine(hoveredLineIndex);
                setCurrentLineName(lines[hoveredLineIndex].name)
                setCurrentLineColor(lines[hoveredLineIndex].color);
                setCurrentLineInfo(lines[hoveredLineIndex].info);
            }
            redrawAllLines(canvas, hoveredLineIndex, currentLineColor);
        };

        canvas.addEventListener("mousemove", handleMouseMove);
        return () => {
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [hoverTolerance, year, currentLine, currentLineColor]);

    return (
            <canvas
                ref={canvasRef}
                id="map"
                width={2000}
                height={2000 / 0.96633}
                style={{ border: "1px solid #ccc" }}
            ></canvas>
    );
}

export default GPXView;
