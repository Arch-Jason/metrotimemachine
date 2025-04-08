import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

function RightColumn({ currentLine, currentLineColor, year, setYear, info, yearInfo}) {
    return (
        <div id="rightColumn">

            <h1 style={{fontWeight: "bold", margin: "1em"}}>北京地铁时光机</h1>

            <div id="rangeContainer">
                <InputGroup id="yearNum">
                    <InputGroup.Text>年份</InputGroup.Text>
                    <Form.Control
                        id="yearNumInput"
                        type="number"
                        defaultValue={year}
                        onChange={(e) => {
                            if (e.target.value >= 1971 && e.target.value <= 2025) {
                                setYear(e.target.value);
                            }
                        }}
                    />
                </InputGroup>
                
                <Form.Range
                    id="rangeSlider"
                    min={1971}
                    max={2025}
                    step={1}
                    value={year}
                    onChange={(e) => {
                        setYear(e.target.value);
                        document.getElementById("yearNumInput").value = e.target.value;
                    }}
                />
            </div>

            <div dangerouslySetInnerHTML={{ __html: yearInfo }} />

            <hr style={{width: "100%"}}/>

            <div id="rightColumnTitle">
                <svg viewBox="0 0 6 6" xmlns="http://www.w3.org/2000/svg"
                    width={50}
                    height={50}
                >
                    <circle cx="3" cy="3" r="3" fill={currentLineColor === "" ? "transparent" : currentLineColor} />
                </svg>

                <b
                    style={{fontSize: "2em", lineHeight: "3em"}}
                >
                    {currentLine}
                </b>
            </div>

            <div
                id="lineInfo"
                dangerouslySetInnerHTML={{ __html: info}}
            />

        </div>
    );
}

export default RightColumn;