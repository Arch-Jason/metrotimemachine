import { Analytics } from "@vercel/analytics/react";
import "./App.css"
import React, { useState } from "react";
import GPXView from "./GPXView";
import RightColumn from "./RightColumn";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [currentLine, setCurrentLine] = useState(-1);
  const [currentLineName, setCurrentLineName] = useState("");
  const [currentLineColor, setCurrentLineColor] = useState("");
  const [currentLineInfo, setCurrentLineInfo] = useState("");
  const [year, setYear] = useState(2009);
  const [yearInfo, setYearInfo] = useState("")

  return (
    <div className="App">
      <Analytics/>
      <div id="container">
        <GPXView
          currentLine={currentLine}
          setCurrentLine={setCurrentLine}
          currentLineName={currentLineName}
          setCurrentLineName={setCurrentLineName}
          currentLineColor={currentLineColor}
          setCurrentLineColor={setCurrentLineColor}
          setCurrentLineInfo={setCurrentLineInfo}
          setYearInfo={setYearInfo}
          year={year}
        />
        <RightColumn
          year={year}
          setYear={setYear}
          currentLine={currentLineName}
          currentLineColor={currentLineColor}
          info={currentLineInfo}
          yearInfo={yearInfo}
        />
      </div>
    </div>
  );
}

export default App;
