

// import React, { useState, useRef, useEffect, } from "react";

// import { read, writeFileXLSX, utils } from "xlsx";
// import {
// 	Button,
// 	Divider,
// 	Row,
// 	Input,
// 	Col,
// 	notification
// } from "antd";
// import ExcelModule from "@/modules/ExcelModule";


// export default function SheetJS({ config }) {

// 	let { clear } = config
// 	const [data, setData] = React.useState([]);
// 	const [cols, setCols] = React.useState([]);
// 	const [wb, setWb] = useState({});



// 	const handleFile = (file) => {
// 		const reader = new FileReader();
// 		reader.onload = (e) => {
// 			/* Parse data */
// 			const ab = e.target.result;
// 			const wb = read(ab, { type: 'array' });
// 			/* Get first worksheet */
// 			setWb(wb)
// 			getExcelData(wb, 0)


// 		};
// 		reader.readAsArrayBuffer(file);


// 	}


// 	const getExcelData = (wb, i) => {
// 		const wsname = wb.SheetNames[i];
// 		const ws = wb.Sheets[wsname];
// 		let data = utils.sheet_to_json(ws, { header: 1 });

// 		let col = []
// 		if (data.length > 0) {
// 			col = make_cols(ws['!ref'])
// 		}

// 		col = data[0].map((d, index)=> {
// 			return  {
// 				name:col[index].name,
// 				key: col[index].key,
// 				dataIndex: d,



// 			}
// 		})

// 		console.log(col)
// 		
// 		col.unshift({ name: "No", key: 'No', dataIndex: 'No' })
// 		col = col.map((c, index) => {
// 			c.key = index

// 			return c
// 		})




// 		data = data.map((d, i) => {
// 			d.unshift(i)
// 			return d
// 		})




// 		setCols(col)
// 		setData(data.filter((d, i) => i!= 0));
// 	}

// 	const onChangeTab = (value) => {
// 		setData([])
// 		setCols([])
// 		let index = wb.SheetNames.findIndex(val => val == value)
// 		getExcelData(wb, index)
// 	}

// 	const exportFile = () => {
// 		/* convert state to workbook */
// 		const ws = utils.aoa_to_sheet(data);
// 		const wb = utils.book_new();
// 		utils.book_append_sheet(wb, ws, "SheetJS");
// 		writeFile(wb, "sheetjs.xlsx")
// 	};


// 	useEffect(() => {
// 		setData([])
// 		setCols([])
// 	}, [clear])

// 	return (
// 		<DragDropFile handleFile={handleFile}>
// 			<Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
// 				<Col span={6}>
// 					<DataInput handleFile={handleFile} clear={clear} />
// 				</Col>

// 				<Divider />
// 				<Col span={24}>
// 					<ExcelModule config={{
// 						wb: wb,
// 						scroll: { y: 'calc(100vh - 20.5em)', yScroll: true },
// 						className: "excel-table",
// 						dataTableColumns: cols,
// 						dataSource: data,
// 						onChangeTab: onChangeTab
// 					}}

// 					/>
// 					{/* <OutTable data={data} cols={cols} scroll={} className="excel-table"/> */}
// 				</Col>
// 			</Row>

// 		</DragDropFile>
// 	);

// }



// function DragDropFile({ handleFile, children }) {
// 	const suppress = (e) => { e.stopPropagation(); e.preventDefault(); };
// 	const handleDrop = (e) => {
// 		e.stopPropagation(); e.preventDefault();
// 		const files = e.dataTransfer.files;
// 		if (files && files[0]) handleFile(files[0]);
// 	};

// 	return (
// 		<div
// 			onDrop={handleDrop}
// 			onDragEnter={suppress}
// 			onDragOver={suppress}
// 		>
// 			{children}
// 		</div>
// 	);
// }

// /*
//   Simple HTML5 file input wrapper
//   usage: <DataInput handleFile={callback} />
// 	handleFile(file:File):void;
// */

// function DataInput({ handleFile, clear }) {

// 	const [value, setValue] = useState('')
// 	const handleChange = (e) => {
// 		const files = e.target.files;
// 		if(files[0].name.indexOf('xlsx') < 0) {
// 			notification.error({message: "Please choose .xlsx file!"})
// 			return 
// 		}

// 		setValue(files[0].filename)
// 		if (files && files[0]) handleFile(files[0]);
// 	};


// 	useEffect(() => {
// 		setValue('')
// 	}, [clear])

// 	return (
// 		<form className="form-inline">
// 			<div className="form-group">
// 				<Input
// 					type="file"
// 					className="form-control"
// 					id="file"
// 					value={value}
// 					accept={SheetJSFT}
// 					onChange={handleChange}
// 				/>
// 			</div>
// 		</form>
// 	)
// }



// /* list of supported file types */
// const SheetJSFT = [
// 	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
// ].map(x => `.${x}`).join(",");

// /* generate an array of column objects */
// const make_cols = refstr => {
// 	let o = [], C = utils.decode_range(refstr).e.c + 1;
// 	for (var i = 0; i < C; ++i) o[i] = { name: utils.encode_col(i), key: i }
// 	return o;
// };












import React, { useState, useRef, useEffect } from "react";
import { read, writeFileXLSX, utils } from "xlsx";
import {
	Input,
	Button
} from "antd";
import "@/style/partials/sheet.less"
import GC from '@grapecity/spread-sheets';
import '@grapecity/spread-sheets-charts';
import { SpreadSheets, Worksheet } from '@grapecity/spread-sheets-react';
import { IO } from "@grapecity/spread-excelio";
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css';
window.GC = GC;
export default function SheetJS({ config, exceData }) {

	let { clear } = config
	const [data, setData] = React.useState([]);
	const [cols, setCols] = React.useState([]);
	const [wb, setWb] = useState({});
	const [spread, setSpread] = useState()
	const [impExpFile, setimpExpFile] = useState()
	const [pwd, setPwd] = useState("")
	const childRef = useRef();
	useEffect(() => {
		if (exceData && Object.keys(exceData).length > 0) {
			setWb(exceData)
			getExcelData(exceData, 0)
		}
	}, [exceData])


	const workbookInit = (sp) => {
		setSpread(sp);
	}

	const loadExcel = (file) => {
		const reader = new FileReader();
		let excelIo = new IO();
		let sp = spread
		let excelFile = impExpFile;
		let password = pwd;

		excelIo.open(excelFile, function (json) {
			let workbookObj = json;

			sp.fromJSON(workbookObj, {
				incrementalLoading: {
					loading: function (progress, args) {
						progress = progress * 100;
						console.log("current loading sheet", args.sheet && args.sheet.name());
					},
					loaded: function () {
						console.log("Loaded")
					}
				}
			});

		}, function (e) {
			// process error
			alert(e.errorMessage);
		}, { password: password });
		// 	reader.onload = (e) => {
		// 		/* Parse data */
		// 		const ab = e.target.result;

		// 		const wb = read(ab, {type:'array',password:"Password1!"});
		// 		console.log(wb);
		// 		/* Get first worksheet */
		//   setWb(wb)
		// 		getExcelData(wb, 0)

		// 	};
		// 	reader.readAsArrayBuffer(file);
	}
	const getExcelData = (wb, i) => {
		const wsname = wb.SheetNames[i];
		const ws = wb.Sheets[wsname];
		/* Convert array of arrays */
		console.time()
		let data = utils.sheet_to_json(ws, { header: 1 });
		/* Update state */
		console.timeEnd()
		let col = []
		if (data.length > 0) {
			col = make_cols(ws['!ref'])
		}
		col.unshift({ name: "No", key: 0 })
		col = col.map((c, index) => {
			c.key = index
			return c
		})

		setCols(col)
		data = data.map((d, i) => {
			d.unshift(i)
			return d
		})
		setData(data);
	}
	const onChangeTab = (value) => {
		setData([])
		setCols([])
		let index = wb.SheetNames.findIndex(val => val == value)
		getExcelData(wb, index)
	}
	const exportFile = () => {
		/* convert state to workbook */
		const ws = utils.aoa_to_sheet(data);
		const wb = utils.book_new();
		utils.book_append_sheet(wb, ws, "SheetJS");
		writeFile(wb, "sheetjs.xlsx")
	};
	useEffect(() => {
		setData([])
		setCols([])
	}, [clear])
	function changeFileDemo(e) {
		setimpExpFile(e.target.files[0]);
	}
	return (
		<div class="sample-tutorial">
			<div class="sample-spreadsheets">
				<SpreadSheets workbookInitialized={workbookInit}>
					<Worksheet>
					</Worksheet>
				</SpreadSheets>
			</div>
			<div className="options-container">
				<div className="option-row">
					<div className="inputContainer">

						<Input type="file" id="fileDemo" className="input" onChange={e => changeFileDemo(e)} />
						
						<br />
						<Input type="password" id="password" placeholder="Password" onChange={e => setPwd(e.target.value)} />
						<br />

						<Input type="button" id="loadExcel" defaultValue="Load" className="button" onClick={e => loadExcel(e)} />
					</div>
				</div>
				
			</div>
		</div>

	);
}