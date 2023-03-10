var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// @ts-nocheck
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { XFlow, FlowchartCanvas, CanvasContextMenu, KeyBindings, uuidv4, FlowchartNodePanel, FlowchartFormPanel, CanvasScaleToolbar, FlowchartExtension,
// CanvasMiniMap,
 } from '@antv/xflow';
import { ToolbarPanel } from '../components/toolbar';
import { useMenuConfig } from '../components/menu';
import { setProps, setInstance, excLoadData } from '../util';
import { useCmdConfig, useKeybindingConfig } from './service';
import AppContext from '../context';
import { appendUtils } from './appendUtils';
import { DEFAULT_SCALE_TOOLBAR_PROPS } from './constants';
var Flowchart = function (props) {
    var _a = props, className = _a.className, style = _a.style, detailPanelProps = _a.detailPanelProps, toolbarPanelProps = _a.toolbarPanelProps, _b = _a.nodePanelProps, nodePanelProps = _b === void 0 ? {} : _b, _c = _a.scaleToolbarPanelProps, scaleToolbarPanelProps = _c === void 0 ? {} : _c, _d = _a.contextMenuPanelProps, contextMenuPanelProps = _d === void 0 ? {} : _d, _e = _a.canvasProps, canvasProps = _e === void 0 ? {} : _e, keyBindingProps = _a.keyBindingProps, 
    // miniMapProps = {},
    onAddNode = _a.onAddNode, onAddEdge = _a.onAddEdge, onConfigChange = _a.onConfigChange, onDestroy = _a.onDestroy, onConfigReady = _a.onConfigReady, isAutoCenter = _a.isAutoCenter, data = _a.data, edit= _a.edit, mode = _a.mode, onReady = _a.onReady;
    const [App, setApp] = useState()

    var uuidv4Ref = useRef(uuidv4());
    var container = useRef();
    setProps(props, uuidv4Ref.current, container);
    var _f = canvasProps.position, position = _f === void 0 ? { top: 40, left: 240, right: 240, bottom: 0 } : _f;
    // const { position: miniMapPosition = { bottom: 12, right: 12 }, show: showMinimMap = true } = miniMapProps;
    var graphRef = useRef();
    var menuConfig = useMenuConfig(contextMenuPanelProps);
    var commandConfig = useCmdConfig({
        flowchartId: uuidv4Ref.current,
    }); // ?????? getProps
    var keybindingConfig = keyBindingProps || useKeybindingConfig();
    var _g = scaleToolbarPanelProps.show, show = _g === void 0 ? true : _g;
    var _h = contextMenuPanelProps.show, showMenu = _h === void 0 ? true : _h;
    var loadData = useCallback(function (app) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (data) {
                    excLoadData(app, data);
                    setApp(app)
            }
            return [2 /*return*/];
        });
    }); }, [data]);
 

    useEffect(() => {


        if(App && !edit) {
               
            loadData(App)
        }
       
    }, [App, data, edit])
    useEffect(function () {
        return function () {
            var _a;
            (_a = graphRef.current) === null || _a === void 0 ? void 0 : _a.dispose();
        };
    }, []);
    return (React.createElement(AppContext.Provider, { value: { flowchartId: uuidv4Ref.current } },
        React.createElement("div", { className: "xflow-canvas-container", "data-flowchart-id": uuidv4Ref.current, ref: container, style: { width: '100%', height: '100%', backgroundColor: '#fff' } },
            React.createElement(XFlow, { className: className, style: style, commandConfig: commandConfig, onAppDestroy: onDestroy, isAutoCenter: isAutoCenter, onAppConfigReady: onConfigReady, onLoad: function (app) { return __awaiter(void 0, void 0, void 0, function () {
                setApp(app)
                
                var X6Graph;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, app.getGraphInstance()];
                            case 1:
                                X6Graph = (_a.sent());
                                setInstance(X6Graph, app, uuidv4Ref.current);
                                X6Graph.flowchartId = uuidv4Ref.current;
                                graphRef.current = X6Graph;
                                loadData(app);
                            

                                onReady === null || onReady === void 0 ? void 0 : onReady(appendUtils(X6Graph, app), app);
                                return [2 /*return*/];
                        }
                    });
                }); } },
                React.createElement(FlowchartExtension, null),
                React.createElement(ToolbarPanel, __assign({}, toolbarPanelProps, { flowchartId: uuidv4Ref.current })),
                React.createElement(FlowchartNodePanel, __assign({}, nodePanelProps)),
                React.createElement(FlowchartCanvas, { config: __assign(__assign({}, canvasProps), { onAddNode: onAddNode, onAddEdge: onAddEdge, onConfigChange: onConfigChange }), mode: mode, position: position },
                    show && React.createElement(CanvasScaleToolbar, __assign({}, Object.assign({}, DEFAULT_SCALE_TOOLBAR_PROPS, scaleToolbarPanelProps))),
                    showMenu && React.createElement(CanvasContextMenu, { config: menuConfig })),
                React.createElement(FlowchartFormPanel, __assign({}, detailPanelProps)),
                keyBindingProps !== false && React.createElement(KeyBindings, { config: keybindingConfig })))));
};
export default Flowchart;
